@echo off
title Smart Tiffin Shop Launcher
color 0A
echo ========================================================
echo         STARTING SMART TIFFIN SHOP POS SYSTEM
echo ========================================================
echo.

echo [1/2] Launching Golang Gin Backend Server on http://localhost:8080 ...
start "Smart Tiffin Shop - Backend Server" cmd /k "cd /d %~dp0backend && go run main.go"

echo Waiting for backend server initialization...
timeout /t 3 /nobreak >nul

echo [2/2] Launching React Vite Frontend App on http://localhost:5173 ...
start "Smart Tiffin Shop - Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo SUCCESS! All servers launched!
echo.
echo Backend API Server : http://localhost:8080
echo POS Billing App    : http://localhost:5173
echo ========================================================
echo.
pause
