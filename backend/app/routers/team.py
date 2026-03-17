from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
import os
from openai import OpenAI
from ..models.database import SessionLocal, Team, Avatar

router = APIRouter(prefix="/teams", tags=["teams"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TeamCreate(BaseModel):
    name: str
    description: str
    avatar_ids: List[int]
    router_avatar_id: int

class TeamResponse(BaseModel):
    id: int
    name: str
    description: str
    avatar_ids: List[int]
    router_avatar_id: int

    class Config:
        from_attributes = True

class TeamChatRequest(BaseModel):
    team_id: int
    message: str

class TeamChatResponse(BaseModel):
    response: str
    agent_name: str
    agent_id: int

@router.post("/", response_model=TeamResponse)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    db_team = Team(
        name=team.name,
        description=team.description,
        avatar_ids=json.dumps(team.avatar_ids),
        router_avatar_id=team.router_avatar_id
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)

    return {
        "id": db_team.id,
        "name": db_team.name,
        "description": db_team.description,
        "avatar_ids": json.loads(db_team.avatar_ids),
        "router_avatar_id": db_team.router_avatar_id
    }

@router.get("/", response_model=List[TeamResponse])
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    return [{
        "id": t.id,
        "name": t.name,
        "description": t.description,
        "avatar_ids": json.loads(t.avatar_ids),
        "router_avatar_id": t.router_avatar_id
    } for t in teams]

@router.delete("/{team_id}")
def delete_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
    return {"message": "Team deleted successfully"}

class TeamMemberUpdate(BaseModel):
    avatar_id: int

@router.post("/{team_id}/members", response_model=TeamResponse)
def add_team_member(team_id: int, member: TeamMemberUpdate, db: Session = Depends(get_db)):
    """添加团队成员"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    avatar_ids = json.loads(team.avatar_ids)
    if member.avatar_id in avatar_ids:
        raise HTTPException(status_code=400, detail="Member already in team")

    # 检查avatar是否存在
    avatar = db.query(Avatar).filter(Avatar.id == member.avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")

    avatar_ids.append(member.avatar_id)
    team.avatar_ids = json.dumps(avatar_ids)
    db.commit()
    db.refresh(team)

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "avatar_ids": json.loads(team.avatar_ids),
        "router_avatar_id": team.router_avatar_id
    }

@router.delete("/{team_id}/members/{avatar_id}", response_model=TeamResponse)
def remove_team_member(team_id: int, avatar_id: int, db: Session = Depends(get_db)):
    """移除团队成员"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    avatar_ids = json.loads(team.avatar_ids)
    if avatar_id not in avatar_ids:
        raise HTTPException(status_code=400, detail="Member not in team")

    # 至少保留2个成员
    if len(avatar_ids) <= 2:
        raise HTTPException(status_code=400, detail="Team must have at least 2 members")

    # 如果移除的是路由agent，需要重新指定
    if team.router_avatar_id == avatar_id:
        raise HTTPException(status_code=400, detail="Cannot remove router agent. Please change router first.")

    avatar_ids.remove(avatar_id)
    team.avatar_ids = json.dumps(avatar_ids)
    db.commit()
    db.refresh(team)

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "avatar_ids": json.loads(team.avatar_ids),
        "router_avatar_id": team.router_avatar_id
    }

@router.put("/{team_id}/router", response_model=TeamResponse)
def update_router(team_id: int, member: TeamMemberUpdate, db: Session = Depends(get_db)):
    """更换路由Agent"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    avatar_ids = json.loads(team.avatar_ids)
    if member.avatar_id not in avatar_ids:
        raise HTTPException(status_code=400, detail="Avatar must be a team member")

    team.router_avatar_id = member.avatar_id
    db.commit()
    db.refresh(team)

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "avatar_ids": json.loads(team.avatar_ids),
        "router_avatar_id": team.router_avatar_id
    }

