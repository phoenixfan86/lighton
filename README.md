# ⚡ LightOn — Каталог енергетичного обладнання

Україномовний SEO-каталог генераторів, інверторів, сонячних панелей, АКБ та зарядних станцій.  
Монетизація через Google AdSense.

---

## 🚀 Швидкий старт

### Крок 1 — Встановити Node.js
Завантажте та встановіть: https://nodejs.org (версія 18+)

### Крок 2 — Встановити залежності (один раз)

**Windows:** двічі клікніть `SETUP.bat`

**Mac/Linux:**
```bash
chmod +x setup.sh && ./setup.sh
```

Або вручну:
```bash
npm install
npx playwright install chromium
```

### Крок 3 — Парсити товар за посиланням
```bash
node scripts/parse-product.js <URL> <категорія>
```

**Приклади:**
```bash
# Генератор з Rozetka
node scripts/parse-product.js https://rozetka.com.ua/ua/itc_power_gg18i/p356935005/ generators

# Зарядна станція
node scripts/parse-product.js https://rozetka.com.ua/ua/ecoflow_delta2/p123456789/ power-stations

# Інвертор з Prom.ua
node scripts/parse-product.js https://prom.ua/p123456789-invertor.html inverters
```

**Доступні категорії:**

| Команда | Що парситься |
|---------|-------------|
| `generators` | Генератори |
| `inverters` | Інвертори |
| `solar-panels` | Сонячні панелі |
| `batteries` | Акумулятори (АКБ) |
| `power-stations` | Зарядні станції |

### Що робить скрипт:
1. Відкриває сторінку товару в справжньому браузері Chrome (непомітно)
2. Витягує: назву, бренд, ціну, фото, характеристики
3. Запитує у вас доповнити поля, які не знайшов автоматично
4. Зберігає в потрібний `data/<категорія>.json`
5. Сайт автоматично показує новий товар

---

## 📁 Структура проєкту

```
lighton/
├── index.html              # Головна сторінка
├── catalog.html            # Каталог товарів (категорія через #hash)
├── repair.html             # Список статей по ремонту
├── article.html            # Окрема стаття (через #hash)
│
├── assets/
│   ├── css/style.css       # Стилі (редагуйте для свого дизайну)
│   ├── js/main.js          # Вся логіка сайту
│   └── img/placeholder.svg # Заглушка для відсутніх фото
│
├── data/                   # JSON-файли (заповнюються парсером)
│   ├── index.json          # Індекс категорій
│   ├── generators.json     # Генератори
│   ├── inverters.json      # Інвертори
│   ├── solar-panels.json   # Сонячні панелі
│   ├── batteries.json      # АКБ
│   ├── power-stations.json # Зарядні станції
│   └── repair-articles.json# Статті по ремонту (редагуєте вручну)
│
├── scripts/
│   └── parse-product.js    # Парсер товарів (основний скрипт)
│
├── SETUP.bat               # Встановлення Windows (двічі клікнути)
└── setup.sh                # Встановлення Mac/Linux
```

---

## 💰 Монетизація (Google AdSense → $30/місяць)

### Як підключити AdSense:
1. Зареєструйтеся на https://adsense.google.com
2. Додайте сайт та пройдіть верифікацію (1-3 тижні)
3. Замініть в HTML заглушки `[Google AdSense]` на реальний код:

```html
<!-- Замість цього: -->
<div class="ad-slot">[Google AdSense]</div>

<!-- Вставте це: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
  data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

### Де розміщені рекламні місця:
- Головна — під hero-банером
- Каталог — вгорі та внизу списку товарів
- Ремонт — вгорі сторінки
- Стаття — між вступом і змістом, та в кінці

---

## 🌐 Деплой на GitHub Pages

```bash
git init
git add .
git commit -m "Initial LightOn deploy"
git branch -M main
git remote add origin https://github.com/YOURNAME/lighton.git
git push -u origin main
```

Потім у репозиторії: **Settings → Pages → Source: main / root**

Сайт: `https://YOURNAME.github.io/lighton/`

При кожному `git push` — GitHub Actions автоматично оновлює сайт.

---

## 🔧 Статті по ремонту

Статті редагуєте вручну у файлі `data/repair-articles.json`.  
Структура одної статті:

```json
{
  "slug": "generator-ne-zapuskayetsya",
  "title": "Генератор не запускається: причини та ремонт",
  "metaTitle": "...",
  "metaDescription": "...",
  "intro": "Вступний абзац...",
  "sections": [
    { "h2": "1. Перевірте пальне", "text": "Текст розділу..." }
  ],
  "keywords": ["ключове слово 1", "ключове слово 2"]
}
```

---

## 📈 SEO-стратегія

Ключові запити:
- `генератор купити Україна`
- `EcoFlow DELTA 2 ціна Україна`
- `генератор не запускається що робити`
- `LiFePO4 акумулятор 100Аг`
- `сонячні панелі для дому ціна`

Рекомендовано: додати Google Search Console та sitemap.
