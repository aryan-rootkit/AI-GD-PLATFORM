# ATHENA

**AI Training Hub for Evaluation & Narrative Analysis**

ATHENA is an AI-powered communication and interview preparation platform for colleges and students. Practice mock interviews and group discussions, receive structured AI evaluation, and track preparation progress over time.

## Focus areas

- Mock interviews with voice-based AI interviewers
- Group discussion practice with AI moderation
- Communication and narrative analysis
- Session feedback and performance reports
- Preparation tracking and history

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Voice AI service | FastAPI, Socket.IO, faster-whisper, Ollama, Piper TTS |
| Auth / data | Firebase (optional local file-based dev mode) |

## Quick start (local)

### 1. Frontend

```bash
npm install
cp .env.local.example .env.local   # if present; configure local dev flags
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal).

### 2. AI voice service

```bash
cd ai-service
python -m venv venv
.\venv\Scripts\activate          # Windows
pip install -r requirements.txt
# Configure ai-service/.env — see ai-service/README.md
python -m uvicorn main:socket_app --reload --port 8001
```

### 3. Ollama

```bash
ollama pull phi3:mini
ollama serve
```

### Environment (frontend)

```env
NEXT_PUBLIC_USE_LOCAL_DEV=true
NEXT_PUBLIC_USE_VOICE_PIPELINE=true
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_URL=http://localhost:8001
```

## Project structure

```
app/                    Next.js routes (dashboard, sessions, auth)
components/             UI including platform/ and branding/
ai-service/             Python voice pipeline microservice
lib/                    Frontend utilities, voice client, branding
public/                 Static assets (athena-logo.png, manifest)
```

## Branding

Platform name: **ATHENA**  
Tagline: *AI Training Hub for Evaluation & Narrative Analysis*

Logo: `public/athena-logo.png` — used for favicon, navbar, auth, and session UI.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run dev:ai` | Start AI voice service on port 8001 |
| `npm run build` | Production build |

## License

See repository license. Built for educational and institutional communication training use.
