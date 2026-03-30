#!/bin/bash
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     LightOn — Встановлення               ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Перевірка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не знайдено!"
    echo "   Завантажте та встановіть: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""
echo "📦 Встановлення залежностей..."
npm install

echo ""
echo "🌐 Встановлення браузера Chromium..."
npx playwright install chromium

echo ""
echo "════════════════════════════════════════════"
echo "✨ Встановлення завершено!"
echo ""
echo "Тепер запускайте парсер командою:"
echo "  node scripts/parse-product.js <URL> <категорія>"
echo ""
echo "Приклад:"
echo "  node scripts/parse-product.js https://rozetka.com.ua/ua/itc_power_gg18i/p356935005/ generators"
echo ""
echo "Категорії: generators, inverters, solar-panels, batteries, power-stations"
echo "════════════════════════════════════════════"
