@echo off
echo Starting HeartBridge Application...
echo.

echo [1/2] Starting Backend Server on port 3000...
start "Backend Server" cmd /k "cd backend && node server.js"

echo Waiting 3 seconds...
timeout /t 3 /nobreak

echo [2/2] Starting Frontend Server on port 4200...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo All servers started!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
