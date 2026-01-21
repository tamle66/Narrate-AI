@echo off
setlocal

echo ========================================================
echo       Kokoro TTS Backend Setup (Windows)
echo ========================================================

:: Check for Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git: https://git-scm.com/downloads
    pause
    exit /b 1
)

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+: https://www.python.org/downloads/
    pause
    exit /b 1
)

set "BACKEND_DIR=backend"

if exist "%BACKEND_DIR%" (
    echo [INFO] Backend folder already exists.
    choice /M "Do you want to pull latest changes?"
    if errorlevel 1 (
        cd "%BACKEND_DIR%"
        git pull
        cd ..
    )
) else (
    echo [INFO] Cloning Kokoro-FastAPI repo into '%BACKEND_DIR%'...
    git clone https://github.com/remsky/Kokoro-FastAPI.git "%BACKEND_DIR%"
)

echo.
echo ========================================================
echo [INFO] Backend code is ready in: %CD%\%BACKEND_DIR%
echo.
echo To run the backend, you need 'uv' (Python package manager).
echo We will attempt to install it now.
echo ========================================================
echo.

pip install uv
if %errorlevel% neq 0 (
    echo [WARNING] Failed to install 'uv'. You might need to install it manually.
)

echo.
echo ========================================================
echo SETUP COMPLETE!
echo.
echo The Extension can now try to auto-start the server.
echo Or you can manually run:
echo    cd backend
echo    start-cpu.ps1
echo ========================================================
pause
