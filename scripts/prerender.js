import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем projects.json для получения всех slug'ов кейсов
const projectsPath = path.resolve(__dirname, '../projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

// Читаем content snapshot
const contentPath = path.resolve(__dirname, 'content-snapshot.json');
const siteContent = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

// Список всех маршрутов для prerender
const routes = [
  { path: '/', title: 'Главная', description: 'Автоматизация поддержки клиентов и обработки заявок с помощью AI' },
  { path: '/cases', title: 'Кейсы', description: 'Реализованные проекты по автоматизации и AI' },
  { path: '/services', title: 'Услуги', description: 'AI-ассистенты, автоматизация процессов, обработка документов' },
  { path: '/about', title: 'Обо мне', description: 'Андрей - фриланс-специалист по AI и автоматизации' },
  { path: '/contact', title: 'Контакты', description: 'Свяжитесь со мной для обсуждения проекта' },
  { path: '/audit', title: 'Аудит сайта', description: 'Служебная страница для анализа структуры и контента сайта' },
  ...projects.map(p => ({ 
    path: `/cases/${p.slug}`, 
    title: p.title, 
    description: p.short_pitch 
  }))
];

// Читаем собранный index.html из dist
const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const builtHtml = fs.readFileSync(indexPath, 'utf-8');

console.log('🚀 Starting prerender for', routes.length, 'routes...');

// Функция для извлечения CSS и JS ссылок из собранного HTML
function extractAssets(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => link.outerHTML);
  const jsScripts = Array.from(document.querySelectorAll('script[type="module"]'))
    .map(script => script.outerHTML);
  
  return { cssLinks, jsScripts };
}

const assets = extractAssets(builtHtml);

// Функция для генерации контента страницы
function generatePageContent(route) {
  // Создаем ЧИСТЫЙ HTML с нуля, используя только ссылки на CSS/JS из сборки
  const dom = new JSDOM(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
</body>
</html>`);
  
  const document = dom.window.document;
  
  // Добавляем title
  const titleTag = document.createElement('title');
  titleTag.textContent = `${route.title} | AI и Автоматизация`;
  document.head.appendChild(titleTag);
  
  // Добавляем meta description
  const metaDesc = document.createElement('meta');
  metaDesc.setAttribute('name', 'description');
  metaDesc.setAttribute('content', route.description);
  document.head.appendChild(metaDesc);
  
  // Добавляем Open Graph теги
  const ogTitle = document.createElement('meta');
  ogTitle.setAttribute('property', 'og:title');
  ogTitle.setAttribute('content', route.title);
  document.head.appendChild(ogTitle);
  
  const ogDesc = document.createElement('meta');
  ogDesc.setAttribute('property', 'og:description');
  ogDesc.setAttribute('content', route.description);
  document.head.appendChild(ogDesc);
  
  const ogType = document.createElement('meta');
  ogType.setAttribute('property', 'og:type');
  ogType.setAttribute('content', 'website');
  document.head.appendChild(ogType);
  
  const ogUrl = document.createElement('meta');
  ogUrl.setAttribute('property', 'og:url');
  ogUrl.setAttribute('content', `https://portfolio.aiworker43.ru${route.path}`);
  document.head.appendChild(ogUrl);
  
  const ogLocale = document.createElement('meta');
  ogLocale.setAttribute('property', 'og:locale');
  ogLocale.setAttribute('content', 'ru_RU');
  document.head.appendChild(ogLocale);
  
  // Добавляем canonical
  const canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  canonical.setAttribute('href', `https://portfolio.aiworker43.ru${route.path}`);
  document.head.appendChild(canonical);
  
  // Добавляем CSS из сборки
  assets.cssLinks.forEach(cssHtml => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cssHtml;
    const link = tempDiv.firstChild;
    document.head.appendChild(link);
  });
  
  // КРИТИЧНО: Добавляем ТОЛЬКО контент текущей страницы в #root
  const root = document.getElementById('root');
  if (root) {
    // root уже пустой, так как мы создали чистый HTML
    
    // Создаем контейнер для prerendered контента
    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('data-prerendered', 'true');
    contentDiv.style.display = 'none'; // Скрываем для SEO, React заменит при hydration
    
    // Добавляем текстовый контент ТОЛЬКО для текущей страницы
    if (route.path === '/') {
      contentDiv.innerHTML = `
        <h1>${siteContent.hero.title}</h1>
        <p>${siteContent.hero.subtitle}</p>
        <section>
          <h2>С кем я работаю</h2>
          ${siteContent.whoIWorkWith.segments.map(s => `
            <article>
              <h3>${s.title}</h3>
              <p>${s.description}</p>
            </article>
          `).join('')}
        </section>
        <section>
          <h2>Услуги</h2>
          ${siteContent.services.map(s => `
            <article>
              <h3>${s.title}</h3>
              <p>${s.description}</p>
            </article>
          `).join('')}
        </section>
      `;
    } else if (route.path === '/cases') {
      contentDiv.innerHTML = `
        <h1>Кейсы</h1>
        ${projects.map(p => `
          <article>
            <h2>${p.title}</h2>
            <p>${p.short_pitch}</p>
            <p>Категория: ${p.category}</p>
          </article>
        `).join('')}
      `;
    } else if (route.path === '/services') {
      contentDiv.innerHTML = `
        <h1>Услуги</h1>
        <p>Решения для поддержки, заявок, документов и процессов, где AI должен приносить пользу, а не добавлять сложность</p>
        <p>Я работаю с задачами, где много ручной рутины, повторяющихся действий и однотипных обращений. Ниже — основные форматы, с которых можно начать.</p>
        ${siteContent.services.map(s => `
          <article>
            <h2>${s.title}</h2>
            <p>${s.description}</p>
            <section>
              <h3>Когда это нужно</h3>
              <p>${s.whenNeeded}</p>
            </section>
            <section>
              <h3>Что входит</h3>
              <ul>
                ${s.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </section>
            <section>
              <h3>Что получаете на выходе</h3>
              <p>${s.whatYouGet}</p>
            </section>
            <section>
              <h3>С чего можно начать</h3>
              <p>${s.howToStart}</p>
            </section>
          </article>
        `).join('')}
        <section>
          <h2>Не знаете, с чего начать?</h2>
          <p>Можно прийти не с готовым ТЗ, а просто с описанием проблемы. Помогу понять, что реально стоит автоматизировать и какой формат старта будет разумным.</p>
        </section>
      `;
    } else if (route.path === '/about') {
      contentDiv.innerHTML = `
        <h1>Обо мне</h1>
        <p>Я помогаю автоматизировать поддержку, заявки, документы и процессы без лишней сложности</p>
        <section>
          <h2>${siteContent.about.name}</h2>
          <p>${siteContent.about.role}</p>
          <p>${siteContent.about.intro}</p>
        </section>
        <section>
          <h2>Как я подхожу к работе</h2>
          <p>${siteContent.about.approach}</p>
        </section>
        <section>
          <h2>Почему со мной удобно работать</h2>
          ${siteContent.trust.reasons.map(r => `
            <article>
              <h3>${r.title}</h3>
              <p>${r.description}</p>
            </article>
          `).join('')}
        </section>
        <section>
          <h2>В каком формате можем работать</h2>
          <article>
            <h3>Разбор задачи</h3>
            <p>Можно начать с короткого обсуждения и понять, есть ли здесь смысл в автоматизации.</p>
          </article>
          <article>
            <h3>Прототип</h3>
            <p>Если гипотезу лучше сначала проверить, собираю небольшой MVP.</p>
          </article>
          <article>
            <h3>Решение под ключ</h3>
            <p>Если задача понятна, могу провести её от анализа до запуска и передачи в работу.</p>
          </article>
          <article>
            <h3>Доработка того, что уже есть</h3>
            <p>Если у вас уже есть автоматизация, бот или AI-сценарий, могу помочь улучшить его и сделать полезнее.</p>
          </article>
        </section>
        <section>
          <h2>Чтобы не тратить ваше время</h2>
          <p>Сразу честно: я полезен не во всех задачах</p>
          <ul>
            <li>Не делаю AI ради идеи без понятной бизнес-задачи</li>
            <li>Не беру слишком размытые проекты без понимания, что именно нужно улучшить</li>
            <li>Не продаю просто "набор промптов" — собираю рабочие решения под процесс</li>
          </ul>
        </section>
      `;
    } else if (route.path === '/contact') {
      contentDiv.innerHTML = `
        <h1>Контакты</h1>
        <p>Можно написать даже если задача еще не до конца сформулирована</p>
        <p>Если у вас есть идея, задача или процесс, который хочется автоматизировать — напишите мне. Помогу понять, есть ли здесь смысл в AI, с чего лучше начать и какой формат решения подойдет.</p>
        <section>
          <h2>Как связаться</h2>
          <p>Telegram: @eth1r</p>
          <p>Email: aiworker43@gmail.com</p>
        </section>
        <section>
          <h2>Что можно написать в первом сообщении</h2>
          <p>Достаточно коротко описать:</p>
          <ul>
            <li>что сейчас работает неудобно;</li>
            <li>где команда тратит слишком много времени;</li>
            <li>что вы хотите ускорить, упростить или автоматизировать.</li>
          </ul>
          <p>Даже если задача еще сырая — этого уже достаточно, чтобы начать обсуждение.</p>
        </section>
        <section>
          <h2>Частые вопросы</h2>
          ${siteContent.faq.map(q => `
            <article>
              <h3>${q.question}</h3>
              <p>${q.answer}</p>
            </article>
          `).join('')}
        </section>
      `;
    } else if (route.path === '/audit') {
      contentDiv.innerHTML = `
        <h1>🔍 Site Audit Page</h1>
        <p>Служебная страница для анализа структуры и контента сайта</p>
        <section>
          <h2>Публичные маршруты</h2>
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/cases">Кейсы</a></li>
            <li><a href="/services">Услуги</a></li>
            <li><a href="/about">Обо мне</a></li>
            <li><a href="/contact">Контакты</a></li>
            ${projects.map(p => `<li><a href="/cases/${p.slug}">${p.title}</a></li>`).join('')}
          </ul>
        </section>
        <section>
          <h2>Технические ресурсы</h2>
          <ul>
            <li><a href="/content-manifest.json">content-manifest.json</a></li>
            <li><a href="/sitemap.xml">sitemap.xml</a></li>
            <li><a href="/robots.txt">robots.txt</a></li>
          </ul>
        </section>
      `;
    } else if (route.path.startsWith('/cases/')) {
      const project = projects.find(p => `/cases/${p.slug}` === route.path);
      if (project) {
        contentDiv.innerHTML = `
          <h1>${project.title}</h1>
          <p>${project.short_pitch}</p>
          <section>
            <h2>Проблема клиента</h2>
            <p>${project.client_problem}</p>
          </section>
          <section>
            <h2>Решение</h2>
            <p>${project.solution}</p>
          </section>
          <section>
            <h2>Результат</h2>
            <p>${project.result.headline}</p>
            <ul>
              ${project.result.metrics.map(m => `<li>${m.label}: ${m.value}</li>`).join('')}
            </ul>
          </section>
          <section>
            <h2>Бизнес-ценность</h2>
            <ul>
              ${project.business_value.map(v => `<li>${v}</li>`).join('')}
            </ul>
          </section>
        `;
      }
    }
    
    root.appendChild(contentDiv);
  }
  
  // Добавляем JS из сборки в конец body
  assets.jsScripts.forEach(jsHtml => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = jsHtml;
    const script = tempDiv.firstChild;
    document.body.appendChild(script);
  });
  
  return dom.serialize();
}

// Для каждого маршрута создаем директорию и index.html с контентом
routes.forEach(route => {
  const routePath = route.path === '/' ? '' : route.path;
  const targetDir = path.join(distPath, routePath);
  const targetFile = path.join(targetDir, 'index.html');
  
  // Создаем директорию если нужно
  if (route.path !== '/') {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Генерируем HTML с контентом
  const html = generatePageContent(route);
  
  // Записываем файл
  const targetPath = route.path === '/' ? indexPath : targetFile;
  fs.writeFileSync(targetPath, html, 'utf-8');
  
  console.log('✅', route.path, '→', path.relative(distPath, targetPath));
});

console.log('✨ Prerender complete! Generated', routes.length, 'pages.');
