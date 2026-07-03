@echo off

chcp 65001 >nul

cd /d "%~dp0"



echo.

echo ========================================

echo  メール設定を元に戻す（Supabase 標準）

echo ========================================

echo.

echo Send Email Hook が原因でメールが届きません。

echo Supabase が直接 Gmail で送る方式に戻します。

echo.

echo ※ Hook の Delete が押せない場合:

echo   先に STEP 2 の SMTP を ON に Save → その後 STEP 1 で Delete

echo.

echo STEP 1: Send Email Hook を削除

echo STEP 2: Custom SMTP を ON（Gmail）

echo STEP 3: Rate Limits - Emails sent = 100

echo STEP 4: メールテンプレート（SUPABASE_メール_コピペ用.txt）

echo.



start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/smtp"

timeout /t 2 >nul

start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/hooks"

timeout /t 2 >nul

start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/rate-limits"

timeout /t 2 >nul

start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/templates"

start notepad SUPABASE_メール_コピペ用.txt



echo.

echo 自動設定（Hook OFF + SMTP）を試します...

call npm run setup:smtp

echo.

echo Render から SEND_EMAIL_HOOK_SECRET は削除して OK です。

echo.

pause

