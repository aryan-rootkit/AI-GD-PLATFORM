import base64
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from config import get_settings

logger = __import__("logging").getLogger(__name__)

SUPPORTED_EXTENSIONS = {".wav", ".webm", ".mp3", ".ogg", ".m4a"}


def decode_audio_payload(audio_b64: str, filename: str = "input.webm") -> Path:
    settings = get_settings()
    temp_dir = Path(settings.temp_audio_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(filename).suffix.lower() or ".webm"
    if suffix not in SUPPORTED_EXTENSIONS:
        suffix = ".webm"

    raw = base64.b64decode(audio_b64)
    out = temp_dir / f"upload_{Path(filename).stem}{suffix}"
    out.write_bytes(raw)
    return out


def to_wav_if_needed(source: Path) -> Path:
    if source.suffix.lower() == ".wav":
        return source

    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return source

    wav_path = source.with_suffix(".wav")
    try:
        subprocess.run(
            [ffmpeg, "-y", "-i", str(source), str(wav_path)],
            check=True,
            capture_output=True,
            timeout=60,
        )
        return wav_path
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        logger.warning("ffmpeg conversion failed: %s", exc)
        return source


def encode_audio_file(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("utf-8")


def cleanup_paths(*paths: Optional[Path]) -> None:
    for path in paths:
        if path and path.exists():
            try:
                path.unlink()
            except OSError:
                logger.debug("Could not remove temp file %s", path)
