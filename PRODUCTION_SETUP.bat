@echo off
cd /d "%~dp0"
echo === Production setup ===
echo.
call node scripts/setup-production.mjs
echo.
start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/url-configuration"
start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/providers"
start "" "https://online-oripa.onrender.com/login"
start "" "https://online-oripa.onrender.com/admin"
echo.
pause
