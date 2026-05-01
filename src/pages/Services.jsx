import { useEffect } from 'react'
import { siteContent } from '../content/siteContent'
import './Services.css'

function Services() {
  useEffect(() => {
    document.title = 'Услуги | Автоматизация поддержки с AI'
  }, [])

  const { services } = siteContent
  const telegramLink = "https://t.me/eth1r"

  return (
    <div className="services">
      <section className="services-hero">
        <h1 className="services-title">Услуги</h1>
        <p className="services-subtitle">
          Решения для поддержки, заявок, документов и процессов, где AI должен приносить пользу, а не добавлять сложность
        </p>
        <p className="services-intro">
          Я работаю с задачами, где много ручной рутины, повторяющихся действий и однотипных обращений. Ниже — основные форматы, с которых можно начать.
        </p>
      </section>

      <section className="services-list">
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
            <p className="service-description">{service.shortDescription}</p>
            
            <div className="service-section">
              <h4 className="service-section-title">Когда это нужно</h4>
              <p className="service-section-text">{service.whenNeeded}</p>
            </div>

            <div className="service-section">
              <h4 className="service-section-title">Что входит</h4>
              <ul className="service-list">
                {service.whatIncluded.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="service-section">
              <h4 className="service-section-title">Что получаете на выходе</h4>
              <p className="service-section-text">{service.whatYouGet}</p>
            </div>

            <div className="service-section">
              <h4 className="service-section-title">С чего можно начать</h4>
              <p className="service-section-text">{service.howToStart}</p>
            </div>

            <a 
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {service.ctaText}
            </a>
          </div>
        ))}
      </section>

      <section className="services-final-cta">
        <h2 className="cta-title">Не знаете, с чего начать?</h2>
        <p className="cta-text">
          Можно прийти не с готовым ТЗ, а просто с описанием проблемы. Помогу понять, что реально стоит автоматизировать и какой формат старта будет разумным.
        </p>
        <div className="cta-buttons">
          <a 
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-large"
          >
            Написать в Telegram
          </a>
          <a 
            href="/cases"
            className="btn btn-outline btn-large"
          >
            Перейти к кейсам
          </a>
        </div>
      </section>
    </div>
  )
}

export default Services
