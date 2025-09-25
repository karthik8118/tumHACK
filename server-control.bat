@echo off
echo MPG Breakthrough Analyst - Server Control
echo ========================================
echo.
echo Choose an option:
echo 1. Start Server
echo 2. Stop Server
echo 3. Restart Server
echo 4. Check Status
echo 5. View Logs
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
goto invalid

:start
echo Starting server...
call npm start
goto end

:stop
echo Stopping server...
taskkill /f /im node.exe 2>nul
echo Server stopped.
goto end

:restart
echo Restarting server...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Starting server...
call npm start
goto end

:status
echo Checking server status...
netstat -ano | findstr :3000
if %errorlevel%==0 (
    echo Server is running on port 3000
) else (
    echo Server is not running
)
goto end

:logs
echo Server logs (if available):
echo Note: Logs are displayed in the console when server is running
goto end

:invalid
echo Invalid choice. Please run the script again.
goto end

:end
echo.
pause
