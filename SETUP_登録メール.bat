@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo  ORIPA VAULT - Registration Email Setup
echo ========================================
echo.
echo Supabase template editing often does NOT save on free plan.
echo Use Send Email Hook instead (app sends the email via Gmail).
echo.
echo --- STEP 1: Render Environment Variables ---
echo Add these on Render Dashboard - Environment:
echo.
echo   GMAIL_USER=oripakawa@gmail.com
echo   GMAIL_APP_PASSWORD=your 16-char app password (no spaces)
echo   SHOP_NAME=ORIPA VAULT
echo   CONTACT_EMAIL=oripakawa@gmail.com
echo   NEXT_PUBLIC_APP_URL=https://online-oripa.onrender.com
echo.
echo --- STEP 2: Supabase Send Email Hook ---
echo Opening Supabase Hooks page...
start "" "https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/hooks"
echo.
echo   1. Click "Create a new hook" or "Send Email"
echo   2. Type: HTTPS
echo   3. URL: https://online-oripa.onrender.com/api/auth/send-email
echo   4. Click "Generate secret" and COPY the secret
echo   5. Save hook
echo.
echo --- STEP 3: Add secret to Render ---
echo   SEND_EMAIL_HOOK_SECRET= (paste secret from step 2, includes v1,whsec_...)
echo   Then redeploy Render
echo.
echo --- STEP 4: Push latest code ---
echo   Run GITHUB_PUSH.bat if not done yet
echo.
echo --- STEP 5: Test ---
echo   Register with NEW email at:
echo   https://online-oripa.onrender.com/register
echo.
pause
