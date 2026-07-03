@echo off

chcp 65001 >nul

cd /d "%~dp0"



echo.

echo ========================================

echo  登録メール設定（かんたん版）

echo ========================================

echo.

echo やることは2つだけです。

echo.

echo 【A】Supabase の Token をコピー

echo     ブラウザが開きます

echo     Generate new token → 名前は oripa で OK

echo     表示された sbp_ で始まる文字列をコピー

echo.

pause

start "" "https://supabase.com/dashboard/account/tokens"

echo.

echo 【B】Gmail の16文字パスワードをコピー

echo     ブラウザが開きます

echo     その他 → 名前 Supabase → 生成

echo     16文字をコピー（スペースは消す）

echo.

pause

start "" "https://myaccount.google.com/apppasswords"

echo.

echo 【C】メモ帳が開きます

echo     下の2行の（ここに貼る）の部分だけ、コピーした値に書き換えて保存

echo.

pause

notepad .env.local

echo.

echo メモ帳を保存しましたか？

pause

echo.

echo Supabase に設定を送っています...

call npm run setup:all

echo.

if errorlevel 1 (

  echo.

  echo エラーが出ました。

  echo .env.local の2行が正しいか確認して、もう一度この bat を実行してください。

) else (

  echo.

  echo ===== 完了 =====

  echo テスト: https://online-oripa.onrender.com/register

  echo 別のメールアドレスで登録してください

)

echo.

pause

