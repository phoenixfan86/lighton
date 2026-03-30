@echo off
echo.
echo LightOn - Vstanovlennya (Setup)
echo ================================
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo POMYLKA: Node.js ne znaideno!
    echo Zavantazhte ta vstanovit: https://nodejs.org
    echo Pislya vstanovlennya zapustit tsei fail znovu.
    pause
    exit /b 1
)

echo Node.js znaydeno:
node --version
echo.

echo Vstanovlennya zalezhnostei (npm install)...
npm install
if errorlevel 1 (
    echo POMYLKA pry npm install
    pause
    exit /b 1
)

echo.
echo Vstanovlennya brauzera Chromium...
npx playwright install chromium
if errorlevel 1 (
    echo POMYLKA pry vstanovlenni Chromium
    pause
    exit /b 1
)

echo.
echo ================================
echo Vstanovlennya zaversheno!
echo.
echo Teper zapuskait parser:
echo   node scripts/parse-product.js URL kategoriya
echo.
echo Pryklad:
echo   node scripts/parse-product.js https://rozetka.com.ua/ua/itc_power_gg18i/p356935005/ generators
echo.
echo Kategoriyi: generators, inverters, solar-panels, batteries, power-stations
echo ================================
pause
