# Development Log

## [2026-05-17] Vercel filesystem compatibility fix

- Fixed production crash `ENOENT: mkdir '/var/task/.local-data'` on Vercel serverless
- Replaced file-based local DB (`lib/local-admin.ts`) with **in-memory store** via `globalThis` (no `fs.mkdir` / `writeFile` at runtime)
- Auth remains **cookie-based** session tokens; demo user seeded in memory on cold start
- Removed runtime dependency on `.local-data/` for Next.js production (AI `ai-service/sessions/` unchanged)
- Safe for Vercel + Next.js serverless; data is ephemeral per instance (acceptable with `SKIP_AUTH` demo mode)

## [2026-05-17 04:15 IST] ATHENA platform rebrand & repository refresh

- Renamed platform from PrepWise to **ATHENA** (AI Training Hub for Evaluation & Narrative Analysis) across UI, metadata, docs, and AI service titles
- Integrated **ATHENA logo** (`public/athena-logo.png`, `app/icon.png`, favicon, `manifest.json`, OpenGraph)
- Added `lib/branding.ts` and `AthenaLogo` component for consistent navbar, auth, and layout branding
- Updated dashboard copy for communication training positioning (mock interviews, GD, AI evaluation, preparation tracking)
- Session UI labels now use **ATHENA** for AI interviewer/transcript; storage keys → `athena.interview.setup` / `athena.gd.setup`
- Prepared `.gitignore` for clean production push; fresh git history instructions (no auto-push)

## [2026-05-16] AI conversation memory & prompt intelligence

- **Root cause:** repeated line was `FALLBACK_REPLY` in `ollama_service.py` — returned on every Ollama timeout/HTTP error/empty response
- **Conversation memory:** `get_ollama_history()` sends up to 24 prior user/assistant turns; in-memory session cache; transcript included in system prompt summary
- **Prompt builder:** `services/prompt_builder.py` + personalities (`hr`, `technical`, `startup`, `corporate`, `coach`); dynamic follow-ups; explicit rule against generic “Thanks for sharing…”
- **Ollama payload:** full `messages` array = system + history + latest user message; logging of history length, prompts, responses, fallback triggers
- **Repetition detection:** similarity check vs last assistant reply; auto-retry with higher temperature + contextual reminder
- **Contextual fallbacks** replace static string when Ollama fails
- **Session metadata** from setup wizard (`interviewerStyle`, `subject`, `companyType`, `difficulty`) passed via frontend → `/conversation/sessions`
- Voice pipeline (Whisper, Piper, Socket.IO) unchanged

## [2026-05-16] Frontend redesign — Student AI Preparation Hub

- Replaced generic dashboard with **Student AI Preparation Hub** (`DashboardHub`): overview stats, mock interview / GD CTAs, subject tracks, recent sessions, AI suggestions (mock progression data in `lib/data/platform-mock.ts`)
- Added **platform shell**: sidebar + mobile nav, calm minimal design tokens in `app/globals.css` (`components/platform/`)
- **Mock interview setup** (`/interview/setup`) and **GD setup** (`/gd/setup`) — multi-step `SetupWizard` with sessionStorage config
- **Session UI** (`SessionExperience`): speaking cards, live transcript stream (ChatGPT Voice–inspired), push-to-talk controls; voice logic extracted to `lib/voice/useSessionVoice.ts`; `LocalVoiceAgent` delegates to new UI without backend changes
- **Analytics report** (`SessionAnalyticsReport`) on feedback route with communication metrics + real API feedback
- **History** (`/history`) with filters, progress summary, links to interview analytics
- Routes: `/gd/session`, `/interview/setup`; layout uses `PlatformShell`

## [2026-05-17 03:30 IST] Piper TTS Windows stabilization

- Fixed root cause: `bin/piper/piper.exe` lacked DLLs; Piper must run from `bin/piper/piper/` (with `espeak-ng.dll`)
- Rewrote `piper_service.py`: absolute paths, `cwd` set to Piper runtime dir, UTF-8 stdin, full stderr logging, no pipeline crash on failure
- Graceful fallback to browser TTS with structured `warning` in socket events
- Added `GET /debug/piper` and FastAPI startup self-test (`Piper self-test | success=True`)
- Updated `.env` `PIPER_BIN=./bin/piper/piper/piper.exe` and install script for Windows layout

## [2026-05-17 01:15 IST] Calm human voice (Piper TTS + personality)

- Added Piper install script for Windows (`scripts/install-piper.ps1`) with `en_US-lessac-medium` voice
- Tuned Piper: `length_scale=1.1` for calmer pacing; default paths under `bin/piper` and `voices/`
- Added shared `prompts/personality.txt` — calm, thoughtful, professional tone in all LLM replies
- Updated interviewer/coach prompts for warm, brief, non-robotic spoken style

## [2026-05-17 00:45 IST] Faster AI responses + streaming

- Switched Ollama model from `llama3` to `phi3:mini` for ~50–70% faster inference
- Reduced `OLLAMA_NUM_PREDICT` from 120 → 60 for short conversational replies
- Implemented Ollama token streaming via Socket.IO (`ai_response_start`, `ai_response_chunk`, `ai_response_text`)
- Frontend shows progressive AI text while model generates; TTS plays after stream completes
- Tightened interviewer/coach prompts to 1–2 spoken sentences max

## [2026-05-17 00:15 IST] Speech-to-text accuracy improvements

- Upgraded faster-whisper default model from `base` to `small.en` for better English accuracy and punctuation
- Tuned transcription: `beam_size=5`, `vad_filter=True`, `condition_on_previous_text=False`, `language=en`
- Centralized mic constraints (`noiseSuppression`, `echoCancellation`, `autoGainControl`) in `lib/voice/recordAudio.ts`

## [2026-05-16 23:45 IST] Voice pipeline stabilization

- Standardized AI service port to **8001** across frontend, backend proxy, and `.env` files
- Added **faster-whisper** as default STT when whisper.cpp binaries are not configured
- Improved Ollama integration: health checks, `num_predict` limit for 2–5s target latency, timeout handling
- Fixed Socket.IO handler race: listeners bind on connect; retry once on `sendAudio` failure
- Added browser speech fallback when Piper audio is unavailable
- Added `/health`, `/pipeline/turn`, and frontend `checkAiServiceHealth()` preflight
- Added `scripts/run.ps1` and `scripts/setup-voice-stack.ps1` for Windows setup
- Hardened push-to-talk UX: mic permission errors, min recording length, loading states

## [2026-05-16 23:00 IST] Open-source voice pipeline architecture

- Added Python FastAPI `ai-service` microservice (whisper.cpp + Ollama + Piper TTS)
- Implemented Socket.IO realtime events: `user_audio`, `transcript_ready`, `ai_response_text`, `ai_response_audio`, `session_feedback`
- Added session persistence in `ai-service/sessions/` with conversation memory per `sessionId`
- Implemented push-to-talk MVP in `LocalVoiceAgent` (hold mic → release → process → play AI audio)
- Preserved existing UI via `Agent.tsx` wrapper; Vapi remains fallback when `NEXT_PUBLIC_USE_VOICE_PIPELINE=false`
- Added rule-based evaluation service and `saveVoiceFeedback` server action
- Added `lib/ai/config.ts`, `/api/voice/session` proxy, and `.env.example` for runtime configuration

## [2026-05-16 17:15 IST] Local dev mode without Firebase

- Implemented file-based auth and database in `.local-data/db.json`
- Fixed Firebase Admin crash when service account env vars are missing
- Added seeded mock interviews for dashboard testing without cloud credentials
