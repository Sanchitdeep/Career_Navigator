@echo off
REM Script to start both frontend and backend servers on Windows

echo.
echo ========================================
echo Skill-Bridge Career Navigator - Startup
echo ========================================
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting application...
echo.

REM Check for .env file
if not exist "backend\.env" (
    echo ERROR: backend\.env file not found!
    echo Please create backend\.env with your GEMINI_API_KEY
    echo.
    echo Example:
    echo   GEMINI_API_KEY=your_key_here
    echo   PORT=5000
    echo.
    pause
    exit /b 1
)

REM Start backend in a new window
echo Starting backend server...
start "Skill-Bridge Backend" cmd /k "cd backend && npm install && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new window
echo Starting frontend server...
start "Skill-Bridge Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo Servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
pause
