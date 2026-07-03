@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.

echo ========================================

echo  Supabase メール設定 - 全部自動

echo ========================================

echo.

echo 2つの値を入力してください（チャットではなく、この黒い画面に貼る）

echo.

echo [1/2] Supabase Access Token (sbp_...)

set /p SUPABASE_ACCESS_TOKEN=

echo.

echo [2/2] Gmail App Password (16文字)

set /p GMAIL_APP_PASSWORD=

echo.

echo .env.local に保存中...

node scripts/save-env-credentials.mjs "%SUPABASE_ACCESS_TOKEN%" "%GMAIL_APP_PASSWORD%"

if errorlevel 1 (
  echo.
  echo 保存に失敗しました。値が正しいか確認してください。
  pause
  exit /b 1
)

echo.

echo Supabase に設定を送っています...

call npm run setup:all

echo.

if errorlevel 1 (
  echo.
  echo 失敗しました。
  echo ①Tokenを開く.bat で sbp_ トークンを確認してください。
) else (
  echo 完了。別メールで登録テスト:
  echo https://online-oripa.onrender.com/register
)

echo.

pause
