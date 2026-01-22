@echo off
echo Installing Kokoro TTS Native Host...
cd /d %~dp0
python ../native-host/install.py
pause
