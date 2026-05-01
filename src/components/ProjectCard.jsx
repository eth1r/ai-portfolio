import React, { useState } from 'react'
import MermaidChart from './MermaidChart'
import './ProjectCard.css'

// SVG иконки для категорий
const categoryIcons = {
  'AI Architecture': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="7" r="2" fill="currentColor"/>
    </svg>
  ),
  'Data Engineering': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 10H17M7 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  ),
  'Automation': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 1V4M12 20V23M23 12H20M4 12H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19.07 4.93L16.95 7.05M7.05 16.95L4.93 19.07M19.07 19.07L16.95 16.95M7.05 7.05L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'default': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ProjectCard({ project }) {
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    return favorites.includes(project.id)
  })
  const [copied, setCopied] = useState(false)
  const [showDiagram, setShowDiagram] = useState(false)

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (isFavorite) {
      const updated = favorites.filter(id => id !== project.id)
      localStorage.setItem('favorites', JSON.stringify(updated))
    } else {
      favorites.push(project.id)
      localStorage.setItem('favorites', JSON.stringify(favorites))
    }
    setIsFavorite(!isFavorite)
  }

  const copyPrompt = () => {
    if (project.content?.prompt_preview) {
      navigator.clipboard.writeText(project.content.prompt_preview)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Форматирование метрик для отображения
  const formatMetric = (value) => {
    if (typeof value === 'string' && value.includes('.')) {
      return (parseFloat(value) * 100).toFixed(0) + '%'
    }
    return value
  }

  // Определение уровня метрики для цветовой кодировки
  const getMetricLevel = (value) => {
    const numValue = parseFloat(value)
    if (numValue > 0.8) return 'high'
    if (numValue >= 0.5) return 'medium'
    return 'low'
  }

  // Получение иконки для категории
  const getCategoryIcon = () => {
    return categoryIcons[project.category] || categoryIcons['default']
  }

  return (
    <div className="project-card">
      <div className="card-header">
        <div className="card-icon-container">
          {getCategoryIcon()}
        </div>
        <div className="card-title-row">
          <h3 className="card-title">{project.title}</h3>
          <span className={`complexity-badge ${project.complexity?.toLowerCase()}`}>
            {project.complexity}
          </span>
        </div>
        <p className="card-category">{project.category}</p>
      </div>

      <p className="card-description">{project.shortDescription}</p>

      {/* Бизнес-эффект */}
      {project.business_value && (
        <div className="business-value">
          <div className="business-value-label">💼 Бизнес-эффект</div>
          <p className="business-value-text">{project.business_value}</p>
        </div>
      )}

      {/* Технический стек */}
      {project.technical_deep_dive && (
        <div className="technical-stack">
          <div className="technical-stack-label">⚙️ Технический стек</div>
          <p className="technical-stack-text">{project.technical_deep_dive}</p>
          
          {/* Architecture Diagram Toggle */}
          {project.architecture_diagram && (
            <div className="architecture-diagram-section">
              <button 
                className="btn-diagram-toggle"
                onClick={() => setShowDiagram(!showDiagram)}
              >
                {showDiagram ? '▼ Hide Architecture Schema' : '▶ View Architecture Schema'}
              </button>
              
              <div className={`diagram-container ${showDiagram ? 'expanded' : 'collapsed'}`}>
                {showDiagram && (
                  <MermaidChart 
                    chart={project.architecture_diagram} 
                    id={`diagram-${project.id}`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card-tags">
        {project.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      {/* Метрики производительности */}
      {project.metrics && (
        <div className="card-metrics-new">
          <div className="metrics-label">📊 Метрики производительности</div>
          <div className="metrics-grid">
            {project.metrics.faithfulness && (
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Faithfulness</span>
                  <span className={`metric-badge ${getMetricLevel(project.metrics.faithfulness)}`}>
                    {formatMetric(project.metrics.faithfulness)}
                  </span>
                </div>
              </div>
            )}
            {project.metrics.context_precision && (
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Context Precision</span>
                  <span className={`metric-badge ${getMetricLevel(project.metrics.context_precision)}`}>
                    {formatMetric(project.metrics.context_precision)}
                  </span>
                </div>
              </div>
            )}
            {project.metrics.latency && (
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">Latency</span>
                  <span className="metric-value">{project.metrics.latency}</span>
                </div>
                <div className="latency-indicator">
                  <span className="latency-badge">⚡ Fast</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card-actions">
        {project.content?.prompt_preview && (
          <button 
            className="btn btn-primary" 
            onClick={copyPrompt}
          >
            {copied ? '✓ Скопировано' : '📋 Копировать промпт'}
          </button>
        )}
        <button 
          className={`btn btn-favorite ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      {project.links && (
        <div className="card-links">
          {project.links.github && project.links.github !== '#' && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer">
              GitHub →
            </a>
          )}
          {project.links.demo && project.links.demo !== '#' && (
            <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
              Demo →
            </a>
          )}
          {project.links.case_study && project.links.case_study !== '#' && (
            <a href={project.links.case_study} target="_blank" rel="noopener noreferrer">
              Case Study →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectCard
