#!/usr/bin/env pwsh

Write-Host "🎓 Starting PCC Portal Development Environment..." -ForegroundColor Blue
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "🔧 Starting Backend API..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\pc1\Downloads\pccweb\backend'; .\start.ps1"
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🌐 Starting Frontend..." -ForegroundColor Green  
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\pc1\Downloads\pccweb'; npm run dev"
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "This will start both the frontend and backend in separate windows." -ForegroundColor Cyan
Write-Host ""

# Ask user preference
$choice = Read-Host "Choose option: [1] Start both automatically [2] Start backend only [3] Start frontend only [4] Cancel"

switch ($choice) {
    "1" {
        Write-Host "🚀 Starting both services..." -ForegroundColor Blue
        Start-Backend
        Start-Sleep -Seconds 3
        Start-Frontend
        Write-Host ""
        Write-Host "✅ Services started in separate windows:" -ForegroundColor Green
        Write-Host "   📡 Backend API: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   📊 Health Check: http://localhost:5000/api/health" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Demo Accounts (after backend setup):" -ForegroundColor Yellow
        Write-Host "   Student: anna.garcia@student.pcc.edu.ph / password123" -ForegroundColor White
        Write-Host "   Faculty: maria.santos@passicitycollege.edu.ph / password123" -ForegroundColor White
        Write-Host "   Admin: admin@passicitycollege.edu.ph / password123" -ForegroundColor White
    }
    "2" {
        Start-Backend
        Write-Host "✅ Backend started: http://localhost:5000" -ForegroundColor Green
    }
    "3" {
        Start-Frontend
        Write-Host "✅ Frontend started: http://localhost:3000" -ForegroundColor Green
    }
    "4" {
        Write-Host "👋 Cancelled by user" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Invalid option. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Blue
Write-Host "   - Make sure PostgreSQL is running for the backend" -ForegroundColor Gray
Write-Host "   - Run database migrations if this is your first time" -ForegroundColor Gray
Write-Host "   - Check the backend window for any setup instructions" -ForegroundColor Gray
Write-Host "   - Use Ctrl+C in each window to stop the services" -ForegroundColor Gray

Read-Host "Press Enter to close this window"