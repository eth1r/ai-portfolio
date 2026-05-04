import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CaseCard from '../components/CaseCard'
import './Cases.css'

function Cases() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Обновляем title страницы
    document.title = 'Кейсы | Автоматизация поддержки с AI'
    
    fetch('/projects.json')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading projects:', err)
        setLoading(false)
      })
  }, [])

  const categories = ['all', 'RAG / База знаний', 'Документы', 'Автоматизация', 'Поддержка и автоматизация', 'Обучение и автоматизация']
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter)

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="cases">
      <section className="cases-hero">
        <h1 className="cases-title">Кейсы</h1>
        <p className="cases-subtitle">
          Примеры решений, которые помогают разгружать поддержку, ускорять обработку заявок и убирать ручную рутину
        </p>
        <p className="cases-intro">
          Ниже — не абстрактные демо, а примеры прикладных решений под реальные бизнес-задачи. Если у вас похожая ситуация, можно взять один из кейсов как отправную точку и адаптировать его под ваш процесс.
        </p>
      </section>

      <section className="cases-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'Все кейсы' : cat}
          </button>
        ))}
      </section>

      <section className="cases-grid-section">
        <div className="cases-grid">
          {filteredProjects.map(project => (
            <CaseCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Cases CTA Section */}
      <section className="cases-cta">
        <h2 className="cases-cta-title">Есть похожая задача?</h2>
        <p className="cases-cta-text">
          Можно взять один из этих кейсов за основу и адаптировать под ваш процесс, команду и текущие инструменты.
        </p>
        <div className="cases-cta-buttons">
          <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large">
            Обсудить задачу
          </a>
          <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-large">
            Написать в Telegram
          </a>
        </div>
      </section>
    </div>
  )
}

export default Cases
