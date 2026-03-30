@echo off
cls
echo =====================================
echo    Category name abbreviations
echo =====================================
echo  g  - generators
echo  i  - inverters
echo  sp - solar-panels
echo  b  - batteries
echo  ps - power-stations
echo =====================================
echo.

set /p url="Enter URL: "
set /p cat_input="Enter category (shortcut or full name): "

:: Використовуємо /i для ігнорування регістру (G або g спрацюють однаково)
set category=%cat_input%
if /i "%cat_input%"=="g"  set category=generators
if /i "%cat_input%"=="i"  set category=inverters
if /i "%cat_input%"=="sp" set category=solar-panels
if /i "%cat_input%"=="b"  set category=batteries
if /i "%cat_input%"=="ps" set category=power-stations

:: Перевірка, чи не порожні змінні
if "%url%"=="" echo Error: URL is empty! & pause & exit /b
if "%category%"=="" echo Error: Category is empty! & pause & exit /b

echo Running: node parse-product.js %url% %category%
node parse-product.js %url% %category%

pause