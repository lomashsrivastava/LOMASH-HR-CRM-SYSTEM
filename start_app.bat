@echo off
echo ===================================================
echo      Starting Lomash HR CRM System
echo ===================================================

echo.
echo [1/3] Starting Backend Server...
start "HR CRM Backend" cmd /k "cd apps\backend && npm run dev"

echo.
echo [2/3] Starting AI/ML Service...
start "HR CRM AI Service" cmd /k "cd apps\ml-service && python manage.py runserver 8000"

echo.
echo [3/3] Starting Frontend Dashboard...
echo Waiting for backend to initialize...
timeout /t 5
start "HR CRM Frontend" cmd /k "cd apps\frontend && npm run dev -- --host"

echo.
echo ===================================================
echo      All Services Started Successfully!
echo      Frontend: http://localhost:5173
echo      Backend:  http://localhost:4000
echo      AI ML:    http://localhost:8000
echo ===================================================
pause
