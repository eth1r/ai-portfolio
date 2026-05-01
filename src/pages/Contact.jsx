import { useEffect, useState } from 'react'
import './Contact.css'

function Contact() {
  useEffect(() => {
    document.title = 'Контакты | Автоматизация поддержки с AI'
  }, [])

  const telegramLink = "https://t.me/eth1r"
  const emailAddress = "aiworker43@gmail.com"

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Redirect to Telegram as fallback
    window.open(telegramLink, '_blank')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactFaq = [
    {
      question: "С какими задачами можно обратиться?",
      answer: "С поддержкой, обработкой заявок, документами, базами знаний, workflow-процессами и быстрыми AI-прототипами."
    },
    {
      question: "Можно ли начать с маленького проекта?",
      answer: "Да. Во многих случаях разумнее сначала собрать небольшой рабочий сценарий или MVP, а уже потом решать, стоит ли масштабировать решение."
    },
    {
      question: "А если у нас уже есть какая-то автоматизация?",
      answer: "Это не проблема. Можно доработать то, что уже существует, улучшить логику, убрать слабые места и сделать решение полезнее для команды."
    },
    {
      question: "Нужен ли готовый ТЗ на старте?",
      answer: "Нет. Достаточно описать ситуацию и желаемый результат. Помогу понять, что действительно стоит автоматизировать."
    }
  ]

  return (
    <div className="contact">
      <section className="contact-hero">
        <h1 className="contact-title">Контакты</h1>
        <p className="contact-subtitle">
          Можно написать даже если задача еще не до конца сформулирована
        </p>
        <p className="contact-intro">
          Если у вас есть идея, задача или процесс, который хочется автоматизировать — напишите мне. Помогу понять, есть ли здесь смысл в AI, с чего лучше начать и какой формат решения подойдет.
        </p>
      </section>

      <section className="contact-methods-section">
        <h2 className="section-heading">Как связаться</h2>
        <div className="contact-methods">
          <div className="contact-method">
            <div className="method-icon">💬</div>
            <div className="method-content">
              <h3 className="method-title">Telegram</h3>
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="method-link">
                @eth1r
              </a>
            </div>
          </div>

          <div className="contact-method">
            <div className="method-icon">📧</div>
            <div className="method-content">
              <h3 className="method-title">Email</h3>
              <a href={`mailto:${emailAddress}`} className="method-link">
                {emailAddress}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-start-section">
        <h2 className="section-heading">Что можно написать в первом сообщении</h2>
        <div className="start-content">
          <p className="start-text">Достаточно коротко описать:</p>
          <ul className="start-list">
            <li>что сейчас работает неудобно;</li>
            <li>где команда тратит слишком много времени;</li>
            <li>что вы хотите ускорить, упростить или автоматизировать.</li>
          </ul>
          <p className="start-note">
            Даже если задача еще сырая — этого уже достаточно, чтобы начать обсуждение.
          </p>
        </div>
      </section>

      <section className="contact-form-section">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="form-label">Контакт для ответа</label>
            <input
              type="text"
              id="contact"
              name="contact"
              className="form-input"
              placeholder="Telegram, email или телефон"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">Краткое описание задачи</label>
            <textarea
              id="message"
              name="message"
              className="form-textarea"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            Отправить сообщение
          </button>
        </form>
      </section>

      <section className="contact-faq-section">
        <h2 className="section-heading">Частые вопросы</h2>
        <div className="faq-list">
          {contactFaq.map((item, index) => (
            <div key={index} className="faq-item">
              <h3 className="faq-question">{item.question}</h3>
              <p className="faq-answer">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-cta">
        <h2 className="cta-title">Проще всего — написать в Telegram</h2>
        <p className="cta-text">
          Если задача срочная или не хочется заполнять форму, просто напишите мне напрямую.
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

export default Contact
