from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import chromadb
import os
from openai import OpenAI
from ..models.database import SessionLocal, Conversation, Avatar

router = APIRouter(prefix="/chat", tags=["chat"])

chroma_client = chromadb.PersistentClient(path=os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ChatRequest(BaseModel):
    avatar_id: int
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url=os.getenv("DEEPSEEK_BASE_URL"))

    avatar = db.query(Avatar).filter(Avatar.id == request.avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    collection = chroma_client.get_or_create_collection(f"avatar_{request.avatar_id}")
    results = collection.query(query_texts=[request.message], n_results=3)

    context = "\n".join(results['documents'][0]) if results['documents'] else ""

    system_prompt = f"你是{avatar.name}，{avatar.personality}"
    user_prompt = f"参考知识：{context}\n\n用户问题：{request.message}" if context else request.message

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    bot_message = response.choices[0].message.content

    db.add(Conversation(avatar_id=request.avatar_id, user_message=request.message, bot_message=bot_message))
    db.commit()

    return {"response": bot_message}
