@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 당근 전국 통합 검색 서버를 시작합니다...
start "" "http://localhost:3000"
node server.js
pause
