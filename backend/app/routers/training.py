from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import os
from openai import OpenAI
from ..models.database import SessionLocal, Avatar, Conversation

router = APIRouter(prefix="/training", tags=["training"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TrainingExample(BaseModel):
    question: str
    answer: str

class TrainingRequest(BaseModel):
    avatar_id: int
    examples: List[TrainingExample]

class TrainingResponse(BaseModel):
    message: str
    examples_count: int

@router.post("/", response_model=TrainingResponse)
def train_avatar(request: TrainingRequest, db: Session = Depends(get_db)):
    """
    实时训练虚拟人 - 添加训练样本到对话历史
    这些样本会被用于后续的对话生成
    """
    avatar = db.query(Avatar).filter(Avatar.id == request.avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    # 将训练样本存储为对话历史
    for example in request.examples:
        conversation = Conversation(
            avatar_id=request.avatar_id,
            user_message=example.question,
            bot_message=example.answer
        )
        db.add(conversation)

    db.commit()

    return {
        "message": f"成功添加 {len(request.examples)} 条训练样本",
        "examples_count": len(request.examples)
    }

@router.get("/{avatar_id}/history")
def get_training_history(avatar_id: int, db: Session = Depends(get_db)):
    """
    获取虚拟人的训练历史（对话记录）
    """
    conversations = db.query(Conversation).filter(
        Conversation.avatar_id == avatar_id
    ).order_by(Conversation.timestamp.desc()).limit(50).all()

    return [{
        "id": c.id,
        "question": c.user_message,
        "answer": c.bot_message,
        "timestamp": c.timestamp.isoformat()
    } for c in conversations]

@router.delete("/{avatar_id}/history/{conversation_id}")
def delete_training_example(avatar_id: int, conversation_id: int, db: Session = Depends(get_db)):
    """
    删除特定的训练样本
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.avatar_id == avatar_id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Training example not found")

    db.delete(conversation)
    db.commit()

    return {"message": "Training example deleted successfully"}
