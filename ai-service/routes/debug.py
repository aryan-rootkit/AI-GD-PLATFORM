import logging

from fastapi import APIRouter

from services.piper_service import piper_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["debug"])


@router.get("/debug/piper")
async def debug_piper():
    env_status = piper_service.validate_environment()
    test_result = piper_service.run_startup_self_test()

    return {
        "piper_detected": env_status["piper_detected"],
        "model_detected": env_status["model_detected"],
        "json_detected": env_status["json_detected"],
        "executable_exists": env_status["executable_exists"],
        "executable_path": env_status.get("executable_path"),
        "working_dir": env_status.get("working_dir"),
        "model_path": env_status.get("model_path"),
        "test_synthesis_success": test_result.get("test_synthesis_success", False),
        "test_message": test_result.get("test_message"),
        "test_warning": test_result.get("test_warning"),
        "is_ready": env_status["is_ready"],
        "details": test_result,
    }
