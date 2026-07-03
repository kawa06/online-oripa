@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.
echo ========================================
echo  メール認証を元に戻す（Token 不要）
echo ========================================
echo.
echo 以前動いていた方式: Supabase が Gmail で直接送信
echo sbp_ トークンは不要です
echo.
echo メモ帳と Supabase の画面を開きます...
echo Password をコピーして Save するだけです
echo.

node scripts/restore-email-manual.mjs

echo.
pause
