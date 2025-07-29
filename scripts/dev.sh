#!/bin/bash

# Development script for html-compo.js
# This script runs TypeScript compiler in watch mode and starts a local server

echo "🚀 Starting html-compo.js development environment..."

# Check if TypeScript is available
if ! command -v tsc &> /dev/null; then
    echo "❌ TypeScript compiler not found. Installing dependencies..."
    npm install
fi

# Check if http-server is available
if ! npm list http-server &> /dev/null; then
    echo "📦 Installing http-server..."
    npm install
fi

# Build once first
echo "📦 Building TypeScript..."
npm run build

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development environment..."
    kill $TSC_PID 2>/dev/null
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start TypeScript compiler in watch mode
echo "👀 Starting TypeScript compiler in watch mode..."
npm run build:watch &
TSC_PID=$!

# Wait a moment for the compiler to start
sleep 2

# Start HTTP server
echo "🌐 Starting HTTP server on port 8080..."
npx http-server -p 8080 -c-1 --cors &
SERVER_PID=$!

echo ""
echo "✅ Development environment ready!"
echo ""
echo "📁 Project directory: $(pwd)"
echo "🌐 Test page: http://localhost:8080/test/index.html"
echo "📝 Docs: http://localhost:8080/docs/index.html"
echo ""
echo "💡 Tips:"
echo "   - Edit src/main.ts and save to see changes automatically compiled"
echo "   - Refresh the test page to see your changes"
echo "   - Press Ctrl+C to stop the development environment"
echo ""

# Wait for both processes
wait $TSC_PID $SERVER_PID
