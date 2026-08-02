@echo off
title Orion - Laptop Intelligence Platform
set "PATH=C:\Users\Dell\.cargo\bin;%PATH%"
cd /d "%~dp0"
echo Launching Orion Platform...
npm run tauri dev
