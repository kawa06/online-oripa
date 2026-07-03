@echo off
cd /d "%~dp0"
start "" "https://dashboard.render.com/blueprint/new?repo=https://github.com/kawa06/online-oripa"
timeout /t 1 >nul
notepad "%~dp0RENDER_ENV_コピペ用.txt"
echo.
echo Render とメモ帳を開きました。
echo RENDER_ENV_コピペ用.txt から Key / Value をコピーしてください。
pause
