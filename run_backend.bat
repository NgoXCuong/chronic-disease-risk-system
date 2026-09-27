@echo off
chcp 65001 > nul
title Backend FastAPI - He Thong Sang Loc Benh Man Tinh
echo ===================================================================
echo  KHOI CHAY BACKEND SERVER - HE THONG SANG LOC BENH MAN TINH
echo ===================================================================
echo.
echo [1/2] Dang kiem tra thu muc backend...
cd /d "%~dp0backend"
echo [2/2] Dang khoi chay may chu Uvicorn tai http://localhost:8000 ...
echo       Swagger UI: http://localhost:8000/docs
echo       Bam Ctrl + C de dung server.
echo.
python run.py
pause
