@echo off
cd /d "%~dp0"
start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/settings/database"
echo.
echo Supabase Database settings opened in browser.
echo.
echo Copy these 2 connection strings EXACTLY:
echo   1. Transaction pooler -^> DATABASE_URL
echo   2. Session pooler     -^> DIRECT_URL
echo.
echo Then run env.local wo hiraku.bat, paste, Ctrl+S, SETUP.bat again.
echo.
pause
