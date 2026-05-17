# ATHENA AI service — Windows startup script
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Host "Creating Python venv..."
    python -m venv venv
}

Write-Host "Activating venv and installing dependencies..."
& ".\venv\Scripts\pip.exe" install -r requirements.txt -q

Write-Host "Checking Ollama..."
try {
    ollama list | Out-Null
    Write-Host "Ollama OK"
} catch {
    Write-Warning "Ollama not found. Install from https://ollama.com then run: ollama pull llama3"
}

Write-Host "Starting AI service on http://127.0.0.1:8001"
& ".\venv\Scripts\uvicorn.exe" main:socket_app --reload --host 0.0.0.0 --port 8001
