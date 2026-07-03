@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo .env.local の2行を書いたあと、この bat を実行してください。

echo.

call npm run fix:env

if errorlevel 1 (
  echo.
  echo SUPABASE_ACCESS_TOKEN が未設定です。
  echo ①Tokenを開く.bat で sbp_ トークンを発行し、.env.local に貼って保存してください。
  echo.
  start "" "https://supabase.com/dashboard/account/tokens"
  notepad .env.local
  echo.
  echo 保存したら Enter を押してください...
  pause >nul
)

call npm run setup:all

echo.

pause

