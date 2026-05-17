from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ai_service_host: str = "0.0.0.0"
    ai_service_port: int = 8001
    ai_service_cors_origins: str = (
        "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    )

    # whisper.cpp
    whisper_cpp_bin: str = ""
    whisper_model_path: str = ""
    whisper_timeout_seconds: int = 90

    # faster-whisper (Python fallback — used when whisper.cpp paths are empty)
    faster_whisper_model: str = "small.en"
    faster_whisper_device: str = "cpu"
    faster_whisper_compute_type: str = "int8"
    faster_whisper_beam_size: int = 5
    faster_whisper_language: str = "en"
    faster_whisper_vad_filter: bool = True
    faster_whisper_condition_on_previous_text: bool = False

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "phi3:mini"
    ollama_timeout_seconds: int = 60
    ollama_num_predict: int = 120
    ollama_temperature: float = 0.72
    ollama_top_p: float = 0.9
    ollama_max_history_messages: int = 24
    ollama_max_retries: int = 2

    piper_bin: str = ""
    piper_model_path: str = ""
    piper_length_scale: float = 1.1
    piper_noise_scale: float = 0.667
    piper_noise_w: float = 0.8
    piper_timeout_seconds: int = 45

    sessions_dir: str = "./sessions"
    temp_audio_dir: str = "./temp_audio"

    # When true, all components use safe fallbacks (no external binaries required)
    mock_ai_pipeline: bool = False

    log_level: str = "INFO"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ai_service_cors_origins.split(",") if o.strip()]

    @property
    def whisper_cpp_configured(self) -> bool:
        return bool(self.whisper_cpp_bin and self.whisper_model_path)

    @property
    def piper_configured(self) -> bool:
        """Prefer piper_service.is_available() for runtime checks."""
        root = Path(__file__).resolve().parent
        model = Path(self.piper_model_path) if self.piper_model_path else root / "voices" / "en_US-lessac-medium.onnx"
        if not model.is_absolute():
            model = root / model
        exe_candidates = [
            Path(self.piper_bin) if self.piper_bin else root / "bin" / "piper" / "piper" / "piper.exe",
            root / "bin" / "piper" / "piper" / "piper.exe",
        ]
        for exe in exe_candidates:
            p = (root / exe) if not exe.is_absolute() else exe
            if p.exists() and (p.parent / "espeak-ng.dll").exists():
                return model.exists()
        return False


@lru_cache
def get_settings() -> Settings:
    return Settings()
