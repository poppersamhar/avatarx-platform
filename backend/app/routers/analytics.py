from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.database import SessionLocal, Avatar, Knowledge, Conversation, Team

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_analytics(db: Session = Depends(get_db)):
    total_avatars = db.query(Avatar).count()
    total_knowledge = db.query(Knowledge).count()
    total_conversations = db.query(Conversation).count()
    total_teams = db.query(Team).count()

    # Get top avatars by conversation count
    top_avatars = db.query(
        Avatar.id,
        Avatar.name,
        Avatar.personality,
        func.count(Conversation.id).label('conversation_count')
    ).outerjoin(Conversation, Avatar.id == Conversation.avatar_id)\
     .group_by(Avatar.id)\
     .order_by(func.count(Conversation.id).desc())\
     .limit(5)\
     .all()

    top_avatars_list = [
        {
            "id": avatar.id,
            "name": avatar.name,
            "personality": avatar.personality,
            "conversation_count": avatar.conversation_count
        }
        for avatar in top_avatars
    ]

    return {
        "total_avatars": total_avatars,
        "total_knowledge": total_knowledge,
        "total_conversations": total_conversations,
        "total_teams": total_teams,
        "top_avatars": top_avatars_list
    }
