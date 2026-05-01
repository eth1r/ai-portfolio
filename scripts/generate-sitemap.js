import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем projects.json
const projectsPath = path.resolve(__dirname, '../projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

const baseUrl = 'https://portfolio.aiworker43.ru';
const currentDate = new Date().toISOString().split('T')[0];

// Список всех URL
const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/cases', priority: '0.9', changefreq: 'weekly' },
  { loc: '/services', priority: '0.9', changefreq: 'monthly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
  { loc: '/audit', priority: '0.3', changefreq: 'monthly' },
  ...projects.map(p => ({
    loc: `/cases/${p.slug}`,
    priority: p.isFeatured ? '0.8' : '0.7',
    changefreq: 'monthly'
  }))
];

// Генерируем XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Записываем sitemap
const distPath = path.resolve(__dirname, '../dist');
const sitemapPath = path.join(distPath, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

console.log('✅ Sitemap generated:', sitemapPath);
console.log('📊 URLs:', urls.length);
