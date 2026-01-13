@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   RECOMP - Windows Startup Script
echo ========================================
echo.

:: Check if .env.local exists
if not exist ".env.local" (
    echo [ERROR] .env.local file not found!
    echo Please create .env.local with your environment variables.
    echo You can copy from .env.example and update the values.
    pause
    exit /b 1
)

:: Force load environment variables from .env.local for this session
echo [0/6] Loading environment variables from .env.local...
for /f "usebackq tokens=1* delims==" %%a in (".env.local") do (
    set "key=%%a"
    set "val=%%b"
    if not "!key!"=="" (
        :: Check if it's not a comment
        echo !key! | findstr /r "^#" >nul
        if errorlevel 1 (
            :: Trim trailing spaces from val
            for /l %%i in (1,1,31) do if "!val:~-1!"==" " set "val=!val:~0,-1!"
            set "!key!=!val!"
        )
    )
)
echo   [OK] Environment variables loaded.

echo [1/6] Checking PostgreSQL...
sc query postgresql-x64-17 >nul 2>&1
if %errorlevel% equ 0 (
    sc query postgresql-x64-17 | find "RUNNING" >nul
    if %errorlevel% equ 0 (
echo   [OK] PostgreSQL service is running
    ) else (
echo   [WARN] PostgreSQL service exists but is not running
echo   Attempting to start PostgreSQL service...
net start postgresql-x64-17 >nul 2>&1
if %errorlevel% equ 0 (
echo   [OK] PostgreSQL service started
timeout /t 3 /nobreak >nul
) else (
echo   [ERROR] Failed to start PostgreSQL service
echo   Please start PostgreSQL manually and try again.
pause
exit /b 1
)
    )
) else (
netstat -an | find "5432" | find "LISTENING" >nul
    if %errorlevel% equ 0 (
echo   [OK] PostgreSQL appears to be running on port 5432
    ) else (
echo   [WARN] PostgreSQL not detected
echo   Please ensure PostgreSQL is running on localhost:5432
echo   Press any key to continue anyway, or Ctrl+C to exit...
pause >nul
    )
)

echo.
echo [2/6] Freeing port 3000...
set KILLED=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" 2^>nul') do (
echo   Killing process %%a using port 3000...
taskkill /F /PID %%a >nul 2>&1
set KILLED=1
)
if %KILLED% equ 1 (
timeout /t 2 /nobreak >nul
)
echo   [OK] Port 3000 cleanup complete

echo.
echo [3/6] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
echo   [ERROR] Prisma generate failed
pause
exit /b 1
)
echo   [OK] Prisma client generated

echo.
echo [4/6] Running database migrations...
call npx prisma migrate deploy
echo   [OK] Database migrations checked

echo.
echo [5/6] Seeding database...
call npm run seed
echo   [OK] Database seeded

echo.
echo [6/6] Starting Next.js dev server on port 3000...
set PORT=3000
echo.
echo ========================================
echo   RECOMP is ready!
echo   URL: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.
echo   Starting server...
echo.
call npm run dev
