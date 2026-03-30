const fs = require('fs');

// 1. Налаштування
const BASE_URL = 'https://lighton.pp.ua'; // Ваш домен
const DATA_FILE = './assets/data/data.json'; // Шлях до вашого JSON з товарами
const OUTPUT_FILE = './sitemap.xml';

// 2. Статичні сторінки (ті, що існують як окремі .html файли)
const staticPages = [
  '',                // Головна
  '/catalog.html',   // Сторінка каталогу
  '/repair.html',    // Сторінка ремонту
];

try {
  // 3. Читаємо дані з JSON для динамічних посилань
  // Припустимо, у вас структура JSON: { "generators": [...], "inverters": [...] }
  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(rawData);
  const categories = Object.keys(data); // Отримуємо назви категорій

  let xmlItems = '';

  // Додаємо статичні сторінки
  staticPages.forEach(page => {
    xmlItems += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Додаємо динамічні посилання на категорії (наприклад, через хеші)
  categories.forEach(cat => {
    xmlItems += `
  <url>
    <loc>${BASE_URL}/catalog.html#${cat}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>`;
  });

  // 4. Формуємо повний XML
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

  // 5. Записуємо у файл
  fs.writeFileSync(OUTPUT_FILE, sitemapContent);
  console.log('✅ sitemap.xml успішно згенеровано!');

} catch (error) {
  console.error('❌ Помилка при генерації sitemap:', error.message);
}