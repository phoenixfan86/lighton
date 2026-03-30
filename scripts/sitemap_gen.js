const fs = require('fs');
const path = require('path');

// 1. Налаштування
const BASE_URL = 'https://lighton.pp.ua';
const DATA_DIR = '../data/'; // Папка з вашими файлами (generators.json і т.д.)
const OUTPUT_FILE = './sitemap.xml';

// 2. Статичні сторінки
const staticPages = [
  '',
  '/catalog.html',
  '/repair.html',
];

try {
  let xmlItems = '';
  const today = new Date().toISOString().split('T')[0];

  // Додаємо статичні сторінки
  staticPages.forEach(page => {
    xmlItems += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // 3. Читаємо всі JSON файли
  const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.json'));

  files.forEach(file => {
    const category = path.basename(file, '.json');
    const rawData = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const content = JSON.parse(rawData);

    // Отримуємо масив з ключа "items"
    const products = content.items;

    if (Array.isArray(products)) {
      // Додаємо посилання на категорію
      xmlItems += `
  <url>
    <loc>${BASE_URL}/catalog.html#${category}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>`;

      // Додаємо кожен товар
      products.forEach(product => {
        if (product.slug) {
          // Замінюємо & на &amp; для валідності XML
          const productUrl = `${BASE_URL}/product.html?category=${category}&amp;slug=${product.slug}`;
          
          xmlItems += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.6</priority>
  </url>`;
        }
      });
    }
  });

  // 4. Формуємо XML
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

  fs.writeFileSync(OUTPUT_FILE, sitemapContent);
  console.log(`✅ Sitemap згенеровано! Оброблено файлів: ${files.length}`);

} catch (error) {
  console.error('❌ Помилка:', error.message);
}