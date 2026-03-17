from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import chromadb
from PyPDF2 import PdfReader
import os
from ..models.database import SessionLocal, Knowledge

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

chroma_client = chromadb.PersistentClient(path=os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class KnowledgeResponse(BaseModel):
    id: int
    avatar_id: int
    filename: str
    created_at: str

    class Config:
        from_attributes = True

@router.post("/{avatar_id}/upload")
async def upload_knowledge(avatar_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()

    if file.filename.endswith('.pdf'):
        text = extract_pdf_text(content)
    else:
        text = content.decode('utf-8')

    collection = chroma_client.get_or_create_collection(f"avatar_{avatar_id}")
    chunks = chunk_text(text)
    collection.add(documents=chunks, ids=[f"{file.filename}_{i}" for i in range(len(chunks))])

    db_knowledge = Knowledge(avatar_id=avatar_id, filename=file.filename, content=text)
    db.add(db_knowledge)
    db.commit()

    return {"message": "Knowledge uploaded successfully"}

@router.get("/{avatar_id}", response_model=List[KnowledgeResponse])
def list_knowledge(avatar_id: int, db: Session = Depends(get_db)):
    return db.query(Knowledge).filter(Knowledge.avatar_id == avatar_id).all()

def extract_pdf_text(content: bytes) -> str:
    from io import BytesIO
    reader = PdfReader(BytesIO(content))
    return "\n".join([page.extract_text() for page in reader.pages])

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]
