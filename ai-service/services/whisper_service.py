import logging
import re
import subprocess
import tempfile
from pathlib import Path

from config import get_settings
from utils.audio import cleanup_paths, to_wav_if_needed

logger = logging.getLogger(__name__)

MOCK_TRANSCRIPT = (
    "I have experience building applications and working with cross-functional teams."
)


class WhisperService:
    def transcribe(self, audio_path: Path) -> str:
        settings = get_settings()

        if settings.mock_ai_pipeline:
            logger.info("Mock whisper transcript")
            return MOCK_TRANSCRIPT

        wav_path = to_wav_if_needed(audio_path)
        extra_cleanup = wav_path if wav_path != audio_path else None

        try:
            if settings.whisper_cpp_configured:
                return self._transcribe_cpp(wav_path, settings)
            return self._transcribe_faster(wav_path)
        finally:
            cleanup_paths(extra_cleanup)

    def _transcribe_cpp(self, wav_path: Path, settings) -> str:
        whisper_bin = Path(settings.whisper_cpp_bin)
        model_path = Path(settings.whisper_model_path)

        if not whisper_bin.exists():
            raise FileNotFoundError(f"WHISPER_CPP_BIN not found: {whisper_bin}")
        if not model_path.exists():
            raise FileNotFoundError(f"WHISPER_MODEL_PATH not found: {model_path}")

        with tempfile.TemporaryDirectory() as tmp:
            out_base = Path(tmp) / "out"
            cmd = [
                str(whisper_bin),
                "-m",
                str(model_path),
                "-f",
                str(wav_path),
                "-otxt",
                "-of",
                str(out_base),
                "--no-timestamps",
            ]
            subprocess.run(
                cmd,
                check=True,
                capture_output=True,
                text=True,
                timeout=settings.whisper_timeout_seconds,
            )
            txt_path = Path(f"{out_base}.txt")
            if not txt_path.exists():
                raise RuntimeError("whisper.cpp did not produce transcript output")
            text = txt_path.read_text(encoding="utf-8").strip()

        return self._normalize(text)

    def _transcribe_faster(self, wav_path: Path) -> str:
        try:
            from services.faster_whisper_service import get_faster_whisper_service

            text = get_faster_whisper_service().transcribe(wav_path)
            logger.info("Transcribed via faster-whisper (%d chars)", len(text))
            return self._normalize(text)
        except ImportError as exc:
            raise RuntimeError(
                "No whisper.cpp paths configured and faster-whisper is not installed. "
                "Run: pip install faster-whisper"
            ) from exc

    @staticmethod
    def _normalize(text: str) -> str:
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            raise RuntimeError("Whisper returned empty transcript")
        return text


whisper_service = WhisperService()
