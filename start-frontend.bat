@echo off
title Valence Storefront - Next.js
echo ===================================================
echo   Starting Valence Storefront (Next.js App Router)
echo   Local URL: http://localhost:3000
echo ===================================================
cd /d "%~dp0storefront"
if not exist node_modules (
    echo Installing storefront dependencies...
    npm install
)
npm run dev
pause
