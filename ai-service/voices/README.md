# Piper voice models

Default voice: **en_US-lessac-medium** (calm, soft, assistant-like)

## Auto-install (Windows)

```powershell
cd ai-service
.\scripts\install-piper.ps1
```

Then set in `.env`:

```env
PIPER_BIN=./bin/piper/piper/piper.exe
PIPER_MODEL_PATH=./voices/en_US-lessac-medium.onnx
PIPER_LENGTH_SCALE=1.1
PIPER_NOISE_SCALE=0.667
PIPER_NOISE_W=0.8
```

**Windows:** `piper.exe` must live in the same folder as `espeak-ng.dll` (use `bin/piper/piper/`, not the root `bin/piper/` copy).

## Manual install

1. Download [Piper releases](https://github.com/rhasspy/piper/releases) for your OS
2. Download voice from [HuggingFace en_US-lessac-medium](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium)
   - `en_US-lessac-medium.onnx`
   - `en_US-lessac-medium.onnx.json`
3. Point `PIPER_BIN` and `PIPER_MODEL_PATH` in `.env`

`PIPER_LENGTH_SCALE=1.1` slows speech slightly for a calmer, more human rhythm.
