@echo off
title Web Player
cd /d "%~dp0"

echo Launching Web Player (Zero-Server Standalone Mode)...

:: Launch Web Player.html directly in default browser or Edge/Chrome
start "" "%~dp0Web Player.html"
exit
