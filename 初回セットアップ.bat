@echo off
cd /d "%~dp0"
cls
echo.
echo ============================================
echo   ORIPA VAULT Setup
echo ============================================
echo.
echo Do NOT close this window. Please wait.
echo It may take several minutes.
echo.
echo Folder: %~dp0
echo.
pause
echo.

if not exist node_modules (
  echo [1/2] Installing packages...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed. Send a screenshot.
    pause
    exit /b 1
  )
  echo OK
  echo.
)

echo [2/2] Setting up database...
call npm run setup
if errorlevel 1 (
  echo.
  echo --------------------------------------------
  echo Setup failed. Check .env.local settings.
  echo --------------------------------------------
  echo.
  echo If you see "tenant/user not found":
  echo   1. Run COPY_DB_URL.bat
  echo   2. Copy Transaction + Session pooler URLs
  echo   3. Paste into .env.local, Ctrl+S
  echo   4. Run SETUP.bat again
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   Setup complete!
echo ============================================
echo.
echo Next: double-click START.bat
echo Browser: http://localhost:3000
echo.
set /p OPEN="Run START.bat now? (Y/n): "
if /i "%OPEN%"=="n" goto end
if /i "%OPEN%"=="no" goto end
start "" "%~dp0START.bat"
goto end

:end
pause
