import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from services.whisper_service import whisper_service
from utils.audio import cleanup_paths, to_wav_if_needed

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/transcription", tags=["transcription"])


@router.post("")
async def transcribe_audio(file: UploadFile = File(...)):
    suffix = Path(file.filename or "audio.webm").suffix or ".webm"
    temp_path = Path("./temp_audio") / f"http_{file.filename or 'upload'}{suffix}"
    temp_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        temp_path.write_bytes(await file.read())
        wav_path = to_wav_if_needed(temp_path)
        text = whisper_service.transcribe(wav_path)
        return {"success": True, "transcript": text}
    except Exception as exc:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cleanup_paths(temp_path)
