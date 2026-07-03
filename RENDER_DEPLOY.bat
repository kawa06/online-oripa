@echo off
cd /d "%~dp0"
start "" "https://dashboard.render.com/blueprint/new?repo=https://github.com/kawa06/online-oripa"
echo.
echo Render Blueprint page opened in browser.
echo.
echo 1. Connect GitHub if asked
echo 2. Fill environment variables from .env.local
echo 3. Click Apply / Deploy
echo.
echo After deploy, add to Supabase Auth Redirect URLs:
echo   https://online-oripa.onrender.com/auth/callback
echo.
pause
