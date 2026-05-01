import React from 'react';
import { Link } from 'react-router-dom';
import siteContent from '../content/siteContent';
import projects from '../../projects.json';
import './Audit.css';

function Audit() {
  const routes = [
    { path: '/', title: 'Главная', description: 'Автоматизация поддержки клиентов и обработки заявок с помощью AI' },
    { path: '/cases', title: 'Кейсы', description: 'Реализованные проекты по автоматизации и AI' },
    { path: '/services', title: 'Услуги', description: 'AI-ассистенты, автоматизация процессов, обработка документов' },
    { path: '/about', title: 'Обо мне', description: 'Андрей - фриланс-специалист по AI и автоматизации' },
    { path: '/contact', title: 'Контакты', description: 'Свяжитесь со мной для обсуждения проекта' },
    ...projects.map(p => ({ 
      path: `/cases/${p.slug}`, 
      title: p.title, 
      description: p.short_pitch 
    }))
  ];

  const homeSections = [
    { id: 'hero', title: 'Hero', description: 'Главный экран с позиционированием' },
    { id: 'trustCards', title: 'Trust Cards', description: 'Карточки доверия' },
    { id: 'whoIWorkWith', title: 'С кем я работаю', description: `${siteContent.whoIWorkWith.segments.length} сегментов клиентов` },
    { id: 'whatIHelp', title: 'С какими задачами', description: `${siteContent.whatIHelp.tasks.length} проблем → решений` },
    { id: 'services', title: 'Услуги', description: `${siteContent.services.length} услуг` },
    { id: 'cases', title: 'Кейсы', description: `${projects.filter(p => p.isFeatured).length} избранных кейса` },
    { id: 'howItWorks', title: 'Как проходит работа', description: `${siteContent.howItWorks.main.steps.length} шага` },
    { id: 'workFormat', title: 'Форматы работы', description: `${siteContent.workFormat.formats.length} формата` },
    { id: 'trust', title: 'Почему со мной работают', description: `${siteContent.trust.points.length} преимуществ` },
    { id: 'about', title: 'Обо мне', description: 'Краткое представление' },
    { id: 'whatIDoNotDo', title: 'С чем не работаю', description: 'Честный блок' },
    { id: 'cta', title: 'CTA', description: 'Призыв к действию' }
  ];

  return (
    <div className="audit-page">
      <div className="audit-container">
        <header className="audit-header">
          <h1>🔍 Site Audit Page</h1>
          <p className="audit-subtitle">
            Служебная страница для анализа структуры и контента сайта
          </p>
          <div className="audit-meta">
            <span>Язык: ru</span>
            <span>•</span>
            <span>Маршрутов: {routes.length}</span>
            <span>•</span>
            <span>Кейсов: {projects.length}</span>
          </div>
        </header>

        {/* Публичные маршруты */}
        <section className="audit-section">
          <h2>📍 Публичные маршруты ({routes.length})</h2>
          <div className="audit-routes">
            {routes.map(route => (
              <div key={route.path} className="audit-route-card">
                <div className="audit-route-header">
                  <Link to={route.path} className="audit-route-link">
                    {route.path}
                  </Link>
                  <span className="audit-route-badge">HTML</span>
                </div>
                <div className="audit-route-meta">
                  <strong>Title:</strong> {route.title}
                </div>
                <div className="audit-route-meta">
                  <strong>Description:</strong> {route.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Секции главной страницы */}
        <section className="audit-section">
          <h2>🏠 Секции главной страницы ({homeSections.length})</h2>
          <div className="audit-sections">
            {homeSections.map((section, index) => (
              <div key={section.id} className="audit-section-card">
                <div className="audit-section-number">{index + 1}</div>
                <div className="audit-section-content">
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Кейсы */}
        <section className="audit-section">
          <h2>📂 Кейсы ({projects.length})</h2>
          <div className="audit-cases">
            {projects.map(project => (
              <div key={project.id} className="audit-case-card">
                <div className="audit-case-header">
                  <Link to={`/cases/${project.slug}`} className="audit-case-link">
                    {project.title}
                  </Link>
                  {project.isFeatured && <span className="audit-badge-featured">Featured</span>}
                </div>
                <div className="audit-case-meta">
                  <span className="audit-case-category">{project.category}</span>
                  <span>•</span>
                  <span>Slug: {project.slug}</span>
                </div>
                <p className="audit-case-pitch">{project.short_pitch}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Услуги */}
        <section className="audit-section">
          <h2>💼 Услуги ({siteContent.services.length})</h2>
          <div className="audit-services">
            {siteContent.services.map((service, index) => (
              <div key={index} className="audit-service-card">
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
                <div className="audit-service-details">
                  <strong>Когда нужно:</strong> {service.whenNeeded}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA блоки */}
        <section className="audit-section">
          <h2>📢 CTA блоки</h2>
          <div className="audit-cta-list">
            <div className="audit-cta-card">
              <h3>{siteContent.cta.hero.headline}</h3>
              <p>{siteContent.cta.hero.text}</p>
              <span className="audit-cta-button">{siteContent.cta.hero.primaryButton}</span>
            </div>
            <div className="audit-cta-card">
              <h3>{siteContent.cta.final.headline}</h3>
              <p>{siteContent.cta.final.text}</p>
              <span className="audit-cta-button">{siteContent.cta.final.primaryButton}</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="audit-section">
          <h2>❓ FAQ ({siteContent.faq.length})</h2>
          <div className="audit-faq-list">
            {siteContent.faq.map((item, index) => (
              <div key={index} className="audit-faq-item">
                <h4>{index + 1}. {item.question}</h4>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Технические ресурсы */}
        <section className="audit-section">
          <h2>🔧 Технические ресурсы</h2>
          <div className="audit-resources">
            <a href="/content-manifest.json" target="_blank" rel="noopener noreferrer" className="audit-resource-link">
              📄 content-manifest.json
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="audit-resource-link">
              🗺️ sitemap.xml
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="audit-resource-link">
              🤖 robots.txt
            </a>
          </div>
        </section>

        {/* Структура сайта */}
        <section className="audit-section">
          <h2>🏗️ Структура сайта</h2>
          <div className="audit-structure">
            <pre>{`
├── / (Главная)
│   ├── Hero
│   ├── Trust Cards
│   ├── С кем я работаю (${siteContent.whoIWorkWith.segments.length} сегментов)
│   ├── С какими задачами (${siteContent.whatIHelp.tasks.length} проблем)
│   ├── Услуги (${siteContent.services.length} услуг)
│   ├── Кейсы (${projects.filter(p => p.isFeatured).length} featured)
│   ├── Как проходит работа (${siteContent.howItWorks.main.steps.length} шага)
│   ├── Форматы работы (${siteContent.workFormat.formats.length} формата)
│   ├── Почему со мной работают (${siteContent.trust.points.length} преимуществ)
│   ├── Обо мне
│   ├── С чем не работаю
│   └── CTA
│
├── /cases (Список кейсов)
│   ├── ${projects[0]?.slug}
│   ├── ${projects[1]?.slug}
│   └── ${projects[2]?.slug}
│
├── /services (Услуги)
│   ├── AI-ассистенты для поддержки
│   ├── Автоматизация бизнес-процессов
│   ├── Обработка документов с AI
│   ├── AI для точных ответов по документам
│   └── Быстрые AI-прототипы
│
├── /about (Обо мне)
│   ├── Имя и роль
│   ├── Мой подход
│   ├── Как я работаю
│   ├── С кем работаю
│   └── Почему со мной работают
│
└── /contact (Контакты)
    ├── Форма контакта
    ├── Контактные данные
    ├── FAQ (${siteContent.faq.length} вопросов)
    └── Процесс работы
            `}</pre>
          </div>
        </section>

        <footer className="audit-footer">
          <p>
            Эта страница создана для внешнего аудита и анализа сайта.
            Все данные актуальны на момент генерации.
          </p>
          <p className="audit-footer-note">
            <Link to="/">← Вернуться на главную</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Audit;
