import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services.ollama_service import ollama_service
from services.piper_service import piper_service
from services.session_service import session_service
from services.whisper_service import whisper_service
from utils.audio import cleanup_paths, to_wav_if_needed

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/turn")
async def pipeline_turn(
    file: UploadFile = File(...),
    session_id: str | None = Form(default=None),
    user_id: str = Form(default="test-user"),
    user_name: str = Form(default="Candidate"),
    role: str = Form(default="Software Engineer"),
):
    """Synchronous full pipeline test: audio → transcript → LLM → TTS."""
    suffix = Path(file.filename or "audio.webm").suffix or ".webm"
    temp_dir = Path("./temp_audio")
    temp_dir.mkdir(parents=True, exist_ok=True)
    input_path = temp_dir / f"pipeline_{file.filename or 'upload'}{suffix}"

    try:
        input_path.write_bytes(await file.read())
        wav_path = to_wav_if_needed(input_path)

        if not session_id:
            session = session_service.create(
                user_id=user_id,
                user_name=user_name,
                role=role,
                mode="interview",
            )
            session_id = session["sessionId"]
        else:
            session = session_service.get(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")

        transcript = await asyncio.to_thread(whisper_service.transcribe, wav_path)
        session_service.append_message(session_id, "user", transcript)

        session = session_service.get(session_id)
        history = session_service.get_ollama_history(session_id, exclude_last=True)
        last_assistant = session_service.get_last_assistant_message(session_id)

        ai_text = await ollama_service.chat(
            session=session,
            history=history,
            user_message=transcript,
            last_assistant=last_assistant,
        )
        session_service.append_message(session_id, "assistant", ai_text)

        tts_result = await asyncio.to_thread(piper_service.synthesize, ai_text)

        return {
            "success": True,
            "sessionId": session_id,
            "transcript": transcript,
            "aiText": ai_text,
            "audio": tts_result.audio_b64,
            "audioFormat": tts_result.format,
            "ttsFallback": tts_result.fallback,
            "ttsWarning": tts_result.warning,
        }
    except Exception as exc:
        logger.exception("Pipeline turn failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cleanup_paths(input_path)
