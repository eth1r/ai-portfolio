import { useEffect } from 'react'
import { siteContent } from '../content/siteContent'
import './About.css'

function About() {
  useEffect(() => {
    document.title = 'Обо мне | Автоматизация поддержки с AI'
  }, [])

  const { trust, workFormat, whatIDoNotDo } = siteContent
  const telegramLink = "https://t.me/eth1r"

  const aboutData = {
    name: "Андрей",
    role: "Специалист по автоматизации поддержки, заявок и документов",
    intro: "Работаю на стыке AI, автоматизации и прикладных бизнес-задач. Помогаю командам убирать ручную рутину из поддержки и внутренних процессов, чтобы сотрудники тратили меньше времени на повторяющиеся действия, а системы работали стабильнее и понятнее.",
    approach: "Мне неинтересно усложнять решение ради технологии. Я стараюсь сначала понять, где у команды реально теряется время, где появляются ошибки и что можно улучшить без лишней архитектуры. Часто лучший старт — это не большой проект, а небольшой рабочий сценарий, который можно быстро проверить на практике."
  }

  return (
    <div className="about">
      <section className="about-hero">
        <h1 className="about-page-title">Обо мне</h1>
        <p className="about-page-subtitle">
          Я помогаю автоматизировать поддержку, заявки, документы и процессы без лишней сложности
        </p>
      </section>

      <section className="about-personal">
        <div className="about-avatar-large">
          <div className="avatar-placeholder-large">А</div>
        </div>
        <div className="about-personal-content">
          <h2 className="about-name">{aboutData.name}</h2>
          <p className="about-role">{aboutData.role}</p>
          <p className="about-intro">{aboutData.intro}</p>
        </div>
      </section>

      <section className="about-approach">
        <h2 className="section-heading">Как я подхожу к работе</h2>
        <p className="approach-text">{aboutData.approach}</p>
      </section>

      <section className="about-why">
        <h2 className="section-heading">{trust.headline}</h2>
        <div className="why-grid">
          {trust.points.map((point, index) => (
            <div key={index} className="why-item">
              <h3 className="why-title">{point.title}</h3>
              <p className="why-text">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-format">
        <h2 className="section-heading">{workFormat.headline}</h2>
        <div className="format-cards">
          {workFormat.formats.map((format, index) => (
            <div key={index} className="format-card">
              <div className="format-icon">{format.icon}</div>
              <h3 className="format-title">{format.title}</h3>
              <p className="format-text">{format.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-not-do">
        <h2 className="section-heading">{whatIDoNotDo.headline}</h2>
        <p className="not-do-subtitle">{whatIDoNotDo.subheadline}</p>
        <ul className="not-do-list">
          {whatIDoNotDo.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="about-cta">
        <h2 className="cta-title">Если у вас есть задача — можно начать с разговора</h2>
        <p className="cta-text">
          Не обязательно приходить с готовым ТЗ. Достаточно описать ситуацию, а дальше я помогу понять, что стоит автоматизировать и в каком формате лучше двигаться.
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
            Посмотреть кейсы
          </a>
        </div>
      </section>
    </div>
  )
}

export default About
