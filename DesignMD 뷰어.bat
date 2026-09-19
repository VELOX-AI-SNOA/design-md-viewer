@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "node_modules\js-yaml\" (
  echo Installing packages for first run... / 최초 실행 - 필요한 패키지를 설치합니다...
  call npm install --no-audit --no-fund || (
    echo.
    echo npm install failed - check the error above. / 패키지 설치 실패 - 위 오류를 확인하세요.
    pause
    exit /b 1
  )
)
node build.js
if errorlevel 1 (
  echo.
  echo Build failed - check the error above. / 빌드 실패 - 위 오류를 확인하세요.
  pause
  exit /b 1
)
start "" index.html
