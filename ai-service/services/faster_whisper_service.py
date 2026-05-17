import logging
from pathlib import Path
from typing import Optional

from config import get_settings

logger = logging.getLogger(__name__)

_model = None


def _get_model():
    global _model
    if _model is not None:
        return _model

    from faster_whisper import WhisperModel

    settings = get_settings()
    logger.info(
        "Loading faster-whisper model=%s device=%s compute=%s",
        settings.faster_whisper_model,
        settings.faster_whisper_device,
        settings.faster_whisper_compute_type,
    )
    _model = WhisperModel(
        settings.faster_whisper_model,
        device=settings.faster_whisper_device,
        compute_type=settings.faster_whisper_compute_type,
    )
    return _model


class FasterWhisperService:
    def transcribe(self, audio_path: Path) -> str:
        settings = get_settings()
        model = _get_model()

        segments, info = model.transcribe(
            str(audio_path),
            beam_size=settings.faster_whisper_beam_size,
            language=settings.faster_whisper_language,
            vad_filter=settings.faster_whisper_vad_filter,
            condition_on_previous_text=settings.faster_whisper_condition_on_previous_text,
        )

        text = " ".join(segment.text.strip() for segment in segments).strip()
        if not text:
            raise RuntimeError("faster-whisper returned empty transcript")

        logger.info(
            "Transcribed via faster-whisper | lang=%s prob=%.2f chars=%d",
            info.language,
            info.language_probability,
            len(text),
        )
        return text


faster_whisper_service: Optional[FasterWhisperService] = None


def get_faster_whisper_service() -> FasterWhisperService:
    global faster_whisper_service
    if faster_whisper_service is None:
        faster_whisper_service = FasterWhisperService()
    return faster_whisper_service
