#!/bin/bash
cd "$(dirname "$0")"

echo "=============================================="
echo "      Starting Afosity Music Server"
echo "=============================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install it from https://nodejs.org/"
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[!] First time setup detected!"
    echo "[!] Installing required dependencies... this may take a minute."
    echo ""
    npm install
    echo ""
    echo "[!] Dependencies installed successfully."
fi

echo "Starting Next.js Server on port 3001..."
echo "Please wait a few seconds for the browser to open."
echo "Press Ctrl+C in this window to stop the server when you are done."
echo ""

npm run dev -- -p 3001 &
SERVER_PID=$!

sleep 6
open "http://localhost:3001" || xdg-open "http://localhost:3001"

wait $SERVER_PID
