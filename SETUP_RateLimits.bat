@echo off

chcp 65001 >nul

cd /d "%~dp0"



echo.

echo ========================================

echo  Supabase Rate Limits - Emails sent 100

echo ========================================

echo.



npm run setup:rate-limits



echo.

pause

