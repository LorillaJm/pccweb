#!/usr/bin/env pwsh

Write-Host "🎓 Starting Passi City College Website..." -ForegroundColor Blue
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}

# Start the development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "   - Local:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the development server
npm run dev