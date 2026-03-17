from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .models.database import init_db
from .routers import avatar, knowledge, chat, analytics, team, team_chat, wizard, training

load_dotenv()

app = FastAPI(title="实时虚拟人开放平台 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

app.include_router(avatar.router)
app.include_router(knowledge.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(team.router)
app.include_router(team_chat.router)
app.include_router(wizard.router)
app.include_router(training.router)

@app.get("/")
def read_root():
    return {"message": "实时虚拟人开放平台 API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
