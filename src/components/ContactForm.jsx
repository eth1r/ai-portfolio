import React, { useState } from 'react'
import { siteContent } from '../content/siteContent'
import './ContactForm.css'

function ContactForm({ 
  title = siteContent.cta.contact.headline, 
  subtitle = siteContent.cta.contact.text 
}) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  })
  const [status, setStatus] = useState('idle') // idle, sending, success, error

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    try {
      // Конфигурируемый endpoint через переменные окружения
      const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact'
      const method = import.meta.env.VITE_CONTACT_METHOD || 'POST'

      // Если endpoint не настроен, используем mailto fallback
      if (endpoint === '/api/contact') {
        // Fallback: открываем email клиент
        const subject = encodeURIComponent(`Новая заявка от ${formData.name}`)
        const body = encodeURIComponent(
          `Имя: ${formData.name}\nКонтакт: ${formData.contact}\n\nСообщение:\n${formData.message}`
        )
        const mailtoLink = `mailto:contact@example.com?subject=${subject}&body=${body}`
        window.location.href = mailtoLink
        
        setStatus('success')
        setFormData({ name: '', contact: '', message: '' })
        return
      }

      // Отправка на настроенный endpoint
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', contact: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className="contact-form-wrapper">
      <div className="contact-form-header">
        <h2 className="contact-form-title">{title}</h2>
        <p className="contact-form-subtitle">{subtitle}</p>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Ваше имя</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Как к вам обращаться?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact" className="form-label">Telegram или Email</label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="form-input"
            value={formData.contact}
            onChange={handleChange}
            required
            placeholder="@username или email@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">Опишите задачу</label>
          <textarea
            id="message"
            name="message"
            className="form-textarea"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Расскажите, что нужно сделать..."
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-large btn-full"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Отправка...' : 'Отправить'}
        </button>

        {status === 'success' && (
          <div className="form-message form-success">
            ✓ Спасибо! Ваше сообщение отправлено. Отвечу в течение 24 часов.
          </div>
        )}

        {status === 'error' && (
          <div className="form-message form-error">
            Произошла ошибка. Попробуйте написать напрямую в Telegram или на email.
          </div>
        )}
      </form>

      <div className="contact-form-alternative">
        <p className="alternative-text">Или напишите напрямую:</p>
        <div className="alternative-links">
          <a href="https://t.me/username" target="_blank" rel="noopener noreferrer" className="alternative-link">
            💬 Telegram
          </a>
          <a href="mailto:contact@example.com" className="alternative-link">
            📧 Email
          </a>
        </div>
      </div>
    </div>
  )
}

export default ContactForm
