@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo Supabase Token ページを開きます...

start "" "https://supabase.com/dashboard/account/tokens"

