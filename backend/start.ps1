#!/usr/bin/env pwsh

Write-Host "🎓 Starting PCC Portal Backend API..." -ForegroundColor Blue
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please update the .env file with your database credentials" -ForegroundColor Cyan
}

Write-Host "⚠️  Note: This demo uses PostgreSQL. Make sure you have PostgreSQL installed and running." -ForegroundColor Yellow
Write-Host "   Alternative: You can modify the code to use SQLite for easier development." -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to run migrations
$runMigrations = Read-Host "Do you want to run database migrations? (y/n)"
if ($runMigrations -eq "y" -or $runMigrations -eq "Y") {
    Write-Host "🔄 Running database migrations..." -ForegroundColor Blue
    node scripts/migrate.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrations completed" -ForegroundColor Green
        
        # Ask if user wants to seed data
        $runSeed = Read-Host "Do you want to seed the database with demo data? (y/n)"
        if ($runSeed -eq "y" -or $runSeed -eq "Y") {
            Write-Host "🌱 Seeding database..." -ForegroundColor Blue
            node scripts/seed.js
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database seeded with demo data" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Database seeding failed, but server will still start" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "⚠️  Database migrations failed, but server will try to start" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Start the development server
Write-Host "🚀 Starting API server..." -ForegroundColor Green
Write-Host "   - API URL:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "   - Health:   http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "   - Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the development server
npm run dev