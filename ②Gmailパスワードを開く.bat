@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo Gmail アプリパスワードページを開きます...

start "" "https://myaccount.google.com/apppasswords"

