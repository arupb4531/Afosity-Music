@echo off
echo ==============================================
echo       Starting Afosity Music Server
echo ==============================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please install Node.js from https://nodejs.org/ before continuing.
    echo Press any key to exit...
    pause
    exit /b
)

IF NOT EXIST "node_modules\" (
    echo [!] First time setup detected!
    echo [!] Installing required dependencies... this may take a minute.
    echo.
    call npm install
    echo.
    echo [!] Dependencies installed successfully.
)

echo Starting Next.js Server on port 3001...
echo Please wait a few seconds for the browser to open.
echo Press Ctrl+C in this window to stop the server when you are done.
echo.

:: Start the Next.js development server explicitly on port 3001 to avoid conflicts
start "Afosity Music Server" cmd /k "npm run dev -- -p 3001"

:: Wait a few seconds for the server to initialize
timeout /t 6 /nobreak > NUL

:: Open the browser to the local server
echo Opening browser...
start http://localhost:3001

echo App is running!
