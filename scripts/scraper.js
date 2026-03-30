/**
 * ============================================================
 * LightOn — Скрипт для збору даних про пристрої
 * ============================================================
 * Запуск: node scripts/scraper.js
 * Результат: файли data/*.json
 *
 * Що робить:
 *  1. Описує пристрої вручну (seed-дані) — найнадійніший підхід
 *     без блокування та капч від магазинів
 *  2. Зберігає JSON-файли у папку data/
 *  3. Окремі поля для кожного типу пристрою
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// ДОПОМІЖНІ ФУНКЦІЇ
// ─────────────────────────────────────────────────────────────

/** Записує JSON-файл у папку data/ */
function saveJson(filename, data) {
  const dir = path.join(__dirname, "../data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  const count = data.items ? data.items.length : Object.keys(data).length;
  console.log(`✅  Збережено: data/${filename} (${count} записів)`);
}

// ─────────────────────────────────────────────────────────────
// СПІЛЬНІ ПОЛЯ ДЛЯ ВСІХ ПРИСТРОЇВ
// ─────────────────────────────────────────────────────────────
// brand, model, image, priceUAH, rating, description,
// buyLinks[], repairLinks[], slug

// ─────────────────────────────────────────────────────────────
// 1. ГЕНЕРАТОРИ
// Унікальні поля: powerKW, fuelType, fuelTankL, noiseDb,
//                 engineCC, engineBrand, startType, runtime
// ─────────────────────────────────────────────────────────────
const generators = {
  category: "generators",
  categoryLabel: "Генератори",
  metaTitle: "Каталог генераторів — ціни, характеристики, відгуки | LightOn",
  metaDescription:
    "Порівняйте бензинові, дизельні та газові генератори від Honda, Kipor, Vitals. Характеристики, ціни в Україні, де купити та де відремонтувати.",
  h1: "Каталог генераторів",
  intro:
    "Вибір генератора — відповідальне рішення для дому чи бізнесу. У цьому каталозі зібрані популярні моделі з детальними характеристиками та цінами в Україні.",
  items: [
    {
      slug: "honda-eu22i",
      brand: "Honda",
      model: "EU22i",
      image: "https://m.media-amazon.com/images/I/71q3l7cJJgL._AC_SL1500_.jpg",
      priceUAH: 42000,
      rating: 4.8,
      description:
        "Інверторний генератор Honda EU22i — тихий, економічний, ідеальний для дому та відпочинку.",
      // Специфічні для генератора
      powerKW: 2.2,
      fuelType: "бензин",
      fuelTankL: 3.6,
      noiseDb: 53,
      engineCC: 121,
      engineBrand: "Honda GXR120",
      startType: "ручний",
      runtimeH: 8.1,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Honda+EU22i" },
        { name: "Prom.ua", url: "https://prom.ua/Generatory?search_term=Honda+EU22i" },
      ],
      repairLinks: [
        { name: "Honda сервіс Київ", url: "https://www.honda.ua/power/service" },
      ],
    },
    {
      slug: "kipor-kde6700t",
      brand: "Kipor",
      model: "KDE6700T",
      image: "https://m.media-amazon.com/images/I/61mIBz3QVVL._AC_SL1200_.jpg",
      priceUAH: 38500,
      rating: 4.3,
      description:
        "Дизельний генератор Kipor KDE6700T з потужністю 5 кВт для тривалої роботи.",
      powerKW: 5.0,
      fuelType: "дизель",
      fuelTankL: 12,
      noiseDb: 68,
      engineCC: 418,
      engineBrand: "Kipor KM186F",
      startType: "електричний",
      runtimeH: 10,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Kipor+KDE6700T" },
        { name: "Prom.ua", url: "https://prom.ua/Generatory?search_term=Kipor+KDE6700T" },
      ],
      repairLinks: [
        { name: "Kipor сервіс", url: "https://kipor.com.ua/service" },
      ],
    },
    {
      slug: "vitals-egb-5500-wm",
      brand: "Vitals",
      model: "EGB 5500WM",
      image: "https://content.rozetka.com.ua/goods/images/big/354614278.jpg",
      priceUAH: 18900,
      rating: 4.1,
      description:
        "Бензиновий генератор Vitals 5.5 кВт з електростартом — надійний вибір для дому.",
      powerKW: 5.5,
      fuelType: "бензин",
      fuelTankL: 15,
      noiseDb: 72,
      engineCC: 389,
      engineBrand: "Vitals",
      startType: "електричний",
      runtimeH: 9,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Vitals+EGB+5500WM" },
        { name: "Epicentr", url: "https://epicentrk.ua/search/?q=Vitals+generator" },
      ],
      repairLinks: [
        { name: "Vitals сервіс", url: "https://vitals.com.ua/service" },
      ],
    },
    {
      slug: "briggs-stratton-p2400",
      brand: "Briggs & Stratton",
      model: "P2400",
      image: "https://m.media-amazon.com/images/I/71KlBnKbvaL._AC_SL1500_.jpg",
      priceUAH: 35000,
      rating: 4.6,
      description:
        "Інверторний генератор Briggs & Stratton P2400 — тихий і потужний для побутових потреб.",
      powerKW: 2.2,
      fuelType: "бензин",
      fuelTankL: 4.0,
      noiseDb: 59,
      engineCC: 171,
      engineBrand: "Briggs & Stratton 1150 Series",
      startType: "ручний",
      runtimeH: 10,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Briggs+Stratton+P2400" },
      ],
      repairLinks: [
        { name: "Briggs сервіс", url: "https://www.briggsandstratton.com/na/en_us/locate-dealer.html" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 2. ІНВЕРТОРИ
// Унікальні поля: powerW, inputVoltage, outputVoltage,
//                 waveform, efficiency
// ─────────────────────────────────────────────────────────────
const inverters = {
  category: "inverters",
  categoryLabel: "Інвертори",
  metaTitle: "Каталог інверторів — ціни та характеристики | LightOn",
  metaDescription:
    "Порівняйте інвертори для дому та авто: чиста синусоїда, ДБЖ, сонячні інвертори. Характеристики, ціни, де купити в Україні.",
  h1: "Каталог інверторів",
  intro:
    "Інвертор перетворює постійний струм акумулятора або сонячних панелей у змінний струм 220 В. Оберіть модель за потужністю та типом хвилі.",
  items: [
    {
      slug: "must-ph18-3024-plus",
      brand: "Must",
      model: "PH18-3024 Plus",
      image: "https://must-power.com/wp-content/uploads/2021/09/PH18-3024.jpg",
      priceUAH: 12500,
      rating: 4.5,
      description:
        "Гібридний інвертор Must 3 кВт з чистою синусоїдою та вбудованим контролером заряду.",
      powerW: 3000,
      inputVoltage: "24V DC",
      outputVoltage: "230V AC",
      waveform: "чиста синусоїда",
      efficiency: 93,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Must+PH18-3024" },
        { name: "Prom.ua", url: "https://prom.ua/Invertory?search_term=Must+PH18" },
      ],
      repairLinks: [
        { name: "Must сервіс Україна", url: "https://must-power.ua/service" },
      ],
    },
    {
      slug: "luxeon-lap-500sp",
      brand: "Luxeon",
      model: "LAP-500SP",
      image: "https://content.rozetka.com.ua/goods/images/big/358900000.jpg",
      priceUAH: 3200,
      rating: 4.2,
      description:
        "Автомобільний інвертор Luxeon 500 Вт з чистою синусоїдою від прикурювача.",
      powerW: 500,
      inputVoltage: "12V DC",
      outputVoltage: "230V AC",
      waveform: "чиста синусоїда",
      efficiency: 88,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Luxeon+LAP-500SP" },
      ],
      repairLinks: [],
    },
    {
      slug: "deye-sun-5k-sg04lp3",
      brand: "Deye",
      model: "SUN-5K-SG04LP3",
      image: "https://deye.com/wp-content/uploads/2022/10/5KW.jpg",
      priceUAH: 58000,
      rating: 4.7,
      description:
        "Сонячний гібридний інвертор Deye 5 кВт з підтримкою LiFePO4 та мережевої роботи.",
      powerW: 5000,
      inputVoltage: "48V DC",
      outputVoltage: "230V AC",
      waveform: "чиста синусоїда",
      efficiency: 97,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Deye+SUN-5K" },
        { name: "SolarTown", url: "https://solartown.com.ua/search?q=Deye" },
      ],
      repairLinks: [
        { name: "Deye Україна", url: "https://deye.com.ua/service" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 3. СОНЯЧНІ ПАНЕЛІ
// Унікальні поля: powerWp, cellType, efficiency, dimensions,
//                 weightKg, warrantyYears
// ─────────────────────────────────────────────────────────────
const solarPanels = {
  category: "solar-panels",
  categoryLabel: "Сонячні панелі",
  metaTitle: "Каталог сонячних панелей — ціни та характеристики | LightOn",
  metaDescription:
    "Порівняйте монокристалічні та полікристалічні сонячні панелі. Jinko, Longi, Canadian Solar. Ціни в Україні 2026.",
  h1: "Каталог сонячних панелей",
  intro:
    "Сонячні панелі — основа автономної електростанції. Порівняйте монокристалічні та гетероперехідні панелі за потужністю, ефективністю та ціною.",
  items: [
    {
      slug: "jinko-tiger-neo-n-type-420w",
      brand: "Jinko Solar",
      model: "Tiger Neo N-Type 420W",
      image: "https://www.jinkosolar.com/uploads/Tiger_Neo_N-type_54HL4R-V.jpg",
      priceUAH: 8900,
      rating: 4.8,
      description:
        "Монокристалічна панель Jinko Tiger Neo 420 Вт типу N — висока ефективність та двостороннє поглинання.",
      powerWp: 420,
      cellType: "монокристал N-type",
      efficiency: 21.4,
      dimensions: "1762 × 1134 × 30 мм",
      weightKg: 21.3,
      warrantyYears: 30,
      buyLinks: [
        { name: "SolarTown", url: "https://solartown.com.ua/search?q=Jinko+420" },
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Jinko+420W" },
      ],
      repairLinks: [],
    },
    {
      slug: "longi-hi-mo-6-440w",
      brand: "Longi",
      model: "Hi-MO 6 440W",
      image: "https://www.longi.com/media/solar-panels/hi-mo-6.jpg",
      priceUAH: 9400,
      rating: 4.7,
      description:
        "Двостороння сонячна панель Longi Hi-MO 6 440 Вт — преміальний вибір для дахових систем.",
      powerWp: 440,
      cellType: "монокристал HPBC",
      efficiency: 22.0,
      dimensions: "1818 × 1134 × 30 мм",
      weightKg: 22.5,
      warrantyYears: 30,
      buyLinks: [
        { name: "SolarTown", url: "https://solartown.com.ua/search?q=Longi+440" },
      ],
      repairLinks: [],
    },
    {
      slug: "canadian-solar-hiku6-390w",
      brand: "Canadian Solar",
      model: "HiKu6 390W",
      image: "https://www.canadiansolar.com/wp-content/uploads/2021/09/CS6R-395MS.jpg",
      priceUAH: 7200,
      rating: 4.5,
      description:
        "Полікристалічна панель Canadian Solar 390 Вт — оптимальне співвідношення ціни та якості.",
      powerWp: 390,
      cellType: "полікристал",
      efficiency: 19.9,
      dimensions: "1776 × 1096 × 35 мм",
      weightKg: 22.0,
      warrantyYears: 25,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Canadian+Solar+390" },
        { name: "Epicentr", url: "https://epicentrk.ua/search/?q=Canadian+Solar" },
      ],
      repairLinks: [],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 4. АКУМУЛЯТОРНІ БАТАРЕЇ (АКБ)
// Унікальні поля: capacityAh, voltageV, chemistry,
//                 cyclesCount, weightKg
// ─────────────────────────────────────────────────────────────
const batteries = {
  category: "batteries",
  categoryLabel: "Акумулятори (АКБ)",
  metaTitle: "Каталог акумуляторів АКБ — ціни та характеристики | LightOn",
  metaDescription:
    "Порівняйте AGM, GEL та LiFePO4 акумулятори для ДБЖ, сонячних систем та авто. Ціни в Україні, характеристики 2026.",
  h1: "Каталог акумуляторних батарей (АКБ)",
  intro:
    "Акумулятор — серце резервної системи живлення. Оберіть між AGM, GEL або LiFePO4 залежно від бюджету та кількості циклів.",
  items: [
    {
      slug: "litime-12v-100ah-lifepo4",
      brand: "LiTime",
      model: "12V 100Ah LiFePO4",
      image: "https://m.media-amazon.com/images/I/71nNlVBkWML._AC_SL1500_.jpg",
      priceUAH: 14500,
      rating: 4.7,
      description:
        "Літієвий акумулятор LiTime LiFePO4 100 Аг — 4000+ циклів, вбудована BMS, легка вага.",
      capacityAh: 100,
      voltageV: 12,
      chemistry: "LiFePO4",
      cyclesCount: 4000,
      weightKg: 10.2,
      buyLinks: [
        { name: "Amazon", url: "https://www.amazon.com/s?k=LiTime+100ah+LiFePO4" },
        { name: "Prom.ua", url: "https://prom.ua/Akkumulyatory?search_term=LiFePO4+100ah" },
      ],
      repairLinks: [],
    },
    {
      slug: "logicpower-agm-100ah",
      brand: "LogicPower",
      model: "AGM 100Ah 12V",
      image: "https://content.rozetka.com.ua/goods/images/big/309000000.jpg",
      priceUAH: 4800,
      rating: 4.3,
      description:
        "AGM акумулятор LogicPower 100 Аг — надійний і доступний для ДБЖ та резервних систем.",
      capacityAh: 100,
      voltageV: 12,
      chemistry: "AGM",
      cyclesCount: 500,
      weightKg: 28.5,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=LogicPower+AGM+100" },
      ],
      repairLinks: [],
    },
    {
      slug: "fiamm-fg21202-gel",
      brand: "FIAMM",
      model: "FG21202 GEL 12V 120Ah",
      image: "https://m.media-amazon.com/images/I/61nqH4KVDTL._AC_SL1000_.jpg",
      priceUAH: 8900,
      rating: 4.5,
      description:
        "GEL акумулятор FIAMM 120 Аг — підходить для глибокого циклу та сонячних систем.",
      capacityAh: 120,
      voltageV: 12,
      chemistry: "GEL",
      cyclesCount: 800,
      weightKg: 34.0,
      buyLinks: [
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=FIAMM+GEL+120" },
        { name: "Prom.ua", url: "https://prom.ua/Akkumulyatory?search_term=FIAMM+GEL" },
      ],
      repairLinks: [],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 5. ЗАРЯДНІ СТАНЦІЇ (POWERSTATION)
// Унікальні поля: capacityWh, capacityAh, acOutputW,
//                 usbPorts, solarInputW, chargingTimeH
// ─────────────────────────────────────────────────────────────
const powerStations = {
  category: "power-stations",
  categoryLabel: "Зарядні станції",
  metaTitle: "Каталог зарядних станцій — EcoFlow, Bluetti, Jackery | LightOn",
  metaDescription:
    "Порівняйте портативні зарядні станції EcoFlow, Bluetti, Jackery. Ємність, потужність, ціни в Україні 2026.",
  h1: "Каталог портативних зарядних станцій",
  intro:
    "Зарядні станції (Power Station) — мобільні акумулятори з виходами 220 В. Ідеальні для відключень світла, кемпінгу та роботи вдома.",
  items: [
    {
      slug: "ecoflow-delta-2",
      brand: "EcoFlow",
      model: "DELTA 2",
      image: "https://m.media-amazon.com/images/I/71E7Xia8s7L._AC_SL1500_.jpg",
      priceUAH: 32000,
      rating: 4.8,
      description:
        "EcoFlow DELTA 2 — 1024 Вт·год, заряджається до 80% за 50 хвилин. Підтримка сонячних панелей.",
      capacityWh: 1024,
      capacityAh: 0, // не застосовується
      acOutputW: 1800,
      usbPorts: 6,
      solarInputW: 500,
      chargingTimeH: 1.2,
      buyLinks: [
        { name: "EcoFlow UA", url: "https://ecoflow.com/uk" },
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=EcoFlow+DELTA+2" },
      ],
      repairLinks: [
        { name: "EcoFlow сервіс", url: "https://ecoflow.com/uk/pages/service" },
      ],
    },
    {
      slug: "bluetti-ac200p",
      brand: "Bluetti",
      model: "AC200P",
      image: "https://m.media-amazon.com/images/I/71C-CJ3AlEL._AC_SL1500_.jpg",
      priceUAH: 45000,
      rating: 4.7,
      description:
        "Bluetti AC200P — 2000 Вт·год, 17 портів виходу, підходить для тривалих відключень.",
      capacityWh: 2000,
      capacityAh: 0,
      acOutputW: 2000,
      usbPorts: 4,
      solarInputW: 700,
      chargingTimeH: 2.5,
      buyLinks: [
        { name: "Bluetti UA", url: "https://bluettipower.ua" },
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Bluetti+AC200P" },
      ],
      repairLinks: [
        { name: "Bluetti сервіс", url: "https://bluettipower.ua/service" },
      ],
    },
    {
      slug: "jackery-explorer-1000-pro",
      brand: "Jackery",
      model: "Explorer 1000 Pro",
      image: "https://m.media-amazon.com/images/I/71aKFRgFyQL._AC_SL1500_.jpg",
      priceUAH: 28500,
      rating: 4.6,
      description:
        "Jackery Explorer 1000 Pro — 1002 Вт·год, тихий вентилятор, заряджання за 1.8 год.",
      capacityWh: 1002,
      capacityAh: 0,
      acOutputW: 1000,
      usbPorts: 3,
      solarInputW: 400,
      chargingTimeH: 1.8,
      buyLinks: [
        { name: "Jackery UA", url: "https://jackery.eu/uk" },
        { name: "Rozetka", url: "https://rozetka.com.ua/search/?text=Jackery+1000+Pro" },
      ],
      repairLinks: [
        { name: "Jackery сервіс", url: "https://jackery.eu/uk/pages/service" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// СТАТТІ ПО РЕМОНТУ
// ─────────────────────────────────────────────────────────────
const repairArticles = {
  generators: [
    {
      slug: "generator-ne-zapuskayetsya",
      title: "Генератор не запускається: причини та ремонт своїми руками",
      metaTitle: "Генератор не запускається — що робити, причини та ремонт | LightOn",
      metaDescription:
        "Генератор не запускається після зими або під навантаженням? Розбираємо 7 основних причин та способи усунення.",
      intro:
        "Якщо бензиновий або дизельний генератор відмовляється заводитися, причина зазвичай в одному з трьох вузлів: паливна система, іскра або декомпресор.",
      sections: [
        {
          h2: "1. Перевірте пальне",
          text: "Найчастіша причина — старе або несвіже паливо. Після зберігання злийте старий бензин і залийте свіжий АІ-95.",
        },
        {
          h2: "2. Свічка запалювання",
          text: "Викрутіть свічку, очистіть або замініть. Зазор повинен бути 0.6–0.8 мм. Чорний нагар — ознака багатого паливно-повітряного суміші.",
        },
        {
          h2: "3. Карбюратор — промивка",
          text: "Карбюратор засмічується після тривалого зберігання. Розберіть, промийте жиклери карбклінером, продуйте стисненим повітрям.",
        },
        {
          h2: "4. Повітряний фільтр",
          text: "Забитий фільтр обмежує потік повітря. Очистіть або замініть поролоновий/паперовий елемент.",
        },
        {
          h2: "5. Масло та датчик рівня масла",
          text: "Багато генераторів мають захист від низького рівня масла. Перевірте рівень щупом і долийте до мітки MAX.",
        },
        {
          h2: "Де придбати запчастини",
          text: 'Свічки, фільтри та карбюратори шукайте у розділі <a href="/parts.html">Запчастини</a>.',
        },
      ],
      keywords: [
        "генератор не запускається",
        "чому не заводиться генератор",
        "ремонт генератора своїми руками",
        "генератор не працює причини",
      ],
    },
    {
      slug: "generator-ne-daye-220v",
      title: "Генератор не дає 220В: діагностика та ремонт",
      metaTitle: "Генератор не дає 220В — причини та ремонт обмотки | LightOn",
      metaDescription:
        "Двигун генератора працює, але немає напруги 220В? Крок за кроком розбираємо: конденсатор, AVR, обмотки статора.",
      intro:
        "Двигун запускається, але розеткa мовчить — класична проблема, пов'язана з обмоткою або блоком автоматичного регулятора напруги (AVR).",
      sections: [
        {
          h2: "1. Конденсатор збудження",
          text: "Пусковий конденсатор — перше що виходить з ладу. Замініть на аналогічний за ємністю (мкФ) і напругою.",
        },
        {
          h2: "2. Блок AVR",
          text: "Автоматичний регулятор напруги підтримує стабільні 220В. Перевірте мультиметром вихідну напругу AVR.",
        },
        {
          h2: "3. Обмотки статора",
          text: "Обрив або міжвиткове замикання обмотки виявляється мегаомметром. Перемотка — складна процедура, краще у сервісі.",
        },
      ],
      keywords: [
        "генератор не дає напругу",
        "генератор 0 вольт",
        "ремонт AVR генератора",
        "конденсатор збудження генератора",
      ],
    },
  ],
  inverters: [
    {
      slug: "invertor-peregrovaetsya",
      title: "Інвертор перегрівається та вимикається: що робити",
      metaTitle: "Інвертор перегрівається та вимикається — причини та усунення | LightOn",
      metaDescription:
        "Інвертор вимикається через перегрів? Очистіть вентилятор, перевірте навантаження та вхідну напругу. Покрокова інструкція.",
      intro:
        "Перегрів інвертора — поширена проблема при неправильному встановленні або перевантаженні. Більшість причин можна усунути самостійно.",
      sections: [
        {
          h2: "1. Очистіть вентилятор та радіатор",
          text: "Пил на радіаторі — головний ворог. Продуйте балончиком зі стисненим повітрям або пилосмоком.",
        },
        {
          h2: "2. Перевірте навантаження",
          text: "Сума потужностей всіх підключених приладів не повинна перевищувати 80% від номінальної потужності інвертора.",
        },
        {
          h2: "3. Вхідна напруга акумулятора",
          text: "При низькій напрузі АКБ інвертор споживає більший струм і гріється. Заряджайте або замінюйте АКБ.",
        },
      ],
      keywords: [
        "інвертор перегрівається",
        "інвертор вимикається під навантаженням",
        "ремонт інвертора",
        "інвертор гріється",
      ],
    },
  ],
  "solar-panels": [
    {
      slug: "sonyachna-panel-ne-zaryadzhaye",
      title: "Сонячна панель не заряджає акумулятор: діагностика",
      metaTitle: "Сонячна панель не заряджає акумулятор — причини | LightOn",
      metaDescription:
        "Контролер показує 0А від панелей? Перевірте напругу панелі, полярність, контролер MPPT та тіньові ефекти.",
      intro:
        "Сонячна панель не виробляє струм або він занадто малий? Проблема може бути в самій панелі, контролері або підключенні.",
      sections: [
        {
          h2: "1. Виміряйте напругу панелі",
          text: "На сонці Voc панелі 12В системи має бути 18–22В. Якщо менше — можливе затінення або пошкодження клітин.",
        },
        {
          h2: "2. Перевірте контролер заряду",
          text: "MPPT контролер показує напругу та струм на дисплеї. Нуль струму при достатній напрузі — несправний контролер.",
        },
        {
          h2: "3. Тіньові ефекти",
          text: "Навіть 10% затінення однієї клітини знижує виробіток усього ряду. Переконайтеся, що панелі не затінені.",
        },
      ],
      keywords: [
        "сонячна панель не заряджає",
        "панель 0 ампер",
        "MPPT контролер не заряджає",
        "перевірка сонячної панелі",
      ],
    },
  ],
  batteries: [
    {
      slug: "akb-ne-trimaye-zaryadku",
      title: "Акумулятор не тримає заряд: причини та десульфатація",
      metaTitle: "Акумулятор не тримає заряд — причини та відновлення АКБ | LightOn",
      metaDescription:
        "Акумулятор швидко розряджається? Перевірте ємність, десульфатуйте або замініть АКБ. Покрокова інструкція.",
      intro:
        "Якщо повністю заряджений акумулятор розряджається за кілька годин без навантаження — це ознака сульфатації або внутрішнього замикання.",
      sections: [
        {
          h2: "1. Перевірте реальну ємність",
          text: "Підключіть навантаження 10% від ємності (для 100Аг — 10А) і виміряйте час розряду до 11.1В.",
        },
        {
          h2: "2. Десульфатація",
          text: "Спеціальний режим зарядного пристрою або десульфататор може відновити 20–40% ємності свинцево-кислотного АКБ.",
        },
        {
          h2: "3. Коли замінити",
          text: "Якщо реальна ємність менше 50% від номінальної — АКБ підлягає заміні. LiFePO4 служить 10+ років при правильній експлуатації.",
        },
      ],
      keywords: [
        "акумулятор не тримає заряд",
        "АКБ швидко розряджається",
        "десульфатація акумулятора",
        "відновлення АКБ",
      ],
    },
  ],
  "power-stations": [
    {
      slug: "zaryadvna-stantsiya-ne-zaryadzhayetsya",
      title: "Зарядна станція не заряджається: діагностика EcoFlow, Bluetti",
      metaTitle: "Зарядна станція не заряджається — причини та ремонт | LightOn",
      metaDescription:
        "EcoFlow або Bluetti не заряджається від розетки або сонячних панелей? Перевірте кабель, температуру та BMS.",
      intro:
        "Портативна зарядна станція відмовляється заряджатися? Розбираємо покроково: від простих причин до складних несправностей BMS.",
      sections: [
        {
          h2: "1. Перевірте кабель та адаптер",
          text: "Починайте з простого — замініть кабель живлення та перевірте розетку. 30% звернень вирішуються заміною кабелю.",
        },
        {
          h2: "2. Температурний захист",
          text: "При температурі нижче 0°C або вище +45°C BMS блокує заряд. Перенесіть у тепло та зачекайте 30 хвилин.",
        },
        {
          h2: "3. Скидання BMS",
          text: "Для EcoFlow: утримуйте кнопку AC 3 секунди. Для Bluetti: повністю розрядіть до вимкнення і підключіть знову.",
        },
        {
          h2: "4. Гарантійний ремонт",
          text: "Більшість станцій мають гарантію 24 місяці. Зверніться до офіційного сервісу — посилання в картці пристрою.",
        },
      ],
      keywords: [
        "EcoFlow не заряджається",
        "Bluetti не заряджається",
        "зарядна станція не заряджає",
        "ремонт EcoFlow",
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// ЗБЕРЕЖЕННЯ ВСІХ ДАНИХ
// ─────────────────────────────────────────────────────────────
function main() {
  console.log("\n🔆 LightOn — генерація даних\n");

  saveJson("generators.json", generators);
  saveJson("inverters.json", inverters);
  saveJson("solar-panels.json", solarPanels);
  saveJson("batteries.json", batteries);
  saveJson("power-stations.json", powerStations);
  saveJson("repair-articles.json", { articles: repairArticles });

  // Зберегти мета-індекс категорій для навігації сайту
  const index = {
    categories: [
      { id: "generators", label: "Генератори", icon: "⚡", file: "generators.json" },
      { id: "inverters", label: "Інвертори", icon: "🔄", file: "inverters.json" },
      { id: "solar-panels", label: "Сонячні панелі", icon: "☀️", file: "solar-panels.json" },
      { id: "batteries", label: "Акумулятори", icon: "🔋", file: "batteries.json" },
      { id: "power-stations", label: "Зарядні станції", icon: "💡", file: "power-stations.json" },
    ],
  };
  saveJson("index.json", index);

  console.log("\n✨ Готово! Всі JSON-файли збережено у папку data/\n");
}

main();
