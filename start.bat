@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 goto :node

where python >nul 2>nul
if %errorlevel%==0 goto :python

echo Node.js or Python was not found.
echo Please install Node.js 18+ or Python 3, then run this file again.
pause
exit /b 1

:node
start "Lvyuan Smart Server" cmd /k "node server.mjs"
timeout /t 2 >nul
start "" "http://127.0.0.1:8090/"
exit /b 0

:python
start "Lvyuan Smart Server" cmd /k "python -m http.server 8090 --directory site"
timeout /t 2 >nul
start "" "http://127.0.0.1:8090/"
exit /b 0
