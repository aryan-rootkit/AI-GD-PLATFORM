import logging

import httpx

from config import get_settings

logger = logging.getLogger(__name__)


async def check_ollama() -> dict:
    settings = get_settings()
    base = settings.ollama_base_url.rstrip("/")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            tags = await client.get(f"{base}/api/tags")
            tags.raise_for_status()
            models = [m.get("name", "") for m in tags.json().get("models", [])]
            model_available = any(
                settings.ollama_model in name for name in models
            )
            return {
                "reachable": True,
                "model": settings.ollama_model,
                "model_available": model_available,
                "models": models[:10],
            }
    except httpx.HTTPError as exc:
        logger.warning("Ollama health check failed: %s", exc)
        return {
            "reachable": False,
            "model": settings.ollama_model,
            "model_available": False,
            "error": str(exc),
        }
