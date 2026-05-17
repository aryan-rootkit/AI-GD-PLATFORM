import logging
from contextlib import asynccontextmanager

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routes.conversation import router as conversation_router
from routes.debug import router as debug_router
from routes.pipeline import router as pipeline_router
from routes.transcription import router as transcription_router
from routes.tts import router as tts_router
from services.piper_service import piper_service
from socket_handlers import sio
from utils.logging_config import setup_logging
from utils.ollama_health import check_ollama

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()
    settings = get_settings()
    ollama_status = await check_ollama()

    piper_env = piper_service.validate_environment()
    piper_ready = piper_service.is_available()
    logger.info(
        "AI service | port=%s mock=%s whisper_cpp=%s faster-whisper=enabled piper=%s",
        settings.ai_service_port,
        settings.mock_ai_pipeline,
        settings.whisper_cpp_configured,
        piper_ready,
    )
    logger.info("Piper env | exe=%s | model=%s", piper_env.get("executable_path"), piper_env.get("model_path"))

    piper_test = piper_service.run_startup_self_test()
    logger.info(
        "Piper self-test | success=%s | %s",
        piper_test.get("test_synthesis_success"),
        piper_test.get("test_message"),
    )
    if not piper_ready:
        logger.warning(
            "Piper not ready — use PIPER_BIN=./bin/piper/piper/piper.exe and run .\\scripts\\install-piper.ps1"
        )
    logger.info("Ollama status: %s", ollama_status)

    if not settings.mock_ai_pipeline and not ollama_status.get("reachable"):
        logger.warning(
            "Ollama is not reachable at %s — start with: ollama serve",
            settings.ollama_base_url,
        )

    yield
    logger.info("AI service shutting down")


app = FastAPI(
    title="ATHENA AI Voice Service",
    description="whisper.cpp / faster-whisper + Ollama + Piper TTS",
    version="1.1.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversation_router)
app.include_router(transcription_router)
app.include_router(tts_router)
app.include_router(pipeline_router)
app.include_router(debug_router)


@app.get("/health")
async def health():
    ollama_status = await check_ollama()
    return {
        "status": "ok",
        "port": settings.ai_service_port,
        "mock": settings.mock_ai_pipeline,
        "whisper_cpp_configured": settings.whisper_cpp_configured,
        "faster_whisper_model": settings.faster_whisper_model,
        "piper_configured": piper_service.is_available(),
        "piper_length_scale": settings.piper_length_scale,
        "piper_voice": "en_US-lessac-medium",
        "ollama": ollama_status,
    }


# Socket.IO must wrap FastAPI for realtime voice events
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:socket_app",
        host=settings.ai_service_host,
        port=settings.ai_service_port,
        reload=True,
    )
