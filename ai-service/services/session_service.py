import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional
from uuid import uuid4

from config import get_settings

logger = logging.getLogger(__name__)

SessionMode = Literal["interview", "discussion", "coach"]

# In-memory cache for active sessions (read-through from disk)
_memory_cache: Dict[str, Dict[str, Any]] = {}


class SessionService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_dir = Path(self.settings.sessions_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, session_id: str) -> Path:
        return self.base_dir / f"{session_id}.json"

    def create(
        self,
        *,
        user_id: str,
        mode: SessionMode = "interview",
        interview_id: Optional[str] = None,
        role: str = "Software Engineer",
        questions: Optional[List[str]] = None,
        user_name: str = "Candidate",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        session_id = str(uuid4())
        now = datetime.now(timezone.utc).isoformat()
        payload = {
            "sessionId": session_id,
            "userId": user_id,
            "interviewId": interview_id,
            "mode": mode,
            "role": role,
            "userName": user_name,
            "questions": questions or [],
            "messages": [],
            "createdAt": now,
            "updatedAt": now,
            "metadata": metadata or {},
        }
        self._save(payload)
        logger.info("Created session %s mode=%s role=%s", session_id, mode, role)
        return payload

    def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        if session_id in _memory_cache:
            return _memory_cache[session_id]

        path = self._path(session_id)
        if not path.exists():
            return None
        session = json.loads(path.read_text(encoding="utf-8"))
        _memory_cache[session_id] = session
        return session

    def append_message(
        self, session_id: str, role: str, content: str
    ) -> Dict[str, Any]:
        session = self.get(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")

        normalized_role = "assistant" if role == "assistant" else "user"
        session["messages"].append(
            {
                "role": normalized_role,
                "content": content.strip(),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        session["updatedAt"] = datetime.now(timezone.utc).isoformat()
        self._save(session)
        return session

    def get_conversation_history(self, session_id: str) -> List[Dict[str, str]]:
        session = self.get(session_id)
        if not session:
            return []
        return self._normalize_messages(session.get("messages", []))

    def get_ollama_history(
        self,
        session_id: str,
        *,
        exclude_last: bool = False,
        max_messages: Optional[int] = None,
    ) -> List[Dict[str, str]]:
        """Return user/assistant messages for Ollama (no system role)."""
        session = self.get(session_id)
        if not session:
            return []

        limit = max_messages or get_settings().ollama_max_history_messages
        messages = self._normalize_messages(session.get("messages", []))

        if exclude_last and messages:
            messages = messages[:-1]

        return messages[-limit:]

    def get_turn_count(self, session_id: str) -> int:
        session = self.get(session_id)
        if not session:
            return 0
        return sum(1 for m in session.get("messages", []) if m.get("role") == "user")

    def get_last_assistant_message(self, session_id: str) -> Optional[str]:
        session = self.get(session_id)
        if not session:
            return None
        for msg in reversed(session.get("messages", [])):
            if msg.get("role") == "assistant":
                return (msg.get("content") or "").strip()
        return None

    def set_metadata(self, session_id: str, key: str, value: Any) -> None:
        session = self.get(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        session.setdefault("metadata", {})[key] = value
        session["updatedAt"] = datetime.now(timezone.utc).isoformat()
        self._save(session)

    def update_metadata(self, session_id: str, patch: Dict[str, Any]) -> None:
        session = self.get(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        session.setdefault("metadata", {}).update(patch)
        session["updatedAt"] = datetime.now(timezone.utc).isoformat()
        self._save(session)

    def _normalize_messages(self, raw: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        out: List[Dict[str, str]] = []
        for m in raw:
            role = m.get("role", "user")
            if role not in ("user", "assistant"):
                role = "assistant" if role in ("ai", "interviewer", "model") else "user"
            content = (m.get("content") or "").strip()
            if content:
                out.append({"role": role, "content": content})
        return out

    def _save(self, payload: Dict[str, Any]) -> None:
        sid = payload["sessionId"]
        _memory_cache[sid] = payload
        self._path(sid).write_text(
            json.dumps(payload, indent=2), encoding="utf-8"
        )


session_service = SessionService()
