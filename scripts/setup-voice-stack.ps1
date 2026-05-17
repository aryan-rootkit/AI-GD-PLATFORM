# One-time setup helper for the local voice stack (Windows)
$ErrorActionPreference = "Continue"

Write-Host "=== ATHENA Voice Stack Setup ===" -ForegroundColor Cyan

# Ollama
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Ollama installed"
    ollama pull phi3:mini
} else {
    Write-Warning "[!] Install Ollama from https://ollama.com then re-run this script"
}

# Python venv for ai-service
$aiRoot = Join-Path $PSScriptRoot "..\ai-service"
Set-Location $aiRoot

if (-not (Test-Path ".\venv")) {
    python -m venv venv
}

& ".\venv\Scripts\pip.exe" install -r requirements.txt

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  Terminal 1: ollama serve   (if not already running)"
Write-Host "  Terminal 2: cd ai-service; .\scripts\install-piper.ps1"
Write-Host "  Terminal 3: cd ai-service; .\scripts\run.ps1"
Write-Host "  Terminal 4: npm run dev"
