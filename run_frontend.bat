@echo off
chcp 65001 > nul
title Frontend Next.js - He Thong Sang Loc Benh Man Tinh
echo ===================================================================
echo  KHOI CHAY FRONTEND NEXT.JS 14 - HE THONG SANG LOC BENH MAN TINH
echo ===================================================================
echo.
echo [1/2] Dang chuyen vao thu muc frontend...
cd /d "%~dp0frontend"
echo [2/2] Dang khoi chay may chu Next.js dev tai http://localhost:3000 ...
echo       Website: http://localhost:3000
echo       Bam Ctrl + C de dung server.
echo.
npm run dev
pause
