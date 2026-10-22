@echo off
title Campus Connect - Lost & Found Portal
echo Starting Campus Connect Local Web Server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
