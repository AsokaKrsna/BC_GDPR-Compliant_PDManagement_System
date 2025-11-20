@echo off
echo.
echo ============================================
echo   GDPR Consent System - Streamlit UI
echo ============================================
echo.

REM Check if Ganache is running
echo [1/4] Checking if Ganache is running...
curl -s http://127.0.0.1:8545 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Ganache is not running!
    echo.
    echo Please start Ganache in a separate terminal:
    echo    cd BC_GDPR-Compliant_PDManagement_System
    echo    ganache --port 8545
    echo.
    pause
    exit /b 1
)
echo [OK] Ganache is running

REM Check if contracts are deployed
echo [2/4] Checking if contracts are deployed...
if not exist "..\build\contracts\CollectionConsent.json" (
    echo.
    echo [ERROR] Contracts not deployed!
    echo.
    echo Please deploy contracts first:
    echo    cd BC_GDPR-Compliant_PDManagement_System
    echo    truffle migrate
    echo.
    pause
    exit /b 1
)
echo [OK] Contracts found

REM Check Python packages
echo [3/4] Checking Python packages...
python -c "import web3, streamlit" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python packages not installed!
    echo.
    echo Installing now...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
)
echo [OK] Python packages installed

REM Start Streamlit
echo [4/4] Starting Streamlit UI...
echo.
echo ============================================
echo   Opening browser at http://localhost:8501
echo ============================================
echo.
streamlit run app.py

pause
