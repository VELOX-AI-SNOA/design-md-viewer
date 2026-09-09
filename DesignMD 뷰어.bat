@echo off
chcp 65001 >nul
cd /d "%~dp0"
node build.js
if errorlevel 1 (
  echo.
  echo Build failed - check the error above. / 빌드 실패 - 위 오류를 확인하세요.
  pause
  exit /b 1
)
start "" index.html
