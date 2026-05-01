import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CaseCard from '../components/CaseCard'
import { siteContent } from '../content/siteContent'
import './Home.css'

function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/projects.json')
      .then(res => res.json())
      .then(data => {
        const featured = data.filter(p => p.isFeatured).slice(0, 3)
        setProjects(featured)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading projects:', err)
        setLoading(false)
      })
  }, [])

  const { hero, trustCards, services, trust, whoIWorkWith, whatIHelp, whatIDoNotDo, workFormat } = siteContent

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          {hero.main.headline}
        </h1>
        <p className="hero-subtitle">
          {hero.main.subheadline}
        </p>
        <div className="hero-cta">
          <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large">
            {hero.main.primaryCTA}
          </a>
          <Link to="/cases" className="btn btn-secondary btn-large">
            {hero.main.secondaryCTA}
          </Link>
        </div>
        {hero.main.ctaNote && (
          <p className="hero-cta-note">{hero.main.ctaNote}</p>
        )}
      </section>

      {/* Trust Cards Section */}
      <section className="trust-cards">
        <div className="trust-cards-grid">
          {trustCards.items.map((card, index) => (
            <div key={index} className="trust-card">
              <h3 className="trust-card-title">{card.title}</h3>
              <p className="trust-card-text">{card.text}</p>
              {card.link && (
                <a href={card.link} target="_blank" rel="noopener noreferrer" className="trust-card-link">
                  {card.linkText} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Who I Work With Section */}
      <section className="who-work-with">
        <h2 className="section-title">{whoIWorkWith.headline}</h2>
        <p className="section-subtitle">{whoIWorkWith.subheadline}</p>
        <div className="segments-grid">
          {whoIWorkWith.segments.map((segment, index) => (
            <div key={index} className="segment-card">
              <div className="segment-icon">{segment.icon}</div>
              <h3 className="segment-title">{segment.title}</h3>
              <p className="segment-description">{segment.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What I Help With Section */}
      <section className="what-help">
        <h2 className="section-title">{whatIHelp.headline}</h2>
        <p className="section-subtitle">{whatIHelp.subheadline}</p>
        <div className="tasks-list">
          {whatIHelp.tasks.map((task, index) => (
            <div key={index} className="task-item">
              <div className="task-icon">{task.icon}</div>
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-solution">→ {task.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="services-preview">
        <h2 className="section-title">Чем могу помочь</h2>
        <p className="section-subtitle">Форматы решений, которые можно внедрить под вашу задачу</p>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                {service.id === 'ai-assistants' && '🤖'}
                {service.id === 'process-automation' && '⚡'}
                {service.id === 'document-processing' && '📄'}
                {service.id === 'rag-knowledge-base' && '🎯'}
                {service.id === 'ai-prototypes' && '🚀'}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">
                {service.shortDescription}
              </p>
              {service.suitableFor && (
                <p className="service-suitable">
                  {service.suitableFor}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="section-cta">
          <Link to="/services" className="btn btn-outline">
            {siteContent.ctaButtons.allServices} →
          </Link>
        </div>
      </section>

      {/* Cases Section */}
      <section className="cases-preview">
        <h2 className="section-title">Кейсы</h2>
        <p className="section-subtitle">
          Реальные решения с понятным результатом для бизнеса
        </p>
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div className="cases-grid">
            {projects.map(project => (
              <CaseCard key={project.id} project={project} />
            ))}
          </div>
        )}
        <div className="section-cta">
          <Link to="/cases" className="btn btn-outline">
            Все кейсы →
          </Link>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <h2 className="section-title">{siteContent.howItWorks.main.headline}</h2>
        <p className="section-subtitle">{siteContent.howItWorks.main.subheadline}</p>
        <div className="process-steps">
          {siteContent.howItWorks.main.steps.map(step => (
            <div key={step.number} className="process-step">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Work Format Section */}
      <section className="work-format">
        <h2 className="section-title">{workFormat.headline}</h2>
        <p className="section-subtitle">{workFormat.subheadline}</p>
        <div className="format-grid">
          {workFormat.formats.map((format, index) => (
            <div key={index} className="format-card">
              <div className="format-icon">{format.icon}</div>
              <h3 className="format-title">{format.title}</h3>
              <p className="format-description">{format.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust/Why Work With Me Section */}
      <section className="why-work">
        <h2 className="section-title">{trust.headline}</h2>
        <p className="section-subtitle">{trust.subheadline}</p>
        <div className="why-grid">
          {trust.points.map((point, index) => (
            <div key={index} className="why-item">
              <div className="why-number">{point.number}</div>
              <h3 className="why-title">{point.title}</h3>
              <p className="why-text">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview">
        <div className="about-content">
          <div className="about-personal">
            <div className="personal-avatar">
              <div className="avatar-circle">А</div>
            </div>
            <div className="personal-info">
              <h2 className="personal-name">{siteContent.about.short.name}</h2>
              <p className="personal-role">{siteContent.about.short.role}</p>
            </div>
          </div>
          <p className="about-text">
            {siteContent.about.short.intro}
          </p>
          <Link to="/about" className="btn btn-outline">
            Подробнее обо мне →
          </Link>
        </div>
      </section>

      {/* What I Do Not Do Section */}
      <section className="what-not-do">
        <h2 className="section-title">{whatIDoNotDo.headline}</h2>
        <p className="section-subtitle">{whatIDoNotDo.subheadline}</p>
        <ul className="not-do-list">
          {whatIDoNotDo.items.map((item, index) => (
            <li key={index} className="not-do-item">
              <span className="not-do-icon">✗</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <h2 className="cta-title">{siteContent.cta.final.headline}</h2>
        <p className="cta-text">
          {siteContent.cta.final.text}
        </p>
        <div className="cta-buttons">
          <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large">
            {siteContent.cta.final.primaryButton}
          </a>
          <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-large">
            {siteContent.cta.final.secondaryButton}
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home
