// generate-product-pages.js
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://lighton.pp.ua';
const categories = ['generators', 'inverters', 'solar-panels', 'batteries', 'power-stations'];

const categoryNames = {
  "generators": "Генератори",
  "inverters": "Інвертори",
  "solar-panels": "Сонячні панелі",
  "batteries": "Акумулятори",
  "power-stations": "Зарядні станції"
};

// Функція для формування H1 без дублювання бренду
function getProductTitle(product) {
  if (product.model && product.model.toLowerCase().includes(product.brand.toLowerCase())) {
    return product.model;
  }
  return `${product.brand} ${product.model}`;
}

// Функція для отримання повного опису характеристик
function getFullSpecsHtml(product, category) {
  const specs = [];
  
  if (product.brand) specs.push(`<div class="spec-item"><strong>Бренд</strong><span>${escapeHtml(product.brand)}</span></div>`);
  if (product.model) specs.push(`<div class="spec-item"><strong>Модель</strong><span>${escapeHtml(product.model)}</span></div>`);
  
  switch (category) {
    case "generators":
      if (product.powerKW) specs.push(`<div class="spec-item"><strong>Потужність</strong><span>${product.powerKW} кВт</span></div>`);
      if (product.fuelType) specs.push(`<div class="spec-item"><strong>Тип палива</strong><span>${escapeHtml(product.fuelType)}</span></div>`);
      if (product.fuelTankL) specs.push(`<div class="spec-item"><strong>Об'єм бака</strong><span>${product.fuelTankL} л</span></div>`);
      if (product.noiseDb) specs.push(`<div class="spec-item"><strong>Рівень шуму</strong><span>${product.noiseDb} дБ</span></div>`);
      if (product.engineBrand) specs.push(`<div class="spec-item"><strong>Двигун</strong><span>${escapeHtml(product.engineBrand)}</span></div>`);
      if (product.startType) specs.push(`<div class="spec-item"><strong>Запуск</strong><span>${escapeHtml(product.startType)}</span></div>`);
      if (product.runtimeH) specs.push(`<div class="spec-item"><strong>Час роботи</strong><span>${product.runtimeH} год</span></div>`);
      if (product.weightKg) specs.push(`<div class="spec-item"><strong>Вага</strong><span>${product.weightKg} кг</span></div>`);
      break;
      
    case "inverters":
      if (product.powerW) specs.push(`<div class="spec-item"><strong>Потужність</strong><span>${product.powerW} Вт</span></div>`);
      if (product.inputVoltage) specs.push(`<div class="spec-item"><strong>Вхідна напруга</strong><span>${escapeHtml(product.inputVoltage)}</span></div>`);
      if (product.outputVoltage) specs.push(`<div class="spec-item"><strong>Вихідна напруга</strong><span>${escapeHtml(product.outputVoltage)}</span></div>`);
      if (product.waveform) specs.push(`<div class="spec-item"><strong>Форма сигналу</strong><span>${escapeHtml(product.waveform)}</span></div>`);
      if (product.efficiency) specs.push(`<div class="spec-item"><strong>ККД</strong><span>${product.efficiency}%</span></div>`);
      break;
      
    case "solar-panels":
      if (product.powerWp) specs.push(`<div class="spec-item"><strong>Потужність</strong><span>${product.powerWp} Вт</span></div>`);
      if (product.cellType) specs.push(`<div class="spec-item"><strong>Тип комірок</strong><span>${escapeHtml(product.cellType)}</span></div>`);
      if (product.efficiency) specs.push(`<div class="spec-item"><strong>Ефективність</strong><span>${product.efficiency}%</span></div>`);
      if (product.dimensions) specs.push(`<div class="spec-item"><strong>Розміри</strong><span>${escapeHtml(product.dimensions)}</span></div>`);
      if (product.weightKg) specs.push(`<div class="spec-item"><strong>Вага</strong><span>${product.weightKg} кг</span></div>`);
      if (product.warrantyYears) specs.push(`<div class="spec-item"><strong>Гарантія</strong><span>${product.warrantyYears} років</span></div>`);
      break;
      
    case "batteries":
      if (product.capacityAh) specs.push(`<div class="spec-item"><strong>Ємність</strong><span>${product.capacityAh} Аг</span></div>`);
      if (product.voltageV) specs.push(`<div class="spec-item"><strong>Напруга</strong><span>${product.voltageV} В</span></div>`);
      if (product.chemistry) specs.push(`<div class="spec-item"><strong>Тип</strong><span>${escapeHtml(product.chemistry)}</span></div>`);
      if (product.cyclesCount) specs.push(`<div class="spec-item"><strong>Цикли заряд-розряд</strong><span>${product.cyclesCount} циклів</span></div>`);
      if (product.weightKg) specs.push(`<div class="spec-item"><strong>Вага</strong><span>${product.weightKg} кг</span></div>`);
      break;
      
    case "power-stations":
      if (product.capacityWh) specs.push(`<div class="spec-item"><strong>Ємність</strong><span>${product.capacityWh} Вт·год</span></div>`);
      if (product.acOutputW) specs.push(`<div class="spec-item"><strong>AC вихід</strong><span>${product.acOutputW} Вт</span></div>`);
      if (product.usbPorts) specs.push(`<div class="spec-item"><strong>USB порти</strong><span>${product.usbPorts} шт</span></div>`);
      if (product.solarInputW) specs.push(`<div class="spec-item"><strong>Сонячний вхід</strong><span>${product.solarInputW} Вт</span></div>`);
      if (product.chargingTimeH) specs.push(`<div class="spec-item"><strong>Час зарядки</strong><span>${product.chargingTimeH} год</span></div>`);
      break;
  }
  
  return specs.join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Функція для генерації галереї з кнопками
function getImageGallery(product) {
  const galleryImages = [];
  if (product.image) galleryImages.push(product.image);
  if (product.images && product.images.length) {
    galleryImages.push(...product.images);
  }
  
  if (galleryImages.length === 0) {
    return '<p>📷 Зображення відсутні</p>';
  }
  
  // Формуємо HTML для галереї з кнопками
  return `
    <div class="product-gallery-container">
      <div class="gallery-main">
        <button class="gallery-nav gallery-prev" id="galleryPrev" aria-label="Попереднє зображення">❮</button>
        <div class="gallery-item">
          <img id="galleryMainImage" src="${galleryImages[0]}" alt="${escapeHtml(product.model)} - головне фото" onclick="openImageModal(this.src)" loading="lazy" onerror="this.src='../../assets/img/placeholder.svg'">
        </div>
        <button class="gallery-nav gallery-next" id="galleryNext" aria-label="Наступне зображення">❯</button>
      </div>
      ${galleryImages.length > 1 ? `
        <div class="gallery-thumbnails" id="galleryThumbnails">
          ${galleryImages.map((img, idx) => `
            <img 
              src="${img}" 
              alt="${escapeHtml(product.model)} - фото ${idx + 1}"
              class="gallery-thumbnail ${idx === 0 ? 'active' : ''}"
              data-index="${idx}"
              loading="lazy"
              onerror="this.src='../../assets/img/placeholder.svg'"
            >
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Schema.org Product розмітка
function getProductSchema(product, category, canonicalUrl, productTitle, categoryName) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productTitle,
    "description": product.description?.substring(0, 500) || `${productTitle} — ${categoryName}`,
    "url": canonicalUrl,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    }
  };

  if (product.image) {
    schema.image = [product.image];
    if (product.images?.length) schema.image.push(...product.images);
  }

  if (product.priceUAH) {
    schema.offers = {
      "@type": "Offer",
      "price": product.priceUAH,
      "priceCurrency": "UAH",
      "availability": "https://schema.org/InStock",
      "url": canonicalUrl
    };
  }

  if (product.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "bestRating": 5,
      "worstRating": 1,
      "ratingCount": 1
    };
  }

  // Додаємо специфічні характеристики як additionalProperty
  const props = [];
  switch (category) {
    case "generators":
      if (product.powerKW)   props.push(["Потужність", `${product.powerKW} кВт`]);
      if (product.fuelType)  props.push(["Тип палива", product.fuelType]);
      if (product.fuelTankL) props.push(["Об'єм бака", `${product.fuelTankL} л`]);
      if (product.noiseDb)   props.push(["Рівень шуму", `${product.noiseDb} дБ`]);
      if (product.startType) props.push(["Тип запуску", product.startType]);
      if (product.runtimeH)  props.push(["Час роботи", `${product.runtimeH} год`]);
      break;
    case "inverters":
      if (product.powerW)       props.push(["Потужність", `${product.powerW} Вт`]);
      if (product.waveform)     props.push(["Форма сигналу", product.waveform]);
      if (product.inputVoltage) props.push(["Вхідна напруга", product.inputVoltage]);
      if (product.efficiency)   props.push(["ККД", `${product.efficiency}%`]);
      break;
    case "solar-panels":
      if (product.powerWp)       props.push(["Потужність", `${product.powerWp} Вт`]);
      if (product.cellType)      props.push(["Тип комірок", product.cellType]);
      if (product.efficiency)    props.push(["Ефективність", `${product.efficiency}%`]);
      if (product.warrantyYears) props.push(["Гарантія", `${product.warrantyYears} років`]);
      break;
    case "batteries":
      if (product.capacityAh) props.push(["Ємність", `${product.capacityAh} Аг`]);
      if (product.voltageV)   props.push(["Напруга", `${product.voltageV} В`]);
      if (product.chemistry)  props.push(["Тип", product.chemistry]);
      if (product.cyclesCount)props.push(["Циклів заряду", `${product.cyclesCount}`]);
      break;
    case "power-stations":
      if (product.capacityWh)    props.push(["Ємність", `${product.capacityWh} Вт·год`]);
      if (product.acOutputW)     props.push(["AC вихід", `${product.acOutputW} Вт`]);
      if (product.solarInputW)   props.push(["Сонячний вхід", `${product.solarInputW} Вт`]);
      if (product.chargingTimeH) props.push(["Час зарядки", `${product.chargingTimeH} год`]);
      break;
  }

  if (props.length) {
    schema.additionalProperty = props.map(([name, value]) => ({
      "@type": "PropertyValue",
      "name": name,
      "value": value
    }));
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}<\/script>`;
}

// Функція для отримання схожих товарів
function getRelatedProductsHtml(currentProduct, categoryId, allProducts) {
  const sameBrandProducts = allProducts.filter(item => 
    item.brand === currentProduct.brand && 
    item.slug !== currentProduct.slug
  );
  
  let relatedProducts = sameBrandProducts;
  let sectionTitle = `Інші товари бренду ${currentProduct.brand}`;
  
  if (sameBrandProducts.length === 0) {
    relatedProducts = allProducts
      .filter(item => item.slug !== currentProduct.slug)
      .slice(0, 4);
    sectionTitle = `Інші товари в категорії`;
  } else {
    relatedProducts = relatedProducts.slice(0, 4);
  }
  
  if (relatedProducts.length === 0) {
    return '';
  }
  
  return `
    <div class="related-products-section">
      <h3 class="related-products-title">${sectionTitle}</h3>
      <div class="related-products-grid">
        ${relatedProducts.map(item => renderProductCardStatic(item, categoryId)).join('')}
      </div>
    </div>
  `;
}

// Функція для генерації noscript блоку з посиланнями (для SEO краулерів)
function getNoscriptLinksHtml(currentProduct, categoryId, allProducts, categoryName) {
  const otherProducts = allProducts.filter(item => item.slug !== currentProduct.slug);
  
  if (otherProducts.length === 0) return '';
  
  return `
    <noscript>
      <nav aria-label="Інші товари категорії ${categoryName}">
        <ul>
          ${otherProducts.map(item => `<li><a href="../../products/${categoryId}/${item.slug}.html">${escapeHtml(getProductTitle(item))}</a></li>`).join('\n          ')}
        </ul>
      </nav>
    </noscript>
  `;
}

// Функція для рендеру картки товару в статичній версії
function renderProductCardStatic(item, category) {
  const specs = getSpecsStatic(item, category);
  const buyLink = item.buyLinks && item.buyLinks.length ? item.buyLinks[0] : { name: "Знайти", url: "#" };
  const imgSrc = item.image || "../../assets/img/placeholder.svg";
  const productTitle = getProductTitle(item);
  
  return `
    <div class="product-card" data-slug="${item.slug}" data-category="${category}">
      <a href="../${category}/${item.slug}.html" class="product-card-link">
        <img class="product-card__img" src="${imgSrc}" alt="${productTitle}" onerror="this.src='../../assets/img/placeholder.svg'" loading="lazy">
        <div class="product-card__body">
          <div class="product-card__brand">${escapeHtml(item.brand)}</div>
          <div class="product-card__title">${escapeHtml(item.model)}</div>
          <p class="product-card__desc">${escapeHtml(item.description?.substring(0, 150) || '')}...</p>
          <div class="product-card__specs">${specs.map(s => `<span>${s}</span>`).join('')}</div>
          <div class="product-card__price">${item.priceUAH ? `${item.priceUAH.toLocaleString("uk-UA")} ₴` : "— ₴"}</div>
        </div>
      </a>
      <div class="product-card__footer">
        <a href="../${category}/${item.slug}.html" class="details-link">📖 Детальніше</a>
        <a href="${buyLink.url}" target="_blank" rel="nofollow sponsored">🛒 ${buyLink.name}</a>
      </div>
    </div>
  `;
}

function getSpecsStatic(item, category) {
  const specs = [];
  if (item.rating) specs.push(`⭐ ${item.rating}`);
  switch (category) {
    case "generators":
      if (item.powerKW) specs.push(`⚡ ${item.powerKW} кВт`);
      if (item.fuelType) specs.push(`⛽ ${item.fuelType}`);
      if (item.fuelTankL) specs.push(`🛢 ${item.fuelTankL} л`);
      if (item.noiseDb) specs.push(`🔊 ${item.noiseDb} дБ`);
      if (item.startType) specs.push(`🔑 ${item.startType} старт`);
      if (item.runtimeH) specs.push(`⏱ ${item.runtimeH} год`);
      break;
    case "batteries":
      if (item.capacityAh) specs.push(`🔋 ${item.capacityAh} Аг`);
      if (item.voltageV) specs.push(`⚡ ${item.voltageV} В`);
      if (item.chemistry) specs.push(`🧪 ${item.chemistry}`);
      break;
    default:
      break;
  }
  return specs;
}

// Головна функція генерації
async function generateProductPages() {
  console.log('🚀 Починаємо генерацію статичних сторінок товарів...\n');
  
  const productsDir = path.join(__dirname, 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir);
  }
  
  let generatedCount = 0;
  let errorCount = 0;
  const allProductsData = {};

  // Спочатку завантажуємо всі товари для генерації схожих
  for (const category of categories) {
    const filePath = path.join(__dirname, 'data', `${category}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        allProductsData[category] = data.items || [];
      } catch (err) {
        console.log(`⚠️ Помилка читання ${category}.json:`, err.message);
      }
    }
  }

  // Генеруємо сторінки
  for (const category of categories) {
    const filePath = path.join(__dirname, 'data', `${category}.json`);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const categoryName = categoryNames[category] || category;
      const allProducts = allProductsData[category] || [];
      
      if (!data.items || data.items.length === 0) continue;
      
      console.log(`\n📂 Обробка категорії: ${categoryName} (${data.items.length} товарів)`);
      
      const categoryDir = path.join(productsDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      for (const product of data.items) {
        try {
          const productTitle = getProductTitle(product);
          const specsHtml = getFullSpecsHtml(product, category);
          const imageGallery = getImageGallery(product);
          const relatedProductsHtml = getRelatedProductsHtml(product, category, allProducts);
          const noscriptLinksHtml = getNoscriptLinksHtml(product, category, allProducts, categoryName);
          const canonicalUrl = `${baseUrl}/products/${category}/${product.slug}.html`;
          const productSchemaHtml = getProductSchema(product, category, canonicalUrl, productTitle, categoryName);
          
          
          const html = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${productTitle} | LightOn</title>
  <meta name="description" content="${escapeHtml(product.description?.substring(0, 160) || `${productTitle} — ${categoryName.toLowerCase()}. Характеристики, ціни в Україні, де купити та ремонт.`)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="stylesheet" href="../../assets/css/style.css" />
  ${productSchemaHtml}
</head>
<body data-page="product-static">

  <header class="site-header">
    <div class="container">
      <a href="../../index.html" class="site-logo">⚡ Light<span>On</span></a>
      <nav class="site-nav">
        <a href="../../index.html">Головна</a>
        <a href="../../catalog.html#generators">Генератори</a>
        <a href="../../catalog.html#inverters">Інвертори</a>
        <a href="../../catalog.html#solar-panels">Сонячні панелі</a>
        <a href="../../catalog.html#batteries">АКБ</a>
        <a href="../../catalog.html#power-stations">Зарядні станції</a>
        <a href="../../repair.html">Ремонт</a>
      </nav>
    </div>
  </header>

  <main class="section">
    <div class="container product-page">
      <nav class="breadcrumb">
        <a href="../../index.html">Головна</a><span>›</span>
        <a href="../../catalog.html">Каталог</a><span>›</span>
        <a href="../../catalog.html#${category}">${categoryName}</a><span>›</span>
        <span>${productTitle}</span>
      </nav>
      <a href="javascript:history.back()" class="back-button">← Назад до каталогу</a>
      
      <div class="product-info">
        ${imageGallery}
        <h1>${escapeHtml(productTitle)}</h1>
        <div class="product-price"><span>Ціна від</span> ${product.priceUAH ? `${product.priceUAH.toLocaleString("uk-UA")} ₴` : "— ₴"}</div>
        ${product.rating ? `<div class="product-rating">⭐ ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))} (${product.rating})</div>` : ''}
        <div class="product-description"><h3>Опис</h3><p>${escapeHtml(product.description) || "Опис відсутній"}</p></div>
        <div><h3>Характеристики</h3><div class="specs-grid">${specsHtml}</div></div>
        <div class="links-section"><h3>Де купити ${product.model.toLowerCase()}?</h3><div class="links-grid">${product.buyLinks && product.buyLinks.length ? product.buyLinks.map(link => `<a href="${link.url}" target="_blank" rel="nofollow sponsored" class="buy-link">🛒 Купити на ${escapeHtml(link.name)}</a>`).join('') : '<p>Немає посилань для покупки</p>'}</div></div>
        ${product.repairLinks && product.repairLinks.length ? `<div class="links-section"><h3>🔧 Де відремонтувати?</h3><div class="links-grid">${product.repairLinks.map(link => `<a href="${link.url}" target="_blank" rel="nofollow" class="repair-link">🔧 Ремонт у ${escapeHtml(link.name)}</a>`).join('')}</div></div>` : ''}
      </div>
      
      ${relatedProductsHtml}
      
      <div id="product-seo-text" style="margin-top:3rem;max-width:820px;">
        <p><strong>${escapeHtml(productTitle)}</strong> — це надійне обладнання для вашого дому або бізнесу. Ознайомтеся з характеристиками, порівняйте ціни та виберіть найкращу пропозицію.</p>
      </div>
      ${noscriptLinksHtml}
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-brand"><div class="site-logo">⚡ Light<span>On</span></div><p>Каталог енергетичного обладнання України.</p></div>
      <div><h4>Каталог</h4><ul><li><a href="../../catalog.html#generators">Генератори</a></li><li><a href="../../catalog.html#inverters">Інвертори</a></li><li><a href="../../catalog.html#solar-panels">Сонячні панелі</a></li><li><a href="../../catalog.html#batteries">Акумулятори</a></li><li><a href="../../catalog.html#power-stations">Зарядні станції</a></li></ul></div>
      <div><h4>Ремонт</h4><ul><li><a href="../../repair.html#generators">Ремонт генераторів</a></li><li><a href="../../repair.html#inverters">Ремонт інверторів</a></li><li><a href="../../repair.html#solar-panels">Ремонт панелей</a></li><li><a href="../../repair.html#batteries">Ремонт АКБ</a></li><li><a href="../../repair.html#power-stations">Ремонт станцій</a></li></ul></div>
    </div>
    <div class="footer-bottom">© 2026 LightOn. Ціни орієнтовні. Посилання на магазини є реферальними.</div>
  </footer>

  <script src="/assets/js/main.js"></script>
</body>
</html>`;
          
          const outputPath = path.join(categoryDir, `${product.slug}.html`);
          fs.writeFileSync(outputPath, html, 'utf-8');
          generatedCount++;
          console.log(`  ✅ ${product.slug}.html`);
        } catch (err) {
          errorCount++;
          console.log(`  ❌ Помилка: ${product.slug} - ${err.message}`);
        }
      }
    } catch (err) {
      errorCount++;
      console.log(`❌ Помилка категорії ${category}: ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Готово! Створено ${generatedCount} статичних сторінок товарів.`);
  if (errorCount > 0) console.log(`⚠️ Помилок: ${errorCount}`);
  console.log('='.repeat(50));
}

generateProductPages().catch(err => {
  console.error('❌ Критична помилка:', err);
  process.exit(1);
});