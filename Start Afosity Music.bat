@echo off
echo Starting Afosity Music Next.js Server on port 3001...
echo Please wait a few seconds for the server to start.
echo Press Ctrl+C in this window to stop the server when you are done.
echo.

:: Start the Next.js development server explicitly on port 3001 to avoid conflicts
start cmd /k "npm run dev -- -p 3001"

:: Wait a few seconds for the server to initialize
timeout /t 5 /nobreak > NUL

:: Open the browser to the local server
echo Opening browser...
start http://localhost:3001

echo App is running!
