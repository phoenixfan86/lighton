#!/usr/bin/env node
/**
 * ============================================================
 * LightOn — Парсер товарів (з логуванням)
 * ============================================================
 */

const { chromium } = require("playwright");
const fs            = require("fs");
const path          = require("path");
const readline      = require("readline");

const CONFIG = {
  pageTimeout:   60_000,
  waitAfterLoad: 5_000,
  retries:       2,
  dataDir:       path.join(__dirname, "../data"),
  logDir:        path.join(__dirname, "../logs"), // папка для логів
};

// ─────────────────────────────────────────────────────────────
// ЛОГУВАННЯ У ФАЙЛ (виправлене)
// ─────────────────────────────────────────────────────────────

let logStream = null;
let isLoggingActive = true;

function initLogging() {
  if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(CONFIG.logDir, `parser-${timestamp}.log`);
  logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  console.log(`📝 Логи зберігаються у: ${logFile}\n`);
  
  // Зберігаємо оригінальні функції
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.log = (...args) => {
    const message = args.join(' ');
    originalConsoleLog(...args);
    if (logStream && isLoggingActive) {
      logStream.write(`[LOG] ${message}\n`);
    }
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    originalConsoleError(...args);
    if (logStream && isLoggingActive) {
      logStream.write(`[ERROR] ${message}\n`);
    }
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    originalConsoleWarn(...args);
    if (logStream && isLoggingActive) {
      logStream.write(`[WARN] ${message}\n`);
    }
  };
}

function closeLogging() {
  isLoggingActive = false;
  if (logStream) {
    logStream.end();
    logStream = null;
  }
  console.log(`\n📝 Логи збережено.`);
}

// ─────────────────────────────────────────────────────────────
// КАТЕГОРІЇ
// ─────────────────────────────────────────────────────────────

const CATEGORY_FIELDS = {
  "generators":    ["powerKW", "fuelType", "fuelTankL", "noiseDb", "engineBrand", "startType", "runtimeH", "weightKg"],
  "inverters":     ["powerW", "inputVoltage", "outputVoltage", "waveform", "efficiency"],
  "solar-panels":  ["powerWp", "cellType", "efficiency", "dimensions", "weightKg", "warrantyYears"],
  "batteries":     ["capacityAh", "voltageV", "chemistry", "cyclesCount", "weightKg"],
  "power-stations":["capacityWh", "acOutputW", "usbPorts", "solarInputW", "chargingTimeH"],
};

const CATEGORY_META = {
  "generators": {
    categoryLabel:   "Генератори",
    metaTitle:       "Каталог генераторів — ціни, характеристики | LightOn",
    metaDescription: "Порівняйте бензинові, дизельні та газові генератори. Характеристики, ціни в Україні.",
    h1:              "Каталог генераторів",
    intro:           "Вибір генератора — відповідальне рішення для дому чи бізнесу.",
  },
  "inverters": {
    categoryLabel:   "Інвертори",
    metaTitle:       "Каталог інверторів — ціни та характеристики | LightOn",
    metaDescription: "Порівняйте інвертори: чиста синусоїда, гібридні, сонячні. Ціни в Україні.",
    h1:              "Каталог інверторів",
    intro:           "Інвертор перетворює постійний струм у змінний 220В.",
  },
  "solar-panels": {
    categoryLabel:   "Сонячні панелі",
    metaTitle:       "Каталог сонячних панелей — ціни та характеристики | LightOn",
    metaDescription: "Монокристалічні та полікристалічні сонячні панелі. Ціни в Україні.",
    h1:              "Каталог сонячних панелей",
    intro:           "Сонячні панелі — основа автономної електростанції.",
  },
  "batteries": {
    categoryLabel:   "Акумулятори (АКБ)",
    metaTitle:       "Каталог акумуляторів АКБ — ціни та характеристики | LightOn",
    metaDescription: "AGM, GEL та LiFePO4 акумулятори. Ціни в Україні.",
    h1:              "Каталог акумуляторних батарей (АКБ)",
    intro:           "Акумулятор — серце резервної системи живлення.",
  },
  "power-stations": {
    categoryLabel:   "Зарядні станції",
    metaTitle:       "Каталог зарядних станцій — EcoFlow, Bluetti, Jackery | LightOn",
    metaDescription: "Портативні зарядні станції. Ємність, потужність, ціни в Україні.",
    h1:              "Каталог портативних зарядних станцій",
    intro:           "Зарядні станції — мобільні акумулятори з виходами 220В.",
  },
};

// ─────────────────────────────────────────────────────────────
// УТИЛІТИ ДЛЯ РОБОТИ З ЧИСЛАМИ (ПОКРАЩЕНІ)
// ─────────────────────────────────────────────────────────────

/**
 * Витягує число з рядка (покращена версія)
 */
function extractNum(str) {
  if (!str) return null;
  
  const stringValue = String(str);
  console.log(`      🔢 extractNum отримав: "${stringValue}"`);
  
  // Шукаємо всі числа в рядку
  const numbers = stringValue.match(/(\d+(?:[.,]\d+)?)/g);
  
  if (!numbers || numbers.length === 0) {
    console.log(`      ❌ Числа не знайдено`);
    return null;
  }
  
  // Беремо перше число
  const firstNumber = numbers[0];
  console.log(`      🔢 Знайдено число: "${firstNumber}"`);
  
  // Замінюємо кому на крапку
  const normalized = firstNumber.replace(',', '.');
  const num = parseFloat(normalized);
  
  console.log(`      🔢 Результат: ${num}`);
  return isNaN(num) ? null : num;
}

/**
 * Шукає характеристику за ключовими словами
 */
function findSpec(specs, keywords) {
  console.log(`      🔍 Пошук за ключовими словами: ${keywords.join(', ')}`);
  
  for (const [key, value] of Object.entries(specs)) {
    // Очищаємо ключ
    const cleanKey = key.toLowerCase()
      .replace(/[\n\r\t]/g, ' ')
      .replace(/[?,:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    for (const kw of keywords) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanKey.includes(cleanKw)) {
        console.log(`      ✅ Знайдено: ключ="${key}" → значення="${value}"`);
        return value;
      }
    }
  }
  
  console.log(`      ❌ Не знайдено жодного ключового слова`);
  return null;
}

// ─────────────────────────────────────────────────────────────
// ПАРСЕР HOTLINE
// ─────────────────────────────────────────────────────────────
async function parseHotline(page, url) {
  console.log("  🔍 Парсинг Hotline.ua...");

  await page.goto(url, { waitUntil: "networkidle", timeout: CONFIG.pageTimeout });
  await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(3000);

const basicData = await page.evaluate((findSpecFunc) => {
    // Перетворюємо рядок назад у функцію
    const findSpec = new Function('return ' + findSpecFunc)();
    
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.innerText.trim() : null;
    };

    const title = getText("h1") || "";

    // Ціна - шукаємо в блоці many__price
    let price = 0;
    
    // Спосіб 1: шукаємо блок з цінами
    const priceBlock = document.querySelector(".many__price, [class*='many__price']");
    if (priceBlock) {
      // Шукаємо всі числа в блоці цін
      const numbers = priceBlock.innerText.match(/(\d[\d\s]*)/g);
      if (numbers && numbers.length > 0) {
        // Беремо перше число (мінімальну ціну)
        const firstPrice = parseInt(numbers[0].replace(/\s/g, ""));
        if (firstPrice > 0 && firstPrice < 1000000) {
          price = firstPrice;
        }
      }
    }
    
    // Спосіб 2: якщо не знайшли, шукаємо за іншими селекторами
    if (price === 0) {
      const priceSelectors = [
        ".many__price-sum",
        "[class*='price__value']",
        "[class*='product-price']",
        ".price",
        "[itemprop='price']"
      ];
      
      for (const sel of priceSelectors) {
        const priceRaw = getText(sel);
        if (priceRaw) {
          const numbers = priceRaw.match(/(\d[\d\s]*)/g);
          if (numbers && numbers.length > 0) {
            const firstPrice = parseInt(numbers[0].replace(/\s/g, ""));
            if (firstPrice > 0 && firstPrice < 1000000) {
              price = firstPrice;
              break;
            }
          }
        }
      }
    }
    
    // Спосіб 3: шукаємо через data-tracking-id
    if (price === 0) {
      const priceElement = document.querySelector("[data-tracking-id*='product'] .JjmhYXYTUFchrSUabkqd span");
      if (priceElement) {
        const priceText = priceElement.innerText.trim();
        const match = priceText.match(/(\d[\d\s]*)/);
        if (match) {
          price = parseInt(match[1].replace(/\s/g, ""));
        }
      }
    }

    console.log(`Знайдена ціна: ${price} ₴`);

    // Опис
    const description = getText("[itemprop='description']") ||
                        getText("[class*='description']") || "";

    // Характеристики
    const specs = {};
    const specTables = document.querySelectorAll("table");
    
    for (const table of specTables) {
      const rows = table.querySelectorAll("tr");
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length === 2) {
          let key = cells[0].innerText.trim().replace(/[:\s]+$/, "");
          let value = cells[1].innerText.trim().replace(/\s+/g, " ").replace(/^\?:\s*/, "");
          
          const link = cells[1].querySelector("a");
          if (link) value = link.innerText.trim();
          
          if (key && value && !specs[key]) {
            specs[key] = value;
          }
        }
      }
    }
    
    // Використовуємо findSpec для пошуку бренду
    let brand = findSpec(specs, ["Бренд", "бренд", "Brand", "brand"]);
    
    // Якщо не знайшли, шукаємо через селектори
    if (!brand) {
      brand = getText("[itemprop='brand']") || getText("[class*='brand']") || "";
    }
    
    // Якщо все ще не знайшли, пробуємо взяти з першого слова назви
    if (!brand && title) {
      const firstWord = title.split(/\s+/)[0];
      if (firstWord && firstWord.length > 2 && !firstWord.match(/генератор|інвертор|панель|акумулятор|станція/i)) {
        brand = firstWord;
      }
    }

    return { title, price, brand, description, specs };
  }, findSpec.toString());

   console.log("  🖼️ Збір зображень...");
  
  const images = [];
  
  // Чекаємо завантаження галереї
  await page.waitForSelector(".zoom-gallery__canvas-img", { timeout: 10000 }).catch(() => {
    console.log("  ⚠️ Галерея зображень не знайдена");
  });
  
  // Отримуємо перше зображення
  const firstImage = await page.$eval(".zoom-gallery__canvas-img", (img) => {
    let src = img.src;
    if (src && !src.startsWith("http")) {
      src = "https://hotline.ua" + src;
    }
    return src;
  }).catch(() => null);
  
  if (firstImage) {
    images.push(firstImage);
    console.log(`  🖼️ Зображення 1: ${firstImage}`);
  }
  
  // Шукаємо кнопку "наступне"
  const nextButtonSelector = ".zoom-gallery__arrow--next";
  const hasNextButton = await page.$(nextButtonSelector).catch(() => null);
  
  if (hasNextButton) {
    console.log("  🔘 Знайдено кнопку 'наступне'");
    
    // Збираємо до 3 зображень (максимум)
    for (let i = 1; i < 3; i++) {
      // Перевіряємо, чи кнопка активна (не має класу disabled)
      const isDisabled = await page.$eval(nextButtonSelector, (btn) => {
        return btn.disabled || btn.classList.contains('disabled');
      }).catch(() => true);
      
      if (isDisabled) {
        console.log(`  ⏹️ Кнопка "наступне" неактивна, зупиняємось`);
        break;
      }
      
      // Клікаємо на кнопку
      console.log(`  🔘 Клік для отримання зображення ${i + 1}...`);
      await page.click(nextButtonSelector);
      
      // Чекаємо зміни зображення
      await page.waitForTimeout(1500);
      
      // Отримуємо нове зображення
      const newImage = await page.$eval(".zoom-gallery__canvas-img", (img) => {
        let src = img.src;
        if (src && !src.startsWith("http")) {
          src = "https://hotline.ua" + src;
        }
        return src;
      }).catch(() => null);
      
      if (newImage && !images.includes(newImage)) {
        images.push(newImage);
        console.log(`  🖼️ Зображення ${i + 1}: ${newImage}`);
      } else {
        console.log(`  ⏹️ Зображення не змінилося або дублікат`);
        break;
      }
      
      await page.waitForTimeout(500);
    }
  } else {
    console.log("  ⚠️ Кнопку 'наступне' не знайдено");
  }
  
  // Перетворюємо відносні URL в абсолютні та очищаємо
  const finalImages = images.map(img => {
    // Якщо URL відносний, додаємо домен
    if (img && !img.startsWith("http")) {
      img = "https://hotline.ua" + img;
    }
    // Видаляємо розміри з URL
    img = img.replace(/_\d+x\d+/, "");
    img = img.replace(/thumbnail/, "big");
    return img;
  });
  
  console.log(`  📊 Всього зібрано зображень: ${finalImages.length}`);
  
  // Логуємо знайдені зображення
  finalImages.forEach((img, idx) => {
    console.log(`    🖼️ ${idx + 1}: ${img}`);
  });
  
  return {
    title: basicData.title,
    price: basicData.price,
    images: finalImages,
    brand: basicData.brand,
    rating: 0,
    description: basicData.description,
    specs: basicData.specs
  };
}

// ─────────────────────────────────────────────────────────────
// ПАРСЕР ROZETKA
// ─────────────────────────────────────────────────────────────

async function parseRozetka(page, url) {
  console.log("  🔍 Парсинг Rozetka...");

  await page.goto(url, { waitUntil: "networkidle", timeout: CONFIG.pageTimeout });
  await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.innerText.trim() : null;
    };

    const title = getText("h1") || "";

    let price = 0;
    const priceSelectors = ["p.product-price__big", "[class*='product-price__big']", "[data-testid='price']"];
    for (const sel of priceSelectors) {
      const priceRaw = getText(sel);
      if (priceRaw) {
        const match = priceRaw.match(/(\d[\d\s]*)/);
        if (match) {
          price = parseInt(match[1].replace(/\s/g, ""));
          if (price > 0) break;
        }
      }
    }

    const images = [];
    const imgElements = document.querySelectorAll("img.product-photo__image, img[class*='product-photo'], .product-photo img");
    for (const img of imgElements) {
      let src = img.src || img.getAttribute("data-src");
      if (src && src.startsWith("http") && !images.includes(src)) {
        images.push(src);
        if (images.length >= 3) break;
      }
    }

    const brand = getText("[class*='manufacturer'] [itemprop='name']") || getText("[class*='brand']") || "";
    const description = getText("[class*='product-about__description-content']") || "";

    const specs = {};
    const charBlocks = document.querySelectorAll("rz-product-characteristics, [class*='characteristics']");
    
    for (const block of charBlocks) {
      const items = block.querySelectorAll(".item");
      for (const item of items) {
        const dt = item.querySelector("dt");
        const dd = item.querySelector("dd");
        if (dt && dd) {
          const key = dt.innerText.trim();
          let value = dd.innerText.trim();
          if (!value) {
            const link = dd.querySelector("a");
            if (link) value = link.innerText.trim();
          }
          if (key && value && !specs[key]) {
            specs[key] = value;
          }
        }
      }
    }
    
    return { title, price, images, brand, rating: 0, description, specs };
  });

  console.log(`  📊 Знайдено характеристик: ${Object.keys(data.specs).length}`);
  return data;
}

// ─────────────────────────────────────────────────────────────
// ПАРСЕР PROM.UA
// ─────────────────────────────────────────────────────────────

async function parseProm(page, url) {
  console.log("  🔍 Парсинг Prom.ua...");
  
  await page.goto(url, { waitUntil: "networkidle", timeout: CONFIG.pageTimeout });
  await page.waitForTimeout(5000);

  const data = await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerText.trim() : null;
    };

    const title = getText("[data-qaid='product_name']") || getText("h1") || "";
    
    let price = 0;
    const priceRaw = getText("[data-qaid='product_price']") || "";
    if (priceRaw) {
      const match = priceRaw.match(/(\d[\d\s]*)/);
      if (match) price = parseInt(match[1].replace(/\s/g, ""));
    }

    const images = [];
    const imgElements = document.querySelectorAll("[data-qaid='product_gallery'] img");
    for (const img of imgElements) {
      if (img.src && img.src.startsWith("http")) {
        images.push(img.src);
        if (images.length >= 3) break;
      }
    }

    const brand = getText("[data-qaid='product_brand']") || "";
    const description = getText("[data-qaid='product_description']") || "";

    const specs = {};
    const attrBlocks = document.querySelectorAll("[data-qaid='attributes'] li");
    for (const block of attrBlocks) {
      const parts = block.innerText.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(":").trim();
        if (key && val) specs[key] = val;
      }
    }

    return { title, price, images, brand, rating: 0, description, specs };
  });

  console.log(`  📊 Знайдено характеристик: ${Object.keys(data.specs).length}`);
  return data;
}

function detectSite(url) {
  if (url.includes("rozetka.com.ua")) return "rozetka";
  if (url.includes("prom.ua")) return "prom";
  if (url.includes("hotline.ua")) return "hotline";
  return "generic";
}

function detectSiteLabel(url) {
  if (url.includes("rozetka")) return "Rozetka";
  if (url.includes("prom.ua")) return "Prom.ua";
  if (url.includes("hotline")) return "Hotline.ua";
  return "Магазин";
}

function makeSlug(url, title) {
  const match = url.match(/\/([a-z0-9_-]+)\/p\d+/);
  if (match) return match[1].toLowerCase().replace(/_/g, "-");
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

// ─────────────────────────────────────────────────────────────
// ПОБУДОВА ОБ'ЄКТУ ТОВАРУ (З ДЕТАЛЬНИМ ЛОГУВАННЯМ)
// ─────────────────────────────────────────────────────────────

function buildProductObject(raw, category, url) {
  const { title, price, images, brand, description, specs } = raw;

  let detectedBrand = brand || "";
  let model = title || "";
  
  if (!detectedBrand && title) {
    const parts = title.split(/\s+/);
    detectedBrand = parts[0] || "";
    model = parts.slice(1).join(" ") || title;
  }

  const product = {
    slug: makeSlug(url, title),
    brand: detectedBrand,
    model: model,
    image: images[0] || "",
    images: images.slice(0, 3),
    priceUAH: price || 0,
    rating: 0,
    description: (description || "").slice(0, 500).replace(/\s+/g, " ").trim(),
    buyLinks: [{ name: detectSiteLabel(url), url }],
    repairLinks: [],
  };

  console.log("\n  📊 Всі знайдені характеристики для маппінгу:");
  Object.entries(specs).forEach(([k, v]) => {
    console.log(`    → ${k}: ${v.substring(0, 100)}`);
  });

  if (category === "generators") {
    console.log("\n  🔧 Маппінг характеристик генератора:");
    
    // POWERKW
    const powerValue = findSpec(specs, ["Номінальна потужність", "номінальна потужність", "Максимальна потужність", "потужність"]);
    product.powerKW = powerValue ? extractNum(powerValue) : null;
    console.log(`    ${product.powerKW ? '✅' : '❌'} powerKW: ${product.powerKW || 'не знайдено'}`);
    
    // FUELTYPE
    const fuelValue = findSpec(specs, ["Паливо", "паливо", "Вид палива", "вид палива", "Тип палива"]);
    product.fuelType = fuelValue || "";
    console.log(`    ${product.fuelType ? '✅' : '❌'} fuelType: ${product.fuelType || 'не знайдено'}`);
    
    // FUELTANKL
    const tankValue = findSpec(specs, ["Об'єм паливного бака", "об'єм паливного бака", "Об'єм бака"]);
    product.fuelTankL = tankValue ? extractNum(tankValue) : null;
    console.log(`    ${product.fuelTankL ? '✅' : '❌'} fuelTankL: ${product.fuelTankL || 'не знайдено'}`);
    
    // NOISEDB
    console.log("\n    🎯 Детальний пошук для noiseDb:");
    const noiseValue = findSpec(specs, [
      "Рівень шуму",
      "рівень шуму",
      "noise"
    ]);
    
    if (noiseValue) {
      console.log(`    📝 Знайдено значення: "${noiseValue}"`);
      const extracted = extractNum(noiseValue);
      product.noiseDb = extracted;
      console.log(`    ${extracted ? '✅' : '❌'} Результат: ${extracted || 'не знайдено'}`);
    } else {
      console.log(`    ❌ Ключ "Рівень шуму" не знайдено в характеристиках`);
      console.log(`    📋 Доступні ключі: ${Object.keys(specs).slice(0, 10).join(', ')}`);
    }
    
    // ENGINEBRAND
    const engineValue = findSpec(specs, ["Тип двигуна", "тип двигуна", "Двигун"]);
    product.engineBrand = engineValue || "";
    console.log(`    ${product.engineBrand ? '✅' : '❌'} engineBrand: ${product.engineBrand || 'не знайдено'}`);
    
    // STARTTYPE
    const startValue = findSpec(specs, ["Система пуску", "система пуску", "запуск", "старт"]);
    product.startType = startValue || "";
    console.log(`    ${product.startType ? '✅' : '❌'} startType: ${product.startType || 'не знайдено'}`);
    
    // RUNTIMEH
    const runtimeValue = findSpec(specs, ["Тривалість автономної роботи", "тривалість автономної роботи", "Час роботи"]);
    product.runtimeH = runtimeValue ? extractNum(runtimeValue) : null;
    console.log(`    ${product.runtimeH ? '✅' : '❌'} runtimeH: ${product.runtimeH || 'не знайдено'}`);
    
    // WEIGHTKG
    const weightValue = findSpec(specs, ["Вага", "вага", "weight"]);
    product.weightKg = weightValue ? extractNum(weightValue) : null;
    console.log(`    ${product.weightKg ? '✅' : '❌'} weightKg: ${product.weightKg || 'не знайдено'}`);
  }

  // ── Маппінг для зарядних станцій ──
  else if (category === "power-stations") {
    console.log("\n  🔧 Маппінг характеристик зарядної станції:");
    
    product.capacityWh = extractNum(findSpec(specs, [
      "ємність", "capacity", "вт·год", "wh", "ват·год"
    ]));
    console.log(`    ✅ capacityWh: ${product.capacityWh || "не знайдено"}`);
    
    product.acOutputW = extractNum(findSpec(specs, [
      "вихідна потужність", "ac output", "вихід змінного", "ac потужність", "Номінальна потужність"
    ]));
    console.log(`    ✅ acOutputW: ${product.acOutputW || "не знайдено"}`);

    product.acSocket = extractNum(findSpec(specs, ["Розетка AC 230В"]));
    console.log(`    ✅ acSocket: ${product.acSocket || "не знайдено"}`);
    
    product.usbPorts = extractNum(findSpec(specs, [
      "usb", "порти usb", "роз'єми usb", "кількість usb"
    ]));
    console.log(`    ✅ usbPorts: ${product.usbPorts || "не знайдено"}`);
    
    product.solarInputW = extractNum(findSpec(specs, [
      "сонячний вхід", "solar", "mppt", "вхід від сонця", "зарядки від сонячної панелі", "Потужність зарядки від сонячної панелі, Вт"
    ]));
    console.log(`    ✅ solarInputW: ${product.solarInputW || "не знайдено"}`);
    
    product.chargingTimeH = extractNum(findSpec(specs, [
      "час заряду", "charging time", "час заряджання", "зарядки від розетки", "Час зарядки від розетки, год"
    ]));
    console.log(`    ✅ chargingTimeH: ${product.chargingTimeH || "не знайдено"}`);

    product.batTech = extractNum(findSpec(specs, ["Технологія"]));
    console.log(`    ✅ batTech: ${product.batTech || "не знайдено"}`);

    product.batCapacity = extractNum(findSpec(specs, ["Ємність"]));
    console.log(`    ✅ batCapacity: ${product.batCapacity || "не знайдено"}`);
  }

  // ── Маппінг для сонячних панелей ──
  else if (category === "solar-panels") {
    console.log("\n  🔧 Маппінг характеристик сонячної панелі:");
    
    product.powerWp = extractNum(findSpec(specs, [
      "пікова потужність", "потужність", "макс. потужність", "pmax", "wp"
    ]));
    console.log(`    ✅ powerWp: ${product.powerWp || "не знайдено"}`);
    
    product.cellType = findSpec(specs, [
      "Тип", "тип комірок", "тип елементів", "технологія", "монокристал", "полікристал"
    ]) || "";
    console.log(`    ✅ cellType: ${product.cellType || "не знайдено"}`);
    
    product.efficiency = extractNum(findSpec(specs, [
      "ккд", "ефективність", "efficiency"
    ]));
    console.log(`    ✅ efficiency: ${product.efficiency || "не знайдено"}`);
    
    product.dimensions = findSpec(specs, [
      "Висота", "розміри", "габарити", "dimensions"
    ]) || "";
    console.log(`    ✅ dimensions: ${product.dimensions || "не знайдено"}`);
    
    product.weightKg = extractNum(findSpec(specs, [
      "вага", "weight", "кг"
    ]));
    console.log(`    ✅ weightKg: ${product.weightKg || "не знайдено"}`);
    
    product.warrantyYears = extractNum(findSpec(specs, [
      "гарантія", "warranty", "термін гарантії"
    ]));
    console.log(`    ✅ warrantyYears: ${product.warrantyYears || "не знайдено"}`);
  }
  
  // ── Маппінг для акумуляторів ──
  else if (category === "batteries") {
    console.log("\n  🔧 Маппінг характеристик акумулятора:");
    
    product.capacityAh = extractNum(findSpec(specs, [
      "ємність", "capacity", "аг", "ah", "номінальна ємність"
    ]));
    console.log(`    ✅ capacityAh: ${product.capacityAh || "не знайдено"}`);
    
    product.voltageV = extractNum(findSpec(specs, [
      "напруга", "voltage", "вольт", "номінальна напруга"
    ]));
    console.log(`    ✅ voltageV: ${product.voltageV || "не знайдено"}`);
    
    product.chemistry = findSpec(specs, [
      "технологія", "тип", "chemistry", "lifepo4", "agm", "gel", "тип акумулятора"
    ]) || "";
    console.log(`    ✅ chemistry: ${product.chemistry || "не знайдено"}`);
    
    product.cyclesCount = extractNum(findSpec(specs, [
      "цикли", "cycles", "кількість циклів", "ресурс"
    ]));
    console.log(`    ✅ cyclesCount: ${product.cyclesCount || "не знайдено"}`);
    
    product.weightKg = extractNum(findSpec(specs, [
      "вага", "weight"
    ]));
    console.log(`    ✅ weightKg: ${product.weightKg || "не знайдено"}`);
  }

   // ── Маппінг для інверторів ──
  else if (category === "inverters") {
    console.log("\n  🔧 Маппінг характеристик інвертора:");
    
    product.powerW = extractNum(findSpec(specs, [
      "потужність", "номінальна потужність", "power", "вт", "ват"
    ]));
    console.log(`    ✅ powerW: ${product.powerW || "не знайдено"}`);
    
    product.inputVoltage = findSpec(specs, [
      "вхідна напруга", "вхід", "input voltage", "вхідна напруга, В"
    ]) || "";
    console.log(`    ✅ inputVoltage: ${product.inputVoltage || "не знайдено"}`);
    
    product.outputVoltage = findSpec(specs, [
      "вихідна напруга", "вихід", "output voltage", "вихідна напруга, В"
    ]) || "";
    console.log(`    ✅ outputVoltage: ${product.outputVoltage || "не знайдено"}`);
    
    product.waveform = findSpec(specs, [
      "форма сигналу", "форма", "синус", "waveform", "тип струму"
    ]) || "";
    console.log(`    ✅ waveform: ${product.waveform || "не знайдено"}`);
    
    product.efficiency = extractNum(findSpec(specs, [
      "ккд", "кпд", "efficiency", "ефективність"
    ]));
    console.log(`    ✅ efficiency: ${product.efficiency || "не знайдено"}`);
  }

  return product;
}

// ─────────────────────────────────────────────────────────────
// ФУНКЦІЇ ДЛЯ РОБОТИ З JSON
// ─────────────────────────────────────────────────────────────

function loadJson(category) {
  const filePath = path.join(CONFIG.dataDir, `${category}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  const meta = CATEGORY_META[category] || {};
  return {
    category: category,
    categoryLabel: meta.categoryLabel || category,
    metaTitle: meta.metaTitle || `Каталог — ${category}`,
    metaDescription: meta.metaDescription || "",
    h1: meta.h1 || category,
    intro: meta.intro || "",
    items: [],
  };
}

function saveJson(category, data) {
  if (!fs.existsSync(CONFIG.dataDir)) {
    fs.mkdirSync(CONFIG.dataDir, { recursive: true });
  }
  const filePath = path.join(CONFIG.dataDir, `${category}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  ✅ Збережено: data/${category}.json`);
}

function upsertProduct(category, product) {
  const data = loadJson(category);
  const existing = data.items.findIndex((i) => i.slug === product.slug);
  if (existing >= 0) {
    data.items[existing] = product;
    console.log(`  ♻️  Оновлено існуючий товар: ${product.brand} ${product.model}`);
  } else {
    data.items.push(product);
    console.log(`  ➕ Додано новий товар: ${product.brand} ${product.model}`);
  }
  saveJson(category, data);
  return data.items.length;
}

async function interactiveRefine(product, category) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const catFields = CATEGORY_FIELDS[category] || [];
  
  const ask = (question) => new Promise((resolve) => rl.question(question, resolve));
  
  console.log("\n─────────────────────────────────────────");
  console.log("📝 Перевірте та доповніть дані товару:");
  console.log("─────────────────────────────────────────");
  console.log(`\n  Бренд:   "${product.brand}"`);
  console.log(`  Модель:  "${product.model}"`);
  console.log(`  Ціна:    ${product.priceUAH} ₴`);
  
  const filledFields = catFields.filter((f) => product[f] && product[f] !== 0 && product[f] !== "");
  const emptyFields = catFields.filter((f) => !product[f] && product[f] !== 0);
  
  if (filledFields.length > 0) {
    console.log(`\n  ✅ Знайдені поля: ${filledFields.join(", ")}`);
    for (const field of filledFields) {
      console.log(`    → ${field}: ${product[field]}`);
    }
  }
  
  if (emptyFields.length > 0) {
    console.log(`\n  ⚠️  Не вдалося автоматично знайти: ${emptyFields.join(", ")}`);
    console.log("  Введіть значення або натисніть Enter щоб пропустити:\n");
    
    for (const field of emptyFields) {
      const currentVal = product[field] || "";
      const val = await ask(`  ${field} (поточне: ${currentVal || "пусто"}): `);
      if (val.trim()) {
        const numVal = parseFloat(val);
        product[field] = isNaN(numVal) ? val : numVal;
      }
    }
  }
  
  rl.close();
  return product;
}

// ─────────────────────────────────────────────────────────────
// ГОЛОВНА ФУНКЦІЯ
// ─────────────────────────────────────────────────────────────

async function main() {
  // Ініціалізуємо логування
  initLogging();
  
  const args = process.argv.slice(2);
  const url = args[0];
  const category = args[1];

  if (!url || !category) {
    console.log(`
LightOn — Парсер товарів (з логуванням)

Використання:
  node parse-product.js <URL> <категорія>

Категорії:
  generators, inverters, solar-panels, batteries, power-stations

Підтримувані сайти:
  - Rozetka
  - Prom.ua
  - Hotline.ua

Приклад:
  node parse-product.js https://hotline.ua/ua/dacha_sad-generatory/maxpeedingrods-mxr4500i/ generators
`);
    closeLogging();
    process.exit(1);
  }

  console.log(`\n🔆 LightOn Парсер (з логуванням)`);
  console.log(`   URL:       ${url}`);
  console.log(`   Категорія: ${category}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const site = detectSite(url);
    console.log(`  🌐 Визначено сайт: ${site}`);
    
    let raw;
    if (site === "rozetka") {
      raw = await parseRozetka(page, url);
    } else if (site === "prom") {
      raw = await parseProm(page, url);
    } else if (site === "hotline") {
      raw = await parseHotline(page, url);
    } else {
      console.log("  ❌ Непідтримуваний сайт");
      await browser.close();
      closeLogging();
      process.exit(1);
    }
    
    await browser.close();
    
    if (!raw || (!raw.title && Object.keys(raw.specs).length === 0)) {
      console.error("❌ Не вдалося отримати дані");
      closeLogging();
      process.exit(1);
    }
    
    console.log(`\n⚙️  Обробка даних…`);
    console.log(`  Знайдено характеристик: ${Object.keys(raw.specs).length}`);
    
    const product = buildProductObject(raw, category, url);
    const finalProduct = await interactiveRefine(product, category);
    const total = upsertProduct(category, finalProduct);
    
    console.log(`\n✨ Готово! Всього товарів у категорії: ${total}\n`);
    
  } catch (error) {
    console.error("❌ Помилка:", error);
  } finally {
    await browser.close();
    closeLogging();
  }
}

main().catch((e) => {
  console.error("❌ Критична помилка:", e.message);
  closeLogging();
  process.exit(1);
});