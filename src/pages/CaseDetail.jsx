import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import MermaidChart from '../components/MermaidChart'
import TelegramReturnBotDemo from '../components/TelegramReturnBotDemo'
import './CaseDetail.css'

function CaseDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTechnical, setShowTechnical] = useState(false)

  useEffect(() => {
    fetch('/projects.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p.slug === slug)
        setProject(found)
        setLoading(false)
        
        // Обновляем title страницы
        if (found) {
          document.title = `${found.title} | AI и Автоматизация`
          // Обновляем meta description
          const metaDescription = document.querySelector('meta[name="description"]')
          if (metaDescription) {
            metaDescription.setAttribute('content', found.short_pitch)
          }
        }
      })
      .catch(err => {
        console.error('Error loading project:', err)
        setLoading(false)
      })
  }, [slug])

  // Скролл к демо если есть хэш #demo
  useEffect(() => {
    if (location.hash === '#demo' && project) {
      setTimeout(() => {
        const demoSection = document.getElementById('demo-section')
        if (demoSection) {
          demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [location, project])

  if (loading) {
    return <div className="case-detail loading">Загрузка...</div>
  }

  if (!project) {
    return (
      <div className="case-detail not-found">
        <h1>Кейс не найден</h1>
        <Link to="/cases" className="btn btn-primary">← Все кейсы</Link>
      </div>
    )
  }

  return (
    <div className="case-detail">
      <div className="case-detail-header">
        <Link to="/cases" className="back-link">← Все кейсы</Link>
        <span className="case-category-badge">{project.category}</span>
        <h1 className="case-detail-title">{project.title}</h1>
        <p className="case-detail-audience">Для кого: {project.audience}</p>
      </div>

      <section className="case-section">
        <h2 className="section-title">Проблема</h2>
        <p className="section-text">{project.client_problem}</p>
      </section>

      <section className="case-section">
        <h2 className="section-title">Решение</h2>
        <p className="section-text">{project.solution}</p>
      </section>

      {project.key_features && (
        <section className="case-section">
          <h2 className="section-title">Возможности бота</h2>
          <ul className="features-list">
            {project.key_features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </section>
      )}

      {project.collected_data && (
        <section className="case-section">
          <h2 className="section-title">Какие данные собирает бот</h2>
          <div className="collected-data-grid">
            <div className="data-column">
              <h3 className="data-column-title">Обязательные поля</h3>
              <ul className="data-list">
                {project.collected_data.required.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
            <div className="data-column">
              <h3 className="data-column-title">Опциональные поля</h3>
              <ul className="data-list optional">
                {project.collected_data.optional.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="case-section case-result-section">
        <h2 className="section-title">Результат</h2>
        <div className="result-box">
          <div className="result-headline-large">{project.result.headline}</div>
          <div className="result-metrics-large">
            {project.result.metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="metric-value-large">{metric.value}</div>
                <div className="metric-label-large">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="case-section">
        <h2 className="section-title">Бизнес-эффект</h2>
        <ul className="business-value-list">
          {project.business_value.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </section>

      <section className="case-section">
        <h2 className="section-title">Что входило в работу</h2>
        <ul className="deliverables-list">
          {project.deliverables.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="timeline-info">
          <strong>Срок реализации:</strong> {project.timeline}
        </div>
      </section>

      <section className="case-section">
        <h2 className="section-title">Технологии</h2>
        <div className="stack-tags">
          {project.stack.map((tech, index) => (
            <span key={index} className="stack-tag">{tech}</span>
          ))}
        </div>
      </section>

      {project.demo_mode && (
        <section className="case-section demo-section" id="demo-section">
          <h2 className="section-title">Попробовать демо</h2>
          <p className="section-subtitle">
            Можно пройти упрощённый сценарий общения с ботом прямо на сайте
          </p>
          <p className="demo-disclaimer">
            ⚠️ Это демонстрационный режим. Заявки из этого виджета не отправляются реальному оператору.
          </p>
          <TelegramReturnBotDemo />
        </section>
      )}

      <section className="case-cta">
        <h2 className="cta-title">Хочу похожее решение</h2>
        <p className="cta-text">
          Расскажите о вашей задаче — предложу решение и оценю сроки
        </p>
        <div className="cta-buttons">
          <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large">
            Обсудить проект
          </a>
          {project.links?.github && project.links.github !== '#' && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-large">
              Код на GitHub
            </a>
          )}
        </div>
      </section>

      {project.technical_details && project.technical_details.show_in_ui && (
        <section className="case-section technical-section">
          <button 
            className="technical-toggle"
            onClick={() => setShowTechnical(!showTechnical)}
          >
            {showTechnical ? '▼' : '▶'} Технические детали
          </button>
          
          {showTechnical && (
            <div className="technical-content">
              <p className="technical-summary">{project.technical_details.summary}</p>
              
              {project.technical_details.architecture_diagram && (
                <div className="architecture-section">
                  <h3 className="subsection-title">Архитектура решения</h3>
                  <MermaidChart 
                    chart={project.technical_details.architecture_diagram}
                    id={`detail-diagram-${project.id}`}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default CaseDetail
