import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Читаем projects.json
const projectsPath = path.resolve(__dirname, '../projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

// Читаем content snapshot
const contentPath = path.resolve(__dirname, 'content-snapshot.json');
let siteContent;
try {
  siteContent = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));
} catch (error) {
  // Если snapshot не найден, используем актуальную структуру
  const siteContentModule = await import('../src/content/siteContent.js');
  siteContent = siteContentModule.siteContent;
}

// Генерируем манифест
const manifest = {
  meta: {
    siteName: 'AI Portfolio - Андрей',
    siteUrl: 'https://portfolio.aiworker43.ru',
    description: 'Автоматизация поддержки клиентов и обработки заявок с помощью AI',
    language: 'ru',
    author: 'Андрей',
    role: 'Фриланс-специалист по AI и автоматизации',
    generatedAt: new Date().toISOString()
  },
  
  navigation: [
    { path: '/', label: 'Главная' },
    { path: '/cases', label: 'Кейсы' },
    { path: '/services', label: 'Услуги' },
    { path: '/about', label: 'Обо мне' },
    { path: '/contact', label: 'Контакты' }
  ],
  
  routes: {
    '/': {
      title: 'Главная',
      description: 'Автоматизация поддержки клиентов и обработки заявок с помощью AI',
      sections: [
        'hero',
        'trustCards',
        'whoIWorkWith',
        'whatIHelp',
        'services',
        'cases',
        'howItWorks',
        'workFormat',
        'trust',
        'about',
        'whatIDoNotDo',
        'cta'
      ]
    },
    '/cases': {
      title: 'Кейсы',
      description: 'Реализованные проекты по автоматизации и AI',
      casesCount: projects.length
    },
    '/services': {
      title: 'Услуги',
      description: 'AI-ассистенты, автоматизация процессов, обработка документов',
      servicesCount: siteContent.services.length
    },
    '/about': {
      title: 'Обо мне',
      description: 'Андрей - фриланс-специалист по AI и автоматизации'
    },
    '/contact': {
      title: 'Контакты',
      description: 'Свяжитесь со мной для обсуждения проекта',
      faqCount: siteContent.faq.length
    }
  },
  
  content: {
    hero: {
      headline: siteContent.hero?.main?.headline || 'Помогаю бизнесу меньше тратить время на поддержку, заявки и документы с помощью AI',
      subheadline: siteContent.hero?.main?.subheadline || 'Настраиваю AI-помощников и автоматизацию для повторяющихся задач'
    },
    
    whoIWorkWith: {
      headline: siteContent.whoIWorkWith?.headline || 'С кем я работаю',
      segments: (siteContent.whoIWorkWith?.segments || []).map(s => ({
        title: s.title,
        description: s.description
      }))
    },
    
    services: (siteContent.services || []).map(s => ({
      title: s.title,
      shortDescription: s.shortDescription,
      whenNeeded: s.whenNeeded
    })),
    
    trust: {
      headline: siteContent.trust?.headline || 'Почему со мной удобно работать',
      points: (siteContent.trust?.points || []).map(p => ({
        title: p.title,
        description: p.description
      }))
    },
    
    about: {
      name: siteContent.about?.main?.name || "Андрей",
      role: siteContent.about?.main?.role || "Фриланс-специалист по AI и автоматизации"
    },
    
    faq: (siteContent.faq || []).map(q => ({
      question: q.question,
      answer: q.answer
    }))
  },
  
  cases: projects.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    audience: p.audience,
    shortPitch: p.short_pitch,
    clientProblem: p.client_problem,
    solution: p.solution,
    result: {
      headline: p.result.headline,
      metrics: p.result.metrics
    },
    businessValue: p.business_value,
    servicesUsed: p.services_used,
    deliverables: p.deliverables,
    timeline: p.timeline,
    stack: p.stack,
    isFeatured: p.isFeatured,
    url: `/cases/${p.slug}`
  }))
};

// Записываем манифест
const distPath = path.resolve(__dirname, '../dist');
const manifestPath = path.join(distPath, 'content-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log('✅ Content manifest generated:', manifestPath);
console.log('📊 Stats:');
console.log('  - Routes:', Object.keys(manifest.routes).length);
console.log('  - Cases:', manifest.cases.length);
console.log('  - Services:', manifest.content.services.length);
console.log('  - FAQ:', manifest.content.faq.length);
