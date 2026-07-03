
@echo off
cd /d "%~dp0"
echo.
echo ============================================
echo   Push to GitHub
echo ============================================
echo.
echo Step 1: Create empty repo on GitHub (browser opens)
echo         Name: online-oripa
echo         Do NOT add README / .gitignore
echo.
start "" "https://github.com/new?name=online-oripa&description=ORIPA+Vault+online+gacha"
echo.
pause
echo.
set /p GHUSER="Step 2: Enter your GitHub username: "
if "%GHUSER%"=="" (
  echo Username required.
  pause
  exit /b 1
)
git remote remove origin 2>nul
git remote add origin https://github.com/%GHUSER%/online-oripa.git
echo.
echo Step 3: Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Login may be required in browser.
  echo Or run: git push -u origin main
  pause
  exit /b 1
)
echo.
echo Done! https://github.com/%GHUSER%/online-oripa
pause








