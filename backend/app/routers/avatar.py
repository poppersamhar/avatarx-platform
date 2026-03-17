from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from ..models.database import SessionLocal, Avatar

router = APIRouter(prefix="/avatars", tags=["avatars"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AvatarCreate(BaseModel):
    name: str
    template: str
    voice: str
    personality: str

class AvatarResponse(BaseModel):
    id: int
    name: str
    template: str
    voice: str
    personality: str

    class Config:
        from_attributes = True

@router.post("/", response_model=AvatarResponse)
def create_avatar(avatar: AvatarCreate, db: Session = Depends(get_db)):
    db_avatar = Avatar(**avatar.dict())
    db.add(db_avatar)
    db.commit()
    db.refresh(db_avatar)
    return db_avatar

@router.get("/", response_model=List[AvatarResponse])
def list_avatars(db: Session = Depends(get_db)):
    return db.query(Avatar).all()

@router.get("/{avatar_id}", response_model=AvatarResponse)
def get_avatar(avatar_id: int, db: Session = Depends(get_db)):
    avatar = db.query(Avatar).filter(Avatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return avatar

@router.delete("/{avatar_id}")
def delete_avatar(avatar_id: int, db: Session = Depends(get_db)):
    avatar = db.query(Avatar).filter(Avatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    db.delete(avatar)
    db.commit()
    return {"message": "Avatar deleted successfully"}

@router.put("/{avatar_id}", response_model=AvatarResponse)
def update_avatar(avatar_id: int, avatar: AvatarCreate, db: Session = Depends(get_db)):
    db_avatar = db.query(Avatar).filter(Avatar.id == avatar_id).first()
    if not db_avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    for key, value in avatar.dict().items():
        setattr(db_avatar, key, value)
    db.commit()
    db.refresh(db_avatar)
    return db_avatar

