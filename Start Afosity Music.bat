@echo off
echo ==============================================
echo       Starting Afosity Music Server
echo ==============================================
echo.

IF NOT EXIST "node_modules\" (
    echo [!] First time setup detected!
    echo [!] Installing required dependencies... this may take a minute.
    echo.
    npm install
    echo.
    echo [!] Dependencies installed successfully.
)

echo Starting Next.js Server on port 3001...
echo Please wait a few seconds for the browser to open.
echo Press Ctrl+C in this window to stop the server when you are done.
echo.

:: Start the Next.js development server explicitly on port 3001 to avoid conflicts
start cmd /k "npm run dev -- -p 3001"

:: Wait a few seconds for the server to initialize
timeout /t 6 /nobreak > NUL

:: Open the browser to the local server
echo Opening browser...
start http://localhost:3001

echo App is running!
