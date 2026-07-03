@echo off
chcp 65001 >nul
cd /d "%~dp0"
node scripts/open-setup-links.mjs
echo.
pause
