import logging
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ollama_service import ollama_service
from services.session_service import session_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/conversation", tags=["conversation"])


class CreateSessionRequest(BaseModel):
    userId: str
    userName: str = "Candidate"
    mode: Literal["interview", "discussion", "coach"] = "interview"
    interviewId: Optional[str] = None
    role: str = "Software Engineer"
    questions: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None
    interviewerStyle: Optional[str] = None
    subject: Optional[str] = None
    companyType: Optional[str] = None
    difficulty: Optional[str] = None


class ChatRequest(BaseModel):
    sessionId: str
    message: str


@router.post("/sessions")
async def create_session(body: CreateSessionRequest):
    metadata = dict(body.metadata or {})
    if body.interviewerStyle:
        metadata["interviewerStyle"] = body.interviewerStyle
    if body.subject:
        metadata["subject"] = body.subject
    if body.companyType:
        metadata["companyType"] = body.companyType
    if body.difficulty:
        metadata["difficulty"] = body.difficulty

    session = session_service.create(
        user_id=body.userId,
        mode=body.mode,
        interview_id=body.interviewId,
        role=body.role,
        questions=body.questions,
        user_name=body.userName,
        metadata=metadata,
    )
    return {"success": True, "session": session}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = session_service.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True, "session": session}


@router.post("/chat")
async def chat(body: ChatRequest):
    session = session_service.get(body.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session_service.append_message(body.sessionId, "user", body.message)
    history = session_service.get_ollama_history(body.sessionId, exclude_last=True)
    last_assistant = session_service.get_last_assistant_message(body.sessionId)

    reply = await ollama_service.chat(
        session=session,
        history=history,
        user_message=body.message,
        last_assistant=last_assistant,
    )

    session_service.append_message(body.sessionId, "assistant", reply)
    return {"success": True, "reply": reply}
