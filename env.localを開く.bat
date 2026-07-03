@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist .env.local (
  echo .env.local がありません。作成します...
  call npm run setup:env
)
notepad .env.local
