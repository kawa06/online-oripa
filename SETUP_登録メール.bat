@echo off

chcp 65001 >nul

cd /d "%~dp0"



echo.

echo ========================================

echo  ORIPA VAULT - 登録メール（Supabase SMTP）

echo ========================================

echo.

echo Supabase が Gmail で直接メールを送ります。

echo Send Email Hook は使いません（Render 不要）。

echo.

echo --- STEP 1: Hook が ON なら削除 ---

echo   https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/hooks

echo.

echo --- STEP 2: Custom SMTP（Gmail）---

echo   Host: smtp.gmail.com  Port: 587

echo   User: oripakawa@gmail.com

echo   Pass: Gmail アプリパスワード

echo.

echo --- STEP 3: Rate Limits - Emails sent = 100 ---

echo.

echo --- STEP 4: メールテンプレート ---

echo   SUPABASE_メール_コピペ用.txt を貼る

echo.

echo 詳細手順は SETUP_メールを元に戻す.bat を実行

echo.

pause

