@echo off
setlocal
cd /d "%~dp0"

set PORT=4180

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting static server with python on http://127.0.0.1:%PORT%
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting static server with py on http://127.0.0.1:%PORT%
  py -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where node >nul 2>nul
if %ERRORLEVEL%==0 (
  echo Starting static server with node on http://127.0.0.1:%PORT%
  node server.js
  goto :eof
)

echo Could not find python, py, or node in PATH.
echo Install Python or Node.js, then rerun this script.
exit /b 1
