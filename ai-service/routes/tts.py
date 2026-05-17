import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.piper_service import piper_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tts", tags=["tts"])


class TtsRequest(BaseModel):
    text: str


@router.post("")
async def synthesize(body: TtsRequest):
    result = piper_service.synthesize(body.text)
    if result.success:
        return {
            "success": True,
            "audio": result.audio_b64,
            "format": result.format,
            "fallback": False,
        }
    return {
        "success": False,
        "audio": "",
        "format": "wav",
        "fallback": True,
        "warning": result.warning,
    }
