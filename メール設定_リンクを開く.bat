@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.
echo ========================================
echo  メール設定リンクを開きます
echo ========================================
echo.

node scripts/open-email-setup-links.mjs

echo.
pause
