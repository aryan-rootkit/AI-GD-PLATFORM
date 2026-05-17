# ATHENA AI Voice Service

Python FastAPI + Socket.IO microservice for realtime mock interviews and group discussions.

**Pipeline:** Audio → faster-whisper (STT) → Ollama (LLM) → Piper (TTS)

## Run

```powershell
cd ai-service
.\venv\Scripts\activate
python -m uvicorn main:socket_app --reload --port 8001
```

## Health

`GET http://localhost:8001/health`

## Configuration

See `.env` — Ollama model, Piper paths, whisper settings, and `MOCK_AI_PIPELINE` for offline UI testing.
