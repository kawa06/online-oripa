@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.

echo ========================================

echo  Supabase Token だけ設定（Gmail は設定済み）

echo ========================================

echo.

call npm run fix:env 2>nul

echo [1/1] Supabase Access Token (sbp_...)

echo ①Tokenを開く.bat で発行した sbp_ で始まる文字列を貼ってください

echo.

set /p SUPABASE_ACCESS_TOKEN=

echo.

node scripts/save-env-credentials.mjs "%SUPABASE_ACCESS_TOKEN%"

if errorlevel 1 (
  pause
  exit /b 1
)

echo.

call npm run setup:all

echo.

if errorlevel 1 (
  echo 失敗しました。
) else (
  echo ===== 完了 =====
  echo テスト: https://online-oripa.onrender.com/register
)

echo.

pause
