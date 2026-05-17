import logging
import re
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from config import get_settings
from utils.audio import cleanup_paths, encode_audio_file

logger = logging.getLogger(__name__)

_TTS_CLEAN_RE = re.compile(r"[\*#_\[\]`]+")

# Windows DLLs required next to piper.exe
_WINDOWS_DLLS = ("espeak-ng.dll", "onnxruntime.dll", "piper_phonemize.dll")


@dataclass
class PiperPaths:
    executable: Optional[Path]
    working_dir: Optional[Path]
    model: Path
    model_json: Path

    @property
    def executable_exists(self) -> bool:
        return bool(self.executable and self.executable.exists())

    @property
    def model_exists(self) -> bool:
        return self.model.exists()

    @property
    def json_exists(self) -> bool:
        return self.model_json.exists()

    @property
    def is_ready(self) -> bool:
        return (
            self.executable_exists
            and self.model_exists
            and self.json_exists
            and self.working_dir is not None
        )


@dataclass
class PiperSynthesisResult:
    success: bool
    audio_b64: str = ""
    format: str = "wav"
    fallback: bool = False
    warning: Optional[str] = None
    return_code: Optional[int] = None
    stderr: Optional[str] = None

    def as_tuple(self) -> tuple[str, str]:
        """Backward-compatible (audio_b64, format)."""
        return self.audio_b64, self.format


class PiperService:
    def __init__(self) -> None:
        self._service_root = Path(__file__).resolve().parent.parent

    def resolve_paths(self) -> PiperPaths:
        settings = get_settings()
        root = self._service_root

        model = (
            Path(settings.piper_model_path)
            if settings.piper_model_path
            else root / "voices" / "en_US-lessac-medium.onnx"
        )
        if not model.is_absolute():
            model = (root / model).resolve()
        else:
            model = model.resolve()

        model_json = model.with_suffix(".onnx.json")

        candidates: list[Path] = []
        if settings.piper_bin:
            p = Path(settings.piper_bin)
            candidates.append((root / p) if not p.is_absolute() else p)

        piper_root = root / "bin" / "piper"
        candidates.extend(
            [
                piper_root / "piper" / "piper.exe",
                piper_root / "piper.exe",
            ]
        )
        if piper_root.exists():
            candidates.extend(piper_root.rglob("piper.exe"))

        seen: set[str] = set()
        executable: Optional[Path] = None
        working_dir: Optional[Path] = None

        for candidate in candidates:
            try:
                resolved = candidate.resolve()
            except OSError:
                continue
            key = str(resolved).lower()
            if key in seen or not resolved.exists():
                continue
            seen.add(key)

            if self._is_runnable_piper(resolved):
                executable = resolved
                working_dir = resolved.parent
                break

        return PiperPaths(
            executable=executable,
            working_dir=working_dir,
            model=model,
            model_json=model_json,
        )

    @staticmethod
    def _is_runnable_piper(executable: Path) -> bool:
        if not executable.is_file():
            return False
        dll_dir = executable.parent
        return any((dll_dir / name).exists() for name in _WINDOWS_DLLS)

    def validate_environment(self) -> dict:
        paths = self.resolve_paths()
        settings = get_settings()

        return {
            "piper_detected": paths.executable_exists,
            "model_detected": paths.model_exists,
            "json_detected": paths.json_exists,
            "executable_exists": paths.executable_exists,
            "executable_path": str(paths.executable) if paths.executable else None,
            "working_dir": str(paths.working_dir) if paths.working_dir else None,
            "model_path": str(paths.model),
            "model_json_path": str(paths.model_json),
            "env_piper_bin": settings.piper_bin,
            "env_piper_model_path": settings.piper_model_path,
            "length_scale": settings.piper_length_scale,
            "noise_scale": settings.piper_noise_scale,
            "noise_w": settings.piper_noise_w,
            "is_ready": paths.is_ready,
        }

    def _prepare_text(self, text: str) -> str:
        return _TTS_CLEAN_RE.sub("", text).strip()

    def synthesize(self, text: str) -> PiperSynthesisResult:
        settings = get_settings()

        if settings.mock_ai_pipeline:
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning="Mock AI pipeline enabled — browser TTS fallback",
            )

        paths = self.resolve_paths()
        speech = self._prepare_text(text)

        if not speech:
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning="Empty text after TTS cleanup",
            )

        validation_error = self._validate_before_run(paths)
        if validation_error:
            logger.warning("Piper validation failed: %s", validation_error)
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning=validation_error,
            )

        out_path: Optional[Path] = None
        try:
            with tempfile.TemporaryDirectory() as tmp:
                out_path = Path(tmp).resolve() / "response.wav"
                result = self._run_piper(paths, speech, out_path, settings)

                if not result.success:
                    return result

                if not out_path.exists() or out_path.stat().st_size < 44:
                    logger.error("Piper output missing or too small: %s", out_path)
                    return PiperSynthesisResult(
                        success=False,
                        fallback=True,
                        warning="Piper did not produce valid WAV output",
                        stderr=result.stderr,
                        return_code=result.return_code,
                    )

                encoded = encode_audio_file(out_path)
                logger.info(
                    "Piper TTS OK | exe=%s wav=%s bytes=%d chars=%d",
                    paths.executable,
                    out_path,
                    out_path.stat().st_size,
                    len(speech),
                )
                return PiperSynthesisResult(
                    success=True,
                    audio_b64=encoded,
                    format="wav",
                    fallback=False,
                )
        except Exception as exc:
            logger.exception("Piper synthesis unexpected error")
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning=f"Piper error: {exc}",
            )
        finally:
            cleanup_paths(out_path)

    def _validate_before_run(self, paths: PiperPaths) -> Optional[str]:
        if not paths.executable or not paths.executable_exists:
            return (
                "Piper executable not found. Set PIPER_BIN to "
                "./bin/piper/piper/piper.exe (folder with espeak-ng.dll)"
            )
        if not paths.model_exists:
            return f"Voice model not found: {paths.model}"
        if not paths.json_exists:
            return f"Voice model JSON not found: {paths.model_json}"
        if not paths.working_dir or not paths.working_dir.exists():
            return "Piper working directory is invalid"
        if not self._is_runnable_piper(paths.executable):
            return (
                f"Piper at {paths.executable} cannot load DLLs. "
                f"Use {self._service_root / 'bin/piper/piper/piper.exe'}"
            )
        return None

    def _run_piper(
        self,
        paths: PiperPaths,
        speech: str,
        out_path: Path,
        settings,
    ) -> PiperSynthesisResult:
        assert paths.executable is not None
        assert paths.working_dir is not None

        model_abs = str(paths.model.resolve())
        output_abs = str(out_path.resolve())

        cmd = [
            str(paths.executable.resolve()),
            "--model",
            model_abs,
            "--output_file",
            output_abs,
            "--length_scale",
            str(settings.piper_length_scale),
            "--noise_scale",
            str(settings.piper_noise_scale),
            "--noise_w",
            str(settings.piper_noise_w),
        ]

        logger.info("Piper command: %s", " ".join(cmd))
        logger.info("Piper cwd: %s", paths.working_dir)
        logger.info("Piper output wav: %s", output_abs)

        try:
            completed = subprocess.run(
                cmd,
                input=speech,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=settings.piper_timeout_seconds,
                cwd=str(paths.working_dir.resolve()),
                shell=False,
            )
        except subprocess.TimeoutExpired:
            logger.error("Piper timed out after %ss", settings.piper_timeout_seconds)
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning="Piper TTS timed out — using browser voice",
            )
        except OSError as exc:
            logger.error("Piper OS error: %s", exc)
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning=f"Piper could not start: {exc}",
            )

        stderr = (completed.stderr or "").strip()
        stdout = (completed.stdout or "").strip()

        if stdout:
            logger.info("Piper stdout: %s", stdout[:500])
        if stderr:
            logger.info("Piper stderr: %s", stderr[:500])

        if completed.returncode != 0:
            logger.error(
                "Piper failed | returncode=%s stderr=%s",
                completed.returncode,
                stderr,
            )
            return PiperSynthesisResult(
                success=False,
                fallback=True,
                warning="Piper TTS failed — using browser voice",
                return_code=completed.returncode,
                stderr=stderr,
            )

        return PiperSynthesisResult(success=True, return_code=0, stderr=stderr)

    def run_startup_self_test(self) -> dict:
        paths = self.resolve_paths()
        base = {
            **self.validate_environment(),
            "test_synthesis_success": False,
            "generated_test_file": None,
        }

        if not paths.is_ready:
            base["test_message"] = "Piper not ready — skipped synthesis test"
            return base

        result = self.synthesize("Piper startup test.")
        base["test_synthesis_success"] = result.success and bool(result.audio_b64)
        base["test_fallback"] = result.fallback
        base["test_warning"] = result.warning
        base["test_return_code"] = result.return_code

        if result.success:
            base["test_message"] = "Piper startup self-test passed"
        else:
            base["test_message"] = result.warning or "Piper startup self-test failed"

        return base

    def is_available(self) -> bool:
        if get_settings().mock_ai_pipeline:
            return False
        return self.resolve_paths().is_ready


piper_service = PiperService()
