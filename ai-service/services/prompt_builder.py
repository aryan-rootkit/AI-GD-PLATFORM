"""Build system prompts and interviewer personalities for Ollama."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
PERSONALITIES_DIR = PROMPTS_DIR / "personalities"

DEFAULT_STYLE = "technical"

STYLE_ALIASES = {
    "hr": "hr",
    "human resources": "hr",
    "behavioral": "hr",
    "technical": "technical",
    "tech": "technical",
    "engineering": "technical",
    "startup": "startup",
    "founder": "startup",
    "product": "startup",
    "corporate": "corporate",
    "strict": "corporate",
    "mnc": "corporate",
    "coach": "coach",
    "discussion": "coach",
    "gd": "coach",
}


def load_prompt(name: str) -> str:
    path = PROMPTS_DIR / f"{name}.txt"
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    return ""


def load_personality(style: str) -> str:
    key = STYLE_ALIASES.get(style.lower().strip(), style.lower().strip())
    path = PERSONALITIES_DIR / f"{key}.txt"
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    fallback = PERSONALITIES_DIR / f"{DEFAULT_STYLE}.txt"
    if fallback.exists():
        return fallback.read_text(encoding="utf-8").strip()
    return load_prompt("personality") or "You are a professional interviewer."


def resolve_interviewer_style(session: Dict[str, Any]) -> str:
    metadata = session.get("metadata") or {}
    explicit = metadata.get("interviewerStyle") or metadata.get("interview_style")
    if explicit:
        return str(explicit)

    mode = session.get("mode", "interview")
    if mode in ("discussion", "coach"):
        return "coach"

    role = (session.get("role") or "").lower()
    for token, style in STYLE_ALIASES.items():
        if token in role and style != "coach":
            return style
    return DEFAULT_STYLE


def build_conversation_summary(messages: List[Dict[str, str]], max_lines: int = 6) -> str:
    if not messages:
        return "This is the start of the interview. Greet briefly and ask an opening question."

    lines: List[str] = []
    for msg in messages[-max_lines:]:
        role = msg.get("role", "user")
        label = "Candidate" if role == "user" else "You (interviewer)"
        content = (msg.get("content") or "").strip()
        if content:
            lines.append(f"{label}: {content[:280]}")
    return "\n".join(lines) if lines else "No prior transcript."


def build_system_prompt(session: Dict[str, Any], turn_count: int) -> str:
    mode = session.get("mode", "interview")
    role = session.get("role", "Software Engineer")
    user_name = session.get("userName", "Candidate")
    questions: List[str] = session.get("questions") or []
    metadata = session.get("metadata") or {}

    subject = metadata.get("subject") or metadata.get("topic") or role
    company_type = metadata.get("companyType") or metadata.get("company_type") or ""
    difficulty = metadata.get("difficulty") or metadata.get("level") or ""

    style = resolve_interviewer_style(session)
    personality = load_personality(style)
    base_template = load_prompt("interviewer" if mode == "interview" else "coach")

    questions_block = (
        "\n".join(f"- {q}" for q in questions[:12])
        if questions
        else "- Use role-appropriate questions; do not repeat the same generic prompt."
    )

    messages = session.get("messages") or []
    summary = build_conversation_summary(
        [{"role": m.get("role"), "content": m.get("content", "")} for m in messages]
    )

    prompt = (
        base_template.replace("{{personality}}", personality)
        .replace("{{role}}", role)
        .replace("{{user_name}}", user_name)
        .replace("{{questions}}", questions_block)
        .replace("{{subject}}", str(subject))
        .replace("{{company_type}}", str(company_type) or "not specified")
        .replace("{{difficulty}}", str(difficulty) or "not specified")
        .replace("{{interviewer_style}}", style)
        .replace("{{turn_count}}", str(turn_count))
        .replace("{{conversation_summary}}", summary)
    )

    logger.debug(
        "Built system prompt | mode=%s style=%s turn=%s history_msgs=%s",
        mode,
        style,
        turn_count,
        len(messages),
    )
    return prompt
