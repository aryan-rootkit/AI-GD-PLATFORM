import json
import logging
import re
from difflib import SequenceMatcher
from typing import Any, AsyncIterator, Dict, List, Optional

import httpx

from config import get_settings
from services.prompt_builder import build_system_prompt

logger = logging.getLogger(__name__)

# Legacy static fallback — avoid sending this verbatim when possible
_STATIC_FALLBACK = (
    "Thanks for sharing. Can you give one concrete example with a clear outcome?"
)


def _similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


def _contextual_fallback(
    user_message: str,
    history: List[Dict[str, str]],
    role: str,
    turn_count: int,
) -> str:
    snippet = (user_message or "").strip()[:120]
    if turn_count <= 1:
        return (
            f"Thanks for joining. To start — what drew you to the {role} role, "
            f"and what would you highlight from your background?"
        )
    if snippet:
        return (
            f"You mentioned \"{snippet[:60]}…\" — what was your specific contribution, "
            f"and what was the measurable result?"
        )
    return (
        "Could you walk me through one specific situation in more detail — "
        "what you did and what changed because of it?"
    )


class OllamaService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _build_messages(
        self,
        session: Dict[str, Any],
        history: List[Dict[str, str]],
        user_message: str,
    ) -> List[Dict[str, str]]:
        turn_count = sum(1 for m in history if m.get("role") == "user") + 1
        session_for_prompt = {**session, "messages": history}
        system_prompt = build_system_prompt(session_for_prompt, turn_count)

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message.strip()})

        return messages

    def _build_payload(
        self,
        messages: List[Dict[str, str]],
        stream: bool,
        *,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
    ) -> dict:
        settings = self.settings
        return {
            "model": settings.ollama_model,
            "messages": messages,
            "stream": stream,
            "options": {
                "num_predict": settings.ollama_num_predict,
                "temperature": temperature if temperature is not None else settings.ollama_temperature,
                "top_p": top_p if top_p is not None else settings.ollama_top_p,
            },
        }

    def _log_request(self, messages: List[Dict[str, str]], extra: str = "") -> None:
        history_len = max(0, len(messages) - 2)  # exclude system + latest user
        system_preview = (messages[0].get("content") or "")[:200] if messages else ""
        user_preview = (messages[-1].get("content") or "")[:200] if messages else ""
        logger.info(
            "Ollama request | model=%s history_turns=%s %s | system[:200]=%r | user[:200]=%r",
            self.settings.ollama_model,
            history_len,
            extra,
            system_preview,
            user_preview,
        )
        if logger.isEnabledFor(logging.DEBUG):
            logger.debug(
                "Ollama full messages (%s): %s",
                len(messages),
                json.dumps(
                    [{"role": m["role"], "content": (m["content"] or "")[:120]} for m in messages],
                    ensure_ascii=False,
                ),
            )

    def _is_repetitive(self, text: str, last_assistant: Optional[str]) -> bool:
        if not text or not last_assistant:
            return False
        if text.strip().lower() == last_assistant.strip().lower():
            return True
        if _similarity(text, last_assistant) >= 0.82:
            return True
        if _STATIC_FALLBACK.lower() in text.lower() and _STATIC_FALLBACK.lower() in last_assistant.lower():
            return True
        return False

    async def _request_stream(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: Optional[float] = None,
        top_p: Optional[float] = None,
    ) -> AsyncIterator[str]:
        settings = self.settings
        url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
        payload = self._build_payload(
            messages, stream=True, temperature=temperature, top_p=top_p
        )

        async with httpx.AsyncClient(
            timeout=settings.ollama_timeout_seconds
        ) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code >= 400:
                    body = await response.aread()
                    logger.error(
                        "Ollama HTTP %s | body=%s",
                        response.status_code,
                        body[:500],
                    )
                    response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    token = data.get("message", {}).get("content", "")
                    if token:
                        yield token

                    if data.get("done"):
                        break

    async def chat_stream(
        self,
        *,
        session: Dict[str, Any],
        history: List[Dict[str, str]],
        user_message: str,
        last_assistant: Optional[str] = None,
    ) -> AsyncIterator[str]:
        settings = self.settings
        role = session.get("role", "Software Engineer")
        user_name = session.get("userName", "Candidate")
        turn_count = sum(1 for m in history if m.get("role") == "user") + 1

        if settings.mock_ai_pipeline:
            mock = (
                f"Hi {user_name}, thanks for that. Regarding {role} — "
                f"what was the toughest challenge in that situation?"
            )
            for word in mock.split():
                yield word + " "
            return

        messages = self._build_messages(session, history, user_message)
        self._log_request(messages)

        temperature = settings.ollama_temperature
        top_p = settings.ollama_top_p

        for attempt in range(settings.ollama_max_retries + 1):
            parts: List[str] = []
            try:
                async for token in self._request_stream(
                    messages,
                    temperature=temperature,
                    top_p=top_p,
                ):
                    parts.append(token)

                text = re.sub(r"\s+", " ", "".join(parts).strip())

                if text and self._is_repetitive(text, last_assistant):
                    logger.warning(
                        "Ollama repetitive response (attempt %s) — regenerating",
                        attempt + 1,
                    )
                    reminder = (
                        f"\n\n[Reminder: Do NOT repeat your previous reply. "
                        f"The candidate just said: \"{user_message[:200]}\". "
                        f"Ask a NEW specific follow-up.]"
                    )
                    messages[-1]["content"] = user_message.strip() + reminder
                    temperature = min(0.95, temperature + 0.15)
                    top_p = min(0.98, top_p + 0.05)
                    continue

                if text:
                    logger.info(
                        "Ollama response | len=%s attempt=%s preview=%r",
                        len(text),
                        attempt + 1,
                        text[:160],
                    )
                    for token in parts:
                        yield token
                    return

                logger.warning(
                    "Ollama empty stream (attempt %s) — retrying",
                    attempt + 1,
                )
            except httpx.TimeoutException:
                logger.error(
                    "Ollama stream timed out after %ss (attempt %s)",
                    settings.ollama_timeout_seconds,
                    attempt + 1,
                )
            except httpx.HTTPError as exc:
                logger.error("Ollama stream failed (attempt %s): %s", attempt + 1, exc)

            temperature = min(0.95, temperature + 0.1)

        fallback = _contextual_fallback(user_message, history, role, turn_count)
        logger.warning(
            "Ollama fallback triggered | contextual | preview=%r",
            fallback[:120],
        )
        yield fallback

    async def chat(
        self,
        *,
        session: Dict[str, Any],
        history: List[Dict[str, str]],
        user_message: str,
        last_assistant: Optional[str] = None,
    ) -> str:
        parts: List[str] = []
        async for token in self.chat_stream(
            session=session,
            history=history,
            user_message=user_message,
            last_assistant=last_assistant,
        ):
            parts.append(token)

        text = "".join(parts).strip()
        if not text:
            turn_count = sum(1 for m in history if m.get("role") == "user") + 1
            text = _contextual_fallback(
                user_message,
                history,
                session.get("role", "Software Engineer"),
                turn_count,
            )
            logger.warning("Ollama chat empty — contextual fallback used")
        return text


ollama_service = OllamaService()
