@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.
echo ========================================
echo  {} エラー修正 — Hook を削除
echo ========================================
echo.
echo SMTP を Save しても、Hook が ON だとメールは送れません。
echo これが {} エラーの原因です。
echo.
echo 1. 開くページで Send Email の Hook を Delete
echo 2. Delete が押せない → SMTP が Save 済みなら Delete できるはず
echo 3. 削除後、register で再テスト
echo.
pause

start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/hooks"

echo.
echo Hook を Delete したら Enter...
pause >nul

echo.
echo 完了。1〜2分待ってから register でテストしてください。
echo https://online-oripa.onrender.com/register

pause
