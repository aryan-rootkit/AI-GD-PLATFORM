import asyncio
import logging
from typing import Any, Dict

import socketio

from services.evaluation_service import evaluation_service
from services.ollama_service import ollama_service
from services.piper_service import piper_service
from services.session_service import session_service
from services.whisper_service import whisper_service
from utils.audio import cleanup_paths, decode_audio_payload

logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid, environ):
    logger.info("Socket connected: %s", sid)
    await sio.emit("connection_ready", {"ok": True}, to=sid)


@sio.event
async def disconnect(sid):
    logger.info("Socket disconnected: %s", sid)


@sio.event
async def join_session(sid, data: Dict[str, Any]):
    session_id = data.get("sessionId")
    if not session_id:
        await sio.emit("error", {"message": "sessionId required"}, to=sid)
        return

    session = session_service.get(session_id)
    if not session:
        await sio.emit("error", {"message": "Session not found"}, to=sid)
        return

    await sio.enter_room(sid, session_id)
    turn = session_service.get_turn_count(session_id)
    logger.info(
        "Session joined | id=%s mode=%s role=%s turns=%s",
        session_id,
        session.get("mode"),
        session.get("role"),
        turn,
    )
    await sio.emit(
        "session_joined",
        {"sessionId": session_id, "mode": session.get("mode")},
        to=sid,
    )


async def _stream_ollama_response(session_id: str, transcript: str) -> str:
    session = session_service.get(session_id)
    if not session:
        raise ValueError(f"Session not found: {session_id}")

    history = session_service.get_ollama_history(session_id, exclude_last=True)
    last_assistant = session_service.get_last_assistant_message(session_id)
    turn = session_service.get_turn_count(session_id)

    logger.info(
        "LLM turn | session=%s turn=%s history_msgs=%s user_len=%s",
        session_id,
        turn,
        len(history),
        len(transcript),
    )

    await sio.emit("ai_response_start", {"role": "assistant"}, room=session_id)

    full_text = ""
    async for delta in ollama_service.chat_stream(
        session=session,
        history=history,
        user_message=transcript,
        last_assistant=last_assistant,
    ):
        full_text += delta
        await sio.emit(
            "ai_response_chunk",
            {"role": "assistant", "delta": delta, "text": full_text},
            room=session_id,
        )

    full_text = full_text.strip()
    if not full_text:
        from services.ollama_service import _contextual_fallback

        full_text = _contextual_fallback(
            transcript,
            history,
            session.get("role", "Software Engineer"),
            turn,
        )
        logger.warning("Empty AI text after stream — socket contextual fallback")

    session_service.append_message(session_id, "assistant", full_text)
    await sio.emit(
        "ai_response_text",
        {"role": "assistant", "text": full_text, "done": True},
        room=session_id,
    )
    return full_text


@sio.event
async def user_audio(sid, data: Dict[str, Any]):
    session_id = data.get("sessionId")
    audio_b64 = data.get("audio")
    filename = data.get("filename", "recording.webm")

    if not session_id or not audio_b64:
        await sio.emit("error", {"message": "sessionId and audio required"}, to=sid)
        return

    session = session_service.get(session_id)
    if not session:
        await sio.emit("error", {"message": "Session not found"}, to=sid)
        return

    await sio.emit("processing", {"stage": "transcribing"}, room=session_id)

    audio_path = None
    try:
        audio_path = decode_audio_payload(audio_b64, filename)
        transcript = await asyncio.to_thread(whisper_service.transcribe, audio_path)
        transcript = (transcript or "").strip()

        if not transcript:
            await sio.emit(
                "error",
                {"message": "Could not transcribe audio. Please speak clearly and try again."},
                to=sid,
            )
            await sio.emit("processing", {"stage": "idle"}, room=session_id)
            return

        session_service.append_message(session_id, "user", transcript)
        await sio.emit(
            "transcript_ready",
            {"role": "user", "text": transcript},
            room=session_id,
        )

        await sio.emit("processing", {"stage": "thinking"}, room=session_id)

        ai_text = await _stream_ollama_response(session_id, transcript)

        await sio.emit("processing", {"stage": "speaking"}, room=session_id)
        tts_result = await asyncio.to_thread(piper_service.synthesize, ai_text)

        if tts_result.warning:
            logger.warning("Piper fallback: %s", tts_result.warning)

        if tts_result.success and tts_result.audio_b64:
            await sio.emit(
                "ai_response_audio",
                {
                    "audio": tts_result.audio_b64,
                    "format": tts_result.format,
                    "fallback": False,
                },
                room=session_id,
            )
        else:
            await sio.emit(
                "ai_response_audio",
                {
                    "audio": "",
                    "format": "wav",
                    "fallback": True,
                    "text": ai_text,
                    "warning": tts_result.warning or "Piper unavailable — browser TTS",
                },
                room=session_id,
            )

        await sio.emit("processing", {"stage": "idle"}, room=session_id)
    except Exception as exc:
        logger.exception("user_audio pipeline failed")
        await sio.emit(
            "error",
            {"message": "Audio processing failed", "detail": str(exc)},
            to=sid,
        )
        await sio.emit("processing", {"stage": "idle"}, room=session_id)
    finally:
        cleanup_paths(audio_path)


@sio.event
async def end_session(sid, data: Dict[str, Any]):
    session_id = data.get("sessionId")
    if not session_id:
        await sio.emit("error", {"message": "sessionId required"}, to=sid)
        return

    session = session_service.get(session_id)
    if not session:
        await sio.emit("error", {"message": "Session not found"}, to=sid)
        return

    evaluation = evaluation_service.evaluate(session.get("messages", []))
    session_service.set_metadata(session_id, "evaluation", evaluation)

    await sio.emit(
        "session_feedback",
        {"sessionId": session_id, "evaluation": evaluation},
        room=session_id,
    )
