@echo off
REM Email Verification & Security Integration Tests Runner
REM This script helps run the integration tests on Windows

echo ============================================================
echo Email Verification ^& Security Integration Tests
echo ============================================================
echo.

REM Check if backend server is running
echo Checking if backend server is running on port 5000...
netstat -an | find "5000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Backend server is running on port 5000
    echo.
) else (
    echo [ERROR] Backend server is NOT running on port 5000
    echo.
    echo Please start the backend server first:
    echo   1. Open a new terminal
    echo   2. Run: cd backend
    echo   3. Run: npm start
    echo   4. Wait for "Server running on port 5000"
    echo   5. Then run this script again
    echo.
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking if MongoDB is running...
netstat -an | find "27017" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB is running on port 27017
    echo.
) else (
    echo [WARNING] MongoDB might not be running on port 27017
    echo If tests fail, please start MongoDB:
    echo   Windows: net start MongoDB
    echo.
)

echo Starting integration tests...
echo.
node test-email-verification-security-integration.js

echo.
echo ============================================================
echo Tests completed!
echo ============================================================
pause
