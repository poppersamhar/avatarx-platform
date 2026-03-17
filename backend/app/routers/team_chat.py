from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import chromadb
import os
import json
from openai import OpenAI
from ..models.database import SessionLocal, Conversation, Avatar, Team

router = APIRouter(prefix="/team-chat", tags=["team-chat"])

chroma_client = chromadb.PersistentClient(path=os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TeamChatRequest(BaseModel):
    team_id: int
    message: str

class TeamChatResponse(BaseModel):
    avatar_name: str
    response: str
    routed_to: int

@router.post("/", response_model=TeamChatResponse)
def team_chat(request: TeamChatRequest, db: Session = Depends(get_db)):
    client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url=os.getenv("DEEPSEEK_BASE_URL"))

    team = db.query(Team).filter(Team.id == request.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    router_avatar = db.query(Avatar).filter(Avatar.id == team.router_avatar_id).first()
    avatar_ids = json.loads(team.avatar_ids)

    route_prompt = f"""你是{router_avatar.name}，负责将用户问题分配给合适的团队成员。
团队成员ID: {avatar_ids}
用户问题: {request.message}

请只返回最合适的成员ID（数字），不要有其他内容。"""

    route_response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": route_prompt}]
    )

    try:
        target_avatar_id = int(route_response.choices[0].message.content.strip())
    except:
        target_avatar_id = avatar_ids[0]

    target_avatar = db.query(Avatar).filter(Avatar.id == target_avatar_id).first()
    collection = chroma_client.get_or_create_collection(f"avatar_{target_avatar_id}")
    results = collection.query(query_texts=[request.message], n_results=3)

    context = "\n".join(results['documents'][0]) if results['documents'] else ""
    system_prompt = f"你是{target_avatar.name}，{target_avatar.personality}"
    user_prompt = f"参考知识：{context}\n\n用户问题：{request.message}" if context else request.message

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    bot_message = response.choices[0].message.content

    db.add(Conversation(avatar_id=target_avatar_id, user_message=request.message, bot_message=bot_message))
    db.commit()

    return {
        "avatar_name": target_avatar.name,
        "response": bot_message,
        "routed_to": target_avatar_id
    }
