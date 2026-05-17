# Installs Piper TTS + en_US-lessac-medium voice for ATHENA (Windows x64)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$BinDir = Join-Path $Root "bin\piper"
$PiperRuntimeDir = Join-Path $BinDir "piper"
$VoicesDir = Join-Path $Root "voices"
New-Item -ItemType Directory -Force -Path $BinDir, $PiperRuntimeDir, $VoicesDir | Out-Null

$PiperVersion = "2023.11.14-2"
$PiperZip = "piper_windows_amd64.zip"
$PiperUrl = "https://github.com/rhasspy/piper/releases/download/$PiperVersion/$PiperZip"

$ModelBase = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium"
$ModelOnnx = "$ModelBase/en_US-lessac-medium.onnx"
$ModelJson = "$ModelBase/en_US-lessac-medium.onnx.json"

Write-Host "Downloading Piper binary..." -ForegroundColor Cyan
$zipPath = Join-Path $env:TEMP $PiperZip
Invoke-WebRequest -Uri $PiperUrl -OutFile $zipPath
Expand-Archive -Path $zipPath -DestinationPath $BinDir -Force

# Keep full runtime folder (piper.exe + DLLs) — required on Windows
$piperExe = Get-ChildItem -Path $BinDir -Recurse -Filter "piper.exe" | Where-Object {
    Test-Path (Join-Path $_.DirectoryName "espeak-ng.dll")
} | Select-Object -First 1

if (-not $piperExe) {
    throw "Could not find piper.exe with espeak-ng.dll after extract"
}

$targetDir = $PiperRuntimeDir
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
Copy-Item -Path (Join-Path $piperExe.DirectoryName "*") -Destination $targetDir -Recurse -Force

Write-Host "Downloading en_US-lessac-medium voice..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $ModelOnnx -OutFile (Join-Path $VoicesDir "en_US-lessac-medium.onnx")
Invoke-WebRequest -Uri $ModelJson -OutFile (Join-Path $VoicesDir "en_US-lessac-medium.onnx.json")

Write-Host ""
Write-Host "Piper installed successfully." -ForegroundColor Green
Write-Host "  Binary: $targetDir\piper.exe"
Write-Host "  Voice:  $VoicesDir\en_US-lessac-medium.onnx"
Write-Host ""
Write-Host "Add to ai-service/.env:" -ForegroundColor Yellow
Write-Host "  PIPER_BIN=./bin/piper/piper/piper.exe"
Write-Host "  PIPER_MODEL_PATH=./voices/en_US-lessac-medium.onnx"
Write-Host "  PIPER_LENGTH_SCALE=1.1"
Write-Host "  PIPER_NOISE_SCALE=0.667"
Write-Host "  PIPER_NOISE_W=0.8"
