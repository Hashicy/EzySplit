#!/usr/bin/env bash
# Simple dev starter: runs server and client in separate terminals (macOS)
set -e

echo "Starting server..."
osascript -e 'tell application "Terminal" to do script "cd \"$(pwd)/server\" && npm run dev"'
sleep 1
echo "Starting client..."
osascript -e 'tell application "Terminal" to do script "cd \"$(pwd)/client\" && npm run dev"'
echo "Started. Open your browser at http://localhost:5173"
