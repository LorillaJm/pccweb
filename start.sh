#!/bin/bash

echo "🎓 Starting Passi City College Website..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
    echo ""
fi

# Start the development server
echo "🚀 Starting development server..."
echo "   - Local:   http://localhost:3000"
echo "   - Press Ctrl+C to stop the server"
echo ""

# Run the development server
npm run dev