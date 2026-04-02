/**
 * ============================================================
 * LightOn — Головний JS (оновлений для статичних сторінок товарів)
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// УТИЛІТИ
// ─────────────────────────────────────────────────────────────

/** Отримати базовий URL для JSON-файлів */
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

function addCanonicalLink(url) {
  let canonical = document.getElementById("canonical-url");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.id = "canonical-url";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

// ─────────────────────────────────────────────────────────────
// СПЕЦИФІЧНІ ХАРАКТЕРИСТИКИ
// ─────────────────────────────────────────────────────────────

function getSpecs(item, category) {
  const specs = [];
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

// ─────────────────────────────────────────────────────────────
// РЕНДЕР КАРТКИ ТОВАРУ (посилання на статичну сторінку)
// ─────────────────────────────────────────────────────────────

function renderProductCard(item, category) {
  const specs = getSpecs(item, category);
  const buyLink = item.buyLinks && item.buyLinks.length ? item.buyLinks[0] : { name: "Знайти", url: "#" };
  const repairLink = item.repairLinks && item.repairLinks.length
    ? `<a href="${item.repairLinks[0].url}" target="_blank" rel="nofollow" class="secondary">🔧 Ремонт</a>`
    : "";
  const imgSrc = item.image || "assets/img/placeholder.svg";

  return `
    <div class="product-card" data-slug="${item.slug}" data-category="${category}">
      <a href="products/${category}/${item.slug}.html" class="product-card-link">
        <img class="product-card__img" src="${imgSrc}" alt="${item.brand} ${item.model}" onerror="this.src='assets/img/placeholder.svg'" loading="lazy">
        <div class="product-card__body">
          <div class="product-card__brand">${escapeHtml(item.brand)}</div>
          <div class="product-card__title">${escapeHtml(item.model)}</div>
          <p class="product-card__desc">${escapeHtml(item.description?.substring(0, 150) || '')}...</p>
          <div class="product-card__specs">${specs.map(s => `<span>${s}</span>`).join("")}</div>
          <div class="product-card__price">${formatPrice(item.priceUAH)}</div>
        </div>
      </a>
      <div class="product-card__footer">
        <a href="products/${category}/${item.slug}.html" class="details-link">📖 Детальніше</a>
        <a href="${buyLink.url}" target="_blank" rel="nofollow sponsored">🛒 ${buyLink.name}</a>
        ${repairLink}
      </div>
    </div>
  `;
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
// ЗАВАНТАЖЕННЯ КАТАЛОГУ
// ─────────────────────────────────────────────────────────────

async function loadCategory(categoryId) {
  const fileMap = {
    "generators": "generators.json",
    "inverters": "inverters.json",
    "solar-panels": "solar-panels.json",
    "batteries": "batteries.json",
    "power-stations": "power-stations.json",
  };
  const filename = fileMap[categoryId];
  if (!filename) return null;
  return fetchJson(filename);
}

function filterProducts(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item => (item.brand + " " + item.model + " " + item.description).toLowerCase().includes(q));
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ КАТАЛОГУ
// ─────────────────────────────────────────────────────────────

async function renderCatalogPage() {
  const container  = document.getElementById("catalog-container");
  const title      = document.getElementById("catalog-title");
  const breadcrumb = document.getElementById("breadcrumb-cat");
  if (!container) return;

  const categoryId = (window.location.hash || "").replace("#", "") || "generators";
  const baseUrl = 'https://lighton.pp.ua';
  addCanonicalLink(`${baseUrl}/catalog.html#${categoryId}`);

  container.innerHTML = `<div class="loading">⏳ Завантаження…</div>`;

  try {
    const data = await loadCategory(categoryId);
    if (!data) throw new Error("Категорію не знайдено");

    if (title)      title.textContent = data.h1;
    if (breadcrumb) breadcrumb.textContent = data.categoryLabel;
    document.title = data.metaTitle;

    const renderItems = (items) => {
      container.innerHTML = items.length
        ? items.map(item => renderProductCard(item, categoryId)).join("")
        : `<p style="color:var(--color-text-muted)">Нічого не знайдено.</p>`;
    };

    renderItems(data.items);

    // Шукаємо searchInput після того як DOM вже стабільний,
    // а не на початку функції — це виключає проблему з відірваним елементом
    const searchInput = document.getElementById("catalog-search");
    if (searchInput) {
      // Скидаємо попередній listener через заміну клону
      const freshInput = searchInput.cloneNode(true);
      searchInput.replaceWith(freshInput); // replaceWith безпечніший ніж parentNode.replaceChild

      freshInput.addEventListener("input", () => {
        renderItems(filterProducts(data.items, freshInput.value));
      });
    }

  } catch (e) {
    container.innerHTML = `<p>❌ Помилка: ${e.message}</p>`;
  }
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР ГОЛОВНОЇ СТОРІНКИ
// ─────────────────────────────────────────────────────────────

async function renderHomePage() {
  const catContainer = document.getElementById("home-categories");
  const artContainer = document.getElementById("home-articles");
  if (!catContainer) return;

  const index = await fetchJson("index.json");
  catContainer.innerHTML = index.categories.map(cat => `
    <a href="catalog.html#${cat.id}" class="category-card">
      <div class="icon">${cat.icon}</div>
      <h3>${cat.label}</h3>
    </a>
  `).join("");

  if (artContainer) {
    const articlesData = await fetchJson("repair-articles.json");
    const cards = [];
    for (const [catId, arts] of Object.entries(articlesData.articles)) {
      const catObj = index.categories.find(c => c.id === catId);
      const label = catObj ? catObj.label : catId;
      arts.slice(0, 1).forEach(art => cards.push(renderArticleCard(art, catId, label)));
    }
    artContainer.innerHTML = cards.join("") || "<p>Статті завантажуються…</p>";
  }
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ СТАТТІ
// ─────────────────────────────────────────────────────────────

async function renderArticlePage() {
  const container = document.getElementById("article-container");
  if (!container) return;

  const hash = window.location.hash.replace("#", "");
  const [categoryId, articleSlug] = hash.split("/");
  container.innerHTML = `<div class="loading">⏳ Завантаження…</div>`;

  try {
    const articlesData = await fetchJson("repair-articles.json");
    const index = await fetchJson("index.json");
    const articles = articlesData.articles[categoryId] || [];
    const article = articles.find(a => a.slug === articleSlug);
    const catObj = index.categories.find(c => c.id === categoryId);
    if (!article) throw new Error("Статтю не знайдено");

    document.title = article.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", article.metaDescription);

    const sections = article.sections.map(s => `<h2>${s.h2}</h2><p>${s.text}</p>`).join("");
    const tags = article.keywords.map(k => `<span style="display:inline-block;background:#f0f0f0;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;margin:0.2rem;">${k}</span>`).join("");

    container.innerHTML = `
      <article class="article-page">
        <nav class="breadcrumb"><a href="index.html">Головна</a><span>›</span><a href="repair.html#${categoryId}">${catObj ? catObj.label : categoryId}</a><span>›</span>${article.title}</nav>
        <h1>${article.title}</h1>
        <p class="intro">${article.intro}</p>
        ${sections}
        <div style="margin-top:2rem;"><strong>Теги:</strong> ${tags}</div>
        <p style="margin-top:2rem;"><a href="repair.html#${categoryId}">← До всіх статей про ${catObj ? catObj.label.toLowerCase() : categoryId}</a></p>
      </article>
    `;
  } catch (e) {
    container.innerHTML = `<p>❌ ${e.message}</p>`;
  }
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР СТОРІНКИ РЕМОНТУ
// ─────────────────────────────────────────────────────────────

async function renderRepairPage() {
  const container = document.getElementById("repair-container");
  const tabsEl = document.getElementById("repair-tabs");
  if (!container) return;

  const [articlesData, index] = await Promise.all([fetchJson("repair-articles.json"), fetchJson("index.json")]);
  let activeCat = (window.location.hash || "").replace("#", "") || index.categories[0].id;

  if (tabsEl) {
    tabsEl.innerHTML = index.categories.map(cat => `<button class="filter-btn ${cat.id === activeCat ? "active" : ""}" data-cat="${cat.id}">${cat.icon} ${cat.label}</button>`).join("");
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

  const renderArticles = () => {
    const articles = articlesData.articles[activeCat] || [];
    const catObj = index.categories.find(c => c.id === activeCat);
    const label = catObj ? catObj.label : activeCat;
    container.innerHTML = articles.length ? articles.map(a => renderArticleCard(a, activeCat, label)).join("") : `<p style="color:var(--color-text-muted)">Статей поки немає. Скоро додамо!</p>`;
  };
  renderArticles();
}

// ─────────────────────────────────────────────────────────────
// РЕНДЕР КОРОТКОГО ОГЛЯДУ (головна сторінка)
// ─────────────────────────────────────────────────────────────

async function renderShort() {
  const shortContainer = document.getElementById("short-cat");
  if (!shortContainer) return;
  shortContainer.innerHTML = `<div class="loading">⏳ Завантаження короткого огляду…</div>`;

  const categories = [
    { id: "generators", label: "Генератори", icon: "⚡" },
    { id: "inverters", label: "Інвертори", icon: "🔄" },
    { id: "solar-panels", label: "Сонячні панелі", icon: "☀️" },
    { id: "batteries", label: "Акумулятори", icon: "🔋" },
    { id: "power-stations", label: "Зарядні станції", icon: "💡" }
  ];

  let allCategoriesHtml = '';
  for (const cat of categories) {
    try {
      const data = await loadCategory(cat.id);
      if (data && data.items && data.items.length > 0) {
        const latestItems = data.items.slice(-4).reverse();
        allCategoriesHtml += `
          <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <h2 style="margin: 0; font-size: 1.5rem;">${cat.icon} ${cat.label}</h2>
              <a href="catalog.html#${cat.id}" style="color: var(--color-primary); text-decoration: none;">Всі ${cat.label.toLowerCase()} →</a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
              ${latestItems.map(item => renderProductCard(item, cat.id)).join('')}
            </div>
          </div>
        `;
      }
    } catch (e) { console.error(`Помилка категорії ${cat.id}:`, e); }
  }
  shortContainer.innerHTML = allCategoriesHtml || `<p style="color:var(--color-text-muted)">Немає доступних товарів. Додайте перші товари через парсер.</p>`;
}

// ─────────────────────────────────────────────────────────────
// ПЕРЕНАПРАВЛЕННЯ З product.html НА СТАТИЧНУ СТОРІНКУ
// ─────────────────────────────────────────────────────────────

function redirectProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");
  const slug = urlParams.get("slug");
  
  if (category && slug) {
    // Перенаправляємо на статичну сторінку
    window.location.replace(`products/${category}/${slug}.html`);
  }
}

// ─────────────────────────────────────────────────────────────
// ФУНКЦІЯ ГАЛЕРЕЇ (працює на всіх сторінках)
// ─────────────────────────────────────────────────────────────

function initGallery() {
  const mainImage = document.getElementById('galleryMainImage');
  const thumbnails = document.querySelectorAll('.gallery-thumbnail');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  
  if (!mainImage) return;
  
  let currentIndex = 0;
  const totalImages = thumbnails.length;
  
  if (totalImages === 0) return;
  
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
    
    if (thumbnails[currentIndex]) {
      thumbnails[currentIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', 
        inline: 'center' 
      });
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
    if (e.key === 'ArrowLeft') {
      updateMainImage(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      updateMainImage(currentIndex + 1);
    }
  });
  
  if (prevBtn && nextBtn && totalImages <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }
}

// Функція для відкриття модального вікна зображення
window.openImageModal = function(src) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
  modal.style.zIndex = '10000';
  modal.style.cursor = 'pointer';
  modal.onclick = () => modal.remove();
  
  const img = document.createElement('img');
  img.src = src;
  img.style.position = 'absolute';
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.transform = 'translate(-50%, -50%)';
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.objectFit = 'contain';
  
  modal.appendChild(img);
  document.body.appendChild(modal);
};

// ─────────────────────────────────────────────────────────────
// ІНІЦІАЛІЗАЦІЯ
// ─────────────────────────────────────────────────────────────

// Запускаємо галерею після завантаження DOM (для статичних сторінок)
document.addEventListener("DOMContentLoaded", () => {
  // Ініціалізуємо галерею, якщо є елементи
  initGallery();
  
  // Визначаємо тип сторінки
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

// ─────────────────────────────────────────────────────────────
// ІНІЦІАЛІЗАЦІЯ
// ─────────────────────────────────────────────────────────────

window.renderCatalogPage = renderCatalogPage;
window.renderShort = renderShort;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  // Якщо це сторінка product.html - перенаправляємо на статичну
  if (page === "product") {
    redirectProductPage();
    return;
  }

  switch (page) {
    case "home":    renderHomePage(); break;
    case "catalog": renderCatalogPage(); break;
    case "repair":  renderRepairPage(); break;
    case "article": renderArticlePage(); break;
  }

  const navLinks = document.querySelectorAll(".site-nav a");
  navLinks.forEach(link => {
    if (link.href === window.location.href.split("#")[0]) {
      link.classList.add("active");
    }
  });
});