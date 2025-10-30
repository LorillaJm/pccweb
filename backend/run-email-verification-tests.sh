#!/bin/bash

# Email Verification & Security Integration Tests Runner
# This script helps run the integration tests on Linux/Mac

echo "============================================================"
echo "Email Verification & Security Integration Tests"
echo "============================================================"
echo ""

# Check if backend server is running
echo "Checking if backend server is running on port 5000..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "[OK] Backend server is running on port 5000"
    echo ""
else
    echo "[ERROR] Backend server is NOT running on port 5000"
    echo ""
    echo "Please start the backend server first:"
    echo "  1. Open a new terminal"
    echo "  2. Run: cd backend"
    echo "  3. Run: npm start"
    echo "  4. Wait for 'Server running on port 5000'"
    echo "  5. Then run this script again"
    echo ""
    exit 1
fi

# Check if MongoDB is running
echo "Checking if MongoDB is running..."
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "[OK] MongoDB is running on port 27017"
    echo ""
else
    echo "[WARNING] MongoDB might not be running on port 27017"
    echo "If tests fail, please start MongoDB:"
    echo "  Linux: sudo systemctl start mongod"
    echo "  macOS: brew services start mongodb-community"
    echo ""
fi

echo "Starting integration tests..."
echo ""
node test-email-verification-security-integration.js

echo ""
echo "============================================================"
echo "Tests completed!"
echo "============================================================"
