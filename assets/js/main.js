/**
 * ============================================================
 * LightOn — Головний JS
 * ============================================================
 * Відповідає за:
 *   - Завантаження JSON-даних
 *   - Рендер каталогу товарів
 *   - Рендер сторінки товару (product.html)
 *   - Рендер статей по ремонту
 *   - Пошук та фільтрація
 *   - Навігація між сторінками (SPA-режим через hash)
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// УТИЛІТИ
// ─────────────────────────────────────────────────────────────

/** Отримати базовий URL для JSON-файлів (підтримує GitHub Pages) */
function dataUrl(filename) {
  const base = window.location.pathname.replace(/\/[^/]*$/, "");
  return `${base}/data/${filename}`;
}

/** Асинхронно завантажити JSON */
async function fetchJson(filename) {
  const res = await fetch(dataUrl(filename));
  if (!res.ok) throw new Error(`Cannot load ${filename}`);
  return res.json();
}

/** Форматувати ціну у гривнях */
function formatPrice(uah) {
  return uah ? `${uah.toLocaleString("uk-UA")} ₴` : "— ₴";
}

/** Зірки рейтингу */
function stars(rating) {
  const full  = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/** Екранування HTML */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─────────────────────────────────────────────────────────────
// СПЕЦИФІЧНІ ХАРАКТЕРИСТИКИ ДЛЯ КОЖНОГО ТИПУ ПРИСТРОЮ
// ─────────────────────────────────────────────────────────────

/** Повертає список рядків-характеристик залежно від категорії (для картки) */
function getSpecs(item, category) {
  const specs = [];

  // Спільні — є у всіх пристроях
  if (item.rating) specs.push(`⭐ ${item.rating}`);

  switch (category) {
    case "generators":
      if (item.powerKW)    specs.push(`⚡ ${item.powerKW} кВт`);
      if (item.fuelType)   specs.push(`⛽ ${item.fuelType}`);
      if (item.fuelTankL)  specs.push(`🛢 ${item.fuelTankL} л`);
      if (item.noiseDb)    specs.push(`🔊 ${item.noiseDb} дБ`);
      if (item.startType)  specs.push(`🔑 ${item.startType} старт`);
      if (item.runtimeH)   specs.push(`⏱ ${item.runtimeH} год`);
      break;

    case "inverters":
      if (item.powerW)        specs.push(`⚡ ${item.powerW} Вт`);
      if (item.waveform)      specs.push(`〰 ${item.waveform}`);
      if (item.inputVoltage)  specs.push(`🔌 вхід ${item.inputVoltage}`);
      if (item.efficiency)    specs.push(`📊 КПД ${item.efficiency}%`);
      break;

    case "solar-panels":
      if (item.powerWp)       specs.push(`☀️ ${item.powerWp} Вт`);
      if (item.cellType)      specs.push(`🔬 ${item.cellType}`);
      if (item.efficiency)    specs.push(`📊 ${item.efficiency}% ефект.`);
      if (item.warrantyYears) specs.push(`🛡 ${item.warrantyYears} рок. гарантія`);
      break;

    case "batteries":
      if (item.capacityAh) specs.push(`🔋 ${item.capacityAh} Аг`);
      if (item.voltageV)   specs.push(`⚡ ${item.voltageV} В`);
      if (item.chemistry)  specs.push(`🧪 ${item.chemistry}`);
      if (item.cyclesCount)specs.push(`🔁 ${item.cyclesCount} циклів`);
      break;

    case "power-stations":
      if (item.capacityWh)   specs.push(`🔋 ${item.capacityWh} Вт·год`);
      if (item.acOutputW)    specs.push(`⚡ ${item.acOutputW} Вт вихід`);
      if (item.solarInputW)  specs.push(`☀️ сонце ${item.solarInputW} Вт`);
      if (item.chargingTimeH)specs.push(`⏱ заряд ${item.chargingTimeH} год`);
      break;
  }

  return specs;
}

/** Отримує повний список характеристик для сторінки товару */
function getFullSpecs(product, category) {
  const specs = [];
  
  // Базові характеристики
  if (product.brand) specs.push({ label: "Бренд", value: product.brand });
  if (product.model) specs.push({ label: "Модель", value: product.model });
  
  // Характеристики за категоріями
  switch (category) {
    case "generators":
      if (product.powerKW) specs.push({ label: "Потужність", value: `${product.powerKW} кВт` });
      if (product.fuelType) specs.push({ label: "Тип палива", value: product.fuelType });
      if (product.fuelTankL) specs.push({ label: "Об'єм бака", value: `${product.fuelTankL} л` });
      if (product.noiseDb) specs.push({ label: "Рівень шуму", value: `${product.noiseDb} дБ` });
      if (product.engineBrand) specs.push({ label: "Двигун", value: product.engineBrand });
      if (product.startType) specs.push({ label: "Запуск", value: product.startType });
      if (product.runtimeH) specs.push({ label: "Час роботи", value: `${product.runtimeH} год` });
      if (product.weightKg) specs.push({ label: "Вага", value: `${product.weightKg} кг` });
      break;
      
    case "inverters":
      if (product.powerW) specs.push({ label: "Потужність", value: `${product.powerW} Вт` });
      if (product.inputVoltage) specs.push({ label: "Вхідна напруга", value: product.inputVoltage });
      if (product.outputVoltage) specs.push({ label: "Вихідна напруга", value: product.outputVoltage });
      if (product.waveform) specs.push({ label: "Форма сигналу", value: product.waveform });
      if (product.efficiency) specs.push({ label: "ККД", value: `${product.efficiency}%` });
      break;
      
    case "solar-panels":
      if (product.powerWp) specs.push({ label: "Потужність", value: `${product.powerWp} Вт` });
      if (product.cellType) specs.push({ label: "Тип комірок", value: product.cellType });
      if (product.efficiency) specs.push({ label: "Ефективність", value: `${product.efficiency}%` });
      if (product.dimensions) specs.push({ label: "Розміри", value: product.dimensions });
      if (product.weightKg) specs.push({ label: "Вага", value: `${product.weightKg} кг` });
      if (product.warrantyYears) specs.push({ label: "Гарантія", value: `${product.warrantyYears} років` });
      break;
      
    case "batteries":
      if (product.capacityAh) specs.push({ label: "Ємність", value: `${product.capacityAh} Аг` });
      if (product.voltageV) specs.push({ label: "Напруга", value: `${product.voltageV} В` });
      if (product.chemistry) specs.push({ label: "Тип", value: product.chemistry });
      if (product.cyclesCount) specs.push({ label: "Цикли заряд-розряд", value: `${product.cyclesCount} циклів` });
      if (product.weightKg) specs.push({ label: "Вага", value: `${product.weightKg} кг` });
      break;
      
    case "power-stations":
      if (product.capacityWh) specs.push({ label: "Ємність", value: `${product.capacityWh} Вт·год` });
      if (product.acOutputW) specs.push({ label: "AC вихід", value: `${product.acOutputW} Вт` });
      if (product.usbPorts) specs.push({ label: "USB порти", value: `${product.usbPorts} шт` });
      if (product.solarInputW) specs.push({ label: "Сонячний вхід", value: `${product.solarInputW} Вт` });
      if (product.chargingTimeH) specs.push({ label: "Час зарядки", value: `${product.chargingTimeH} год` });
      break;
  }
  
  return specs;
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР КАРТКИ ТОВАРУ (з посиланням на детальну сторінку)
// ─────────────────────────────────────────────────────────────

function renderProductCard(item, category) {
  const specs = getSpecs(item, category);
  // Перша купівельна посилання (або заглушка)
  const buyLink = item.buyLinks && item.buyLinks.length
    ? item.buyLinks[0]
    : { name: "Знайти", url: "#" };
  // Посилання на ремонт (якщо є)
  const repairLink = item.repairLinks && item.repairLinks.length
    ? `<a href="${item.repairLinks[0].url}" target="_blank" rel="nofollow" class="secondary">🔧 Ремонт</a>`
    : "";

  // Зображення: запасна заглушка якщо не завантажується
  const imgSrc = item.image || "assets/img/placeholder.svg";

  return `
    <!-- Картка товару: ${item.brand} ${item.model} -->
    <div class="product-card" data-slug="${item.slug}" data-category="${category}">
    <a href="product.html?category=${category}&slug=${item.slug}" class="details-link">
      <img
        class="product-card__img"
        src="${imgSrc}"
        alt="${item.brand} ${item.model} — фото"
        onerror="this.src='assets/img/placeholder.svg'"
        loading="lazy"
      />
    </a>
      <div class="product-card__body">
        <div class="product-card__brand">${escapeHtml(item.brand)}</div>
        <div class="product-card__title">${escapeHtml(item.model)}</div>
        <p class="product-card__desc">${escapeHtml(item.description.substring(0, 150).split(" ").slice(0, -1).join(" "))}...</p>
        <!-- Характеристики, залежні від типу пристрою -->
        <div class="product-card__specs">
          ${specs.map(s => `<span>${s}</span>`).join("")}
        </div>
        <div class="product-card__price">${formatPrice(item.priceUAH)}</div>
      </div>
      <div class="product-card__footer">
        <a href="product.html?category=${category}&slug=${item.slug}" class="details-link">
          📖 Детальніше
        </a>
        <a href="${buyLink.url}" target="_blank" rel="nofollow sponsored">
          🛒 ${buyLink.name}
        </a>
        ${repairLink}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ ТОВАРУ (product.html)
// ─────────────────────────────────────────────────────────────

async function renderProductPage() {
  const container = document.getElementById("product-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const slug = urlParams.get("slug");

  if (!category || !slug) {
    container.innerHTML = `
      <div class="error-message" style="text-align:center;padding:3rem;">
        ❌ Некоректне посилання на товар.<br>
        <a href="catalog.html" style="color: var(--color-primary);">Повернутися до каталогу</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '<div class="loading" style="text-align:center;padding:3rem;">⏳ Завантаження товару...</div>';

  try {
    const fileMap = {
      "generators": "generators.json",
      "inverters": "inverters.json",
      "solar-panels": "solar-panels.json",
      "batteries": "batteries.json",
      "power-stations": "power-stations.json",
    };

    const filename = fileMap[category];
    if (!filename) throw new Error("Категорію не знайдено");

    const data = await fetchJson(filename);
    const product = data.items.find(item => item.slug === slug);

    if (!product) {
      container.innerHTML = `
        <div class="error-message" style="text-align:center;padding:3rem;">
          ❌ Товар не знайдено.<br>
          <a href="catalog.html#${category}" style="color: var(--color-primary);">Повернутися до каталогу</a>
        </div>
      `;
      return;
    }

    document.title = `${product.model} | LightOn`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", product.description?.substring(0, 160) || "");
    }

    const categoryNames = {
      "generators": "Генератори",
      "inverters": "Інвертори",
      "solar-panels": "Сонячні панелі",
      "batteries": "Акумулятори",
      "power-stations": "Зарядні станції"
    };
    
    const categoryName = categoryNames[category] || category;
    const breadcrumbCatalog = document.getElementById("breadcrumb-catalog");
    const breadcrumbCategory = document.getElementById("breadcrumb-category");
    const breadcrumbProduct = document.getElementById("breadcrumb-product");
    
    if (breadcrumbCatalog) breadcrumbCatalog.href = `catalog.html#${category}`;
    if (breadcrumbCategory) breadcrumbCategory.textContent = categoryName;
    if (breadcrumbProduct) breadcrumbProduct.textContent = `${product.brand} ${product.model}`;

    const galleryImages = [];
    if (product.image) galleryImages.push(product.image);
    if (product.images && product.images.length) {
      galleryImages.push(...product.images);
    }

    // Галерея
    const galleryHtml = galleryImages.length > 0 ? `
      <div class="product-gallery-container">
        <div class="gallery-main">
          <button class="gallery-nav gallery-prev" id="galleryPrev" aria-label="Попереднє зображення">❮</button>
          <div class="gallery-item">
          <img id="galleryMainImage" src="${galleryImages[0]}" alt="${escapeHtml(product.brand)} ${escapeHtml(product.model)} - головне фото" onclick="openImageModal(this.src)" loading="lazy" onerror="this.src='assets/img/placeholder.svg'">
          </div>
          <button class="gallery-nav gallery-next" id="galleryNext" aria-label="Наступне зображення">❯</button>
        </div>
        <div class="gallery-thumbnails" id="galleryThumbnails">
          ${galleryImages.map((img, idx) => `
            <img 
              src="${img}" 
              alt="${escapeHtml(product.brand)} ${escapeHtml(product.model)} - фото ${idx + 1}"
              class="gallery-thumbnail ${idx === 0 ? 'active' : ''}"
              data-index="${idx}"
              loading="lazy"
              onerror="this.src='assets/img/placeholder.svg'"
            >
          `).join("")}
        </div>
      </div>
    ` : '<p>📷 Зображення відсутні</p>';

    const buyLinksHtml = product.buyLinks && product.buyLinks.length
      ? product.buyLinks.map(link => `
        <a href="${link.url}" target="_blank" rel="nofollow sponsored" class="buy-link">
          Знайти на ${escapeHtml(link.name)}
        </a>
      `).join("")
      : '<p>Немає посилань для покупки</p>';

    const repairLinksHtml = product.repairLinks && product.repairLinks.length
      ? product.repairLinks.map(link => `
        <a href="${link.url}" target="_blank" rel="nofollow" class="repair-link">
          🔧 Ремонт у ${escapeHtml(link.name)}
        </a>
      `).join("")
      : '<p>Немає посилань на ремонт</p>';

    const specs = getFullSpecs(product, category);

    container.innerHTML = `
      <div class="product-info">
        ${galleryHtml}
        
        <h1>${escapeHtml(product.model)}</h1>
        
        <div class="product-price">
        <span>Ціна від</span>
          ${formatPrice(product.priceUAH)}
        </div>
        
        ${product.rating ? `
          <div class="product-rating">
            ⭐ ${stars(product.rating)} (${product.rating})
          </div>
        ` : ''}
        
        <div class="product-description">
          <h3>Опис</h3>
          <p>${escapeHtml(product.description) || "Опис відсутній"}</p>
        </div>
        
        <div>
          <h3>Характеристики</h3>
          <div class="specs-grid">
            ${specs.map(spec => `
              <div class="spec-item">
                <strong>${escapeHtml(spec.label)}</strong>
                <span>${escapeHtml(spec.value)}</span>
              </div>
            `).join("")}
          </div>
        </div>
        
        <div class="links-section">
          <h3>Де купити ${product.model.toLowerCase()}?</h3>
          <div class="links-grid">
            ${buyLinksHtml}
          </div>
        </div>
        
        ${product.repairLinks && product.repairLinks.length ? `
          <div class="links-section">
            <h3>🔧 Де відремонтувати?</h3>
            <div class="links-grid">
              ${repairLinksHtml}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    // Ініціалізація галереї після вставки HTML
    function initGallery() {
      const mainImage = document.getElementById('galleryMainImage');
      const thumbnails = document.querySelectorAll('.gallery-thumbnail');
      const prevBtn = document.getElementById('galleryPrev');
      const nextBtn = document.getElementById('galleryNext');
      
      if (!mainImage || thumbnails.length === 0) return;
      
      let currentIndex = 0;
      const totalImages = thumbnails.length;
      
      function updateMainImage(index) {
        if (index < 0) index = 0;
        if (index >= totalImages) index = totalImages - 1;
        
        currentIndex = index;
        const newSrc = thumbnails[currentIndex].src;
        mainImage.src = newSrc;
        
        thumbnails.forEach((thumb, i) => {
          if (i === currentIndex) {
            thumb.classList.add('active');
          } else {
            thumb.classList.remove('active');
          }
        });
        
        const activeThumb = thumbnails[currentIndex];
        if (activeThumb) {
          activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => updateMainImage(currentIndex - 1));
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => updateMainImage(currentIndex + 1));
      }
      
      thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => updateMainImage(index));
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') updateMainImage(currentIndex - 1);
        else if (e.key === 'ArrowRight') updateMainImage(currentIndex + 1);
      });
      
      if (prevBtn && nextBtn) {
        if (totalImages <= 1) {
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'none';
        }
      }
    }
    
    initGallery();
    
    const seoDiv = document.getElementById("product-seo-text");
    if (seoDiv) {
      seoDiv.innerHTML = `
        <p><strong>${escapeHtml(product.brand)} ${escapeHtml(product.model)}</strong> — це надійне обладнання для вашого дому або бізнесу. 
        Ознайомтеся з характеристиками, порівняйте ціни та виберіть найкращу пропозицію.</p>
      `;
    }
    
    addImageModal();
    
  } catch (error) {
    console.error("Помилка завантаження товару:", error);
    container.innerHTML = `
      <div class="error-message" style="text-align:center;padding:3rem;">
        ❌ Помилка завантаження: ${error.message}<br>
        <a href="catalog.html" style="color: var(--color-primary);">Повернутися до каталогу</a>
      </div>
    `;
  }
}

function addImageModal() {
  if (document.getElementById("image-modal")) return;
  
  const modalHtml = `
    <div id="image-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:9999; cursor:pointer;">
      <img id="modal-image" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); max-width:90%; max-height:90%; object-fit:contain;">
      <span style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer; transition:color 0.3s;">&times;</span>
    </div>
  `;
  
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-image");
  const closeBtn = modal.querySelector("span");
  
  window.openImageModal = (src) => {
    modalImg.src = src;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  };
  
  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  };
  
  modal.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР КАРТКИ СТАТТІ
// ─────────────────────────────────────────────────────────────

function renderArticleCard(article, categoryId, categoryLabel) {
  return `
    <div class="article-card">
      <div class="article-card__tag">📖 ${categoryLabel}</div>
      <h3>${article.title}</h3>
      <p>${article.intro.slice(0, 120)}…</p>
      <a href="article.html#${categoryId}/${article.slug}">Читати →</a>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// ЗАВАНТАЖЕННЯ КАТАЛОГУ КАТЕГОРІЇ
// ─────────────────────────────────────────────────────────────

async function loadCategory(categoryId) {
  const fileMap = {
    "generators":    "generators.json",
    "inverters":     "inverters.json",
    "solar-panels":  "solar-panels.json",
    "batteries":     "batteries.json",
    "power-stations":"power-stations.json",
  };

  const filename = fileMap[categoryId];
  if (!filename) return null;
  return fetchJson(filename);
}

// ─────────────────────────────────────────────────────────────
// ПОШУК ПО ТОВАРАХ
// ─────────────────────────────────────────────────────────────

function filterProducts(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    (item.brand + " " + item.model + " " + item.description)
      .toLowerCase()
      .includes(q)
  );
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ КАТЕГОРІЇ (catalog.html)
// ─────────────────────────────────────────────────────────────

async function renderCatalogPage() {
  const container = document.getElementById("catalog-container");
  const title     = document.getElementById("catalog-title");
  const breadcrumb= document.getElementById("breadcrumb-cat");
  const searchInput = document.getElementById("catalog-search");
  if (!container) return;

  // Отримати категорію з URL: catalog.html#generators
  const categoryId = (window.location.hash || "").replace("#", "") || "generators";

  // Показати спінер
  container.innerHTML = `<div class="loading">⏳ Завантаження…</div>`;

  try {
    const data = await loadCategory(categoryId);
    if (!data) throw new Error("Категорію не знайдено");

    // Встановити SEO-заголовок і breadcrumb
    if (title)      title.textContent = data.h1;
    if (breadcrumb) breadcrumb.textContent = data.categoryLabel;
    document.title = data.metaTitle;

    // Рендер усіх товарів
    let currentItems = data.items;

    const renderItems = (items) => {
      container.innerHTML = items.length
        ? items.map(item => renderProductCard(item, categoryId)).join("")
        : `<p style="color:var(--color-text-muted)">Нічого не знайдено.</p>`;
    };

    renderItems(currentItems);

    // Пошук у реальному часі
    if (searchInput) {
      // Видаляємо старий listener, якщо є
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      newSearchInput.addEventListener("input", () => {
        renderItems(filterProducts(data.items, newSearchInput.value));
      });
    }
  } catch (e) {
    container.innerHTML = `<p>❌ Помилка: ${e.message}</p>`;
  }
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР ГОЛОВНОЇ СТОРІНКИ (index.html)
// ─────────────────────────────────────────────────────────────

async function renderHomePage() {
  const catContainer = document.getElementById("home-categories");
  const artContainer = document.getElementById("home-articles");
  if (!catContainer) return;

  // Завантажити індекс категорій
  const index = await fetchJson("index.json");

  // Рендер категорій
  catContainer.innerHTML = index.categories.map(cat => `
    <a href="catalog.html#${cat.id}" class="category-card">
      <div class="icon">${cat.icon}</div>
      <h3>${cat.label}</h3>
    </a>
  `).join("");

  // Завантажити та показати останні статті
  if (artContainer) {
    const articlesData = await fetchJson("repair-articles.json");
    const cards = [];
    for (const [catId, arts] of Object.entries(articlesData.articles)) {
      const catObj = index.categories.find(c => c.id === catId);
      const label  = catObj ? catObj.label : catId;
      arts.slice(0, 1).forEach(art => {
        cards.push(renderArticleCard(art, catId, label));
      });
    }
    artContainer.innerHTML = cards.join("") || "<p>Статті завантажуються…</p>";
  }
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ СТАТТІ (article.html)
// ─────────────────────────────────────────────────────────────

async function renderArticlePage() {
  const container = document.getElementById("article-container");
  if (!container) return;

  // Hash формат: #generators/generator-ne-zapuskayetsya
  const hash = window.location.hash.replace("#", "");
  const [categoryId, articleSlug] = hash.split("/");

  container.innerHTML = `<div class="loading">⏳ Завантаження…</div>`;

  try {
    const articlesData = await fetchJson("repair-articles.json");
    const index        = await fetchJson("index.json");

    const articles = articlesData.articles[categoryId] || [];
    const article  = articles.find(a => a.slug === articleSlug);
    const catObj   = index.categories.find(c => c.id === categoryId);

    if (!article) throw new Error("Статтю не знайдено");

    // SEO
    document.title = article.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", article.metaDescription);

    // Рендер
    const sections = article.sections.map(s => `
      <h2>${s.h2}</h2>
      <p>${s.text}</p>
    `).join("");

    // Keywords як теги
    const tags = article.keywords.map(k =>
      `<span style="display:inline-block;background:#f0f0f0;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;margin:0.2rem;">${k}</span>`
    ).join("");

    container.innerHTML = `
      <!-- Сторінка статті -->
      <article class="article-page">
        <!-- Breadcrumb навігація -->
        <nav class="breadcrumb">
          <a href="index.html">Головна</a><span>›</span>
          <a href="repair.html#${categoryId}">${catObj ? catObj.label : categoryId}</a><span>›</span>
          ${article.title}
        </nav>

        <h1>${article.title}</h1>
        <p class="intro">${article.intro}</p>

        <!-- Рекламний блок між вступом і змістом -->
        <div class="ad-slot ad-slot-leaderboard" id="ad-article-top">
          [Реклама]
        </div>

        ${sections}

        <!-- SEO-теги (ключові слова) -->
        <div style="margin-top:2rem;">
          <strong>Теги:</strong> ${tags}
        </div>

        <!-- Рекламний блок в кінці статті -->
        <div class="ad-slot ad-slot-leaderboard" id="ad-article-bottom">
          [Реклама]
        </div>

        <p style="margin-top:2rem;">
          <a href="repair.html#${categoryId}">← До всіх статей про ${catObj ? catObj.label.toLowerCase() : categoryId}</a>
        </p>
      </article>
    `;
  } catch (e) {
    container.innerHTML = `<p>❌ ${e.message}</p>`;
  }
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ РЕМОНТУ (repair.html)
// ─────────────────────────────────────────────────────────────

async function renderRepairPage() {
  const container = document.getElementById("repair-container");
  const tabsEl    = document.getElementById("repair-tabs");
  if (!container) return;

  const [articlesData, index] = await Promise.all([
    fetchJson("repair-articles.json"),
    fetchJson("index.json"),
  ]);

  // Визначити активну категорію з hash
  let activeCat = (window.location.hash || "").replace("#", "") || index.categories[0].id;

  // Рендер вкладок (фільтри)
  if (tabsEl) {
    tabsEl.innerHTML = index.categories.map(cat => `
      <button
        class="filter-btn ${cat.id === activeCat ? "active" : ""}"
        data-cat="${cat.id}"
      >${cat.icon} ${cat.label}</button>
    `).join("");

    tabsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      activeCat = btn.dataset.cat;
      tabsEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      window.location.hash = activeCat;
      renderArticles();
    });
  }

  // Рендер статей активної категорії
  const renderArticles = () => {
    const articles = articlesData.articles[activeCat] || [];
    const catObj   = index.categories.find(c => c.id === activeCat);
    const label    = catObj ? catObj.label : activeCat;

    container.innerHTML = articles.length
      ? articles.map(a => renderArticleCard(a, activeCat, label)).join("")
      : `<p style="color:var(--color-text-muted)">Статей поки немає. Скоро додамо!</p>`;
  };

  renderArticles();
}

// ─────────────────────────────────────────────────────────────
// ІНІЦІАЛІЗАЦІЯ
// Визначаємо яка сторінка завантажена і запускаємо потрібний рендер
// ─────────────────────────────────────────────────────────────

// Робимо функції глобальними для виклику з HTML
window.renderCatalogPage = renderCatalogPage;
window.renderProductPage = renderProductPage;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  switch (page) {
    case "home":    renderHomePage();    break;
    case "catalog": renderCatalogPage(); break;
    case "repair":  renderRepairPage();  break;
    case "article": renderArticlePage(); break;
    case "product": renderProductPage(); break;
  }

  // Активна навігація
  const navLinks = document.querySelectorAll(".site-nav a");
  navLinks.forEach(link => {
    if (link.href === window.location.href.split("#")[0]) {
      link.classList.add("active");
    }
  });
});