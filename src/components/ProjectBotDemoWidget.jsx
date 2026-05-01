import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ProjectBotDemoWidget.css'

/**
 * Универсальный демо-виджет для проектов.
 *
 * Конфиг (config) берётся из поля demoWidget в projects.json.
 * Каждый кейс задаёт свои endpoint, quickPrompts, welcomeMessage и т.д.
 * UI один — сценарии разные.
 */
function ProjectBotDemoWidget({ config }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'ok' | 'unavailable'
  const messagesEndRef = useRef(null)

  const MAX_MESSAGE_LENGTH = 2000
  // Базовый URL бэкенда. Если VITE_API_URL не задан — используем тот же origin (nginx прокси).
  const BASE_URL = import.meta.env.VITE_API_URL || ''

  // ── Проверка доступности бэкенда ──────────────────────────────────────────
  useEffect(() => {
    if (!config.healthEndpoint) {
      setBackendStatus('ok')
      return
    }

    const controller = new AbortController()
    fetch(`${BASE_URL}${config.healthEndpoint}`, { signal: controller.signal })
      .then(res => setBackendStatus(res.ok ? 'ok' : 'unavailable'))
      .catch(() => setBackendStatus('unavailable'))

    return () => controller.abort()
  }, [config.healthEndpoint, BASE_URL])

  // ── Инициализация сессии и приветственного сообщения ──────────────────────
  useEffect(() => {
    if (backendStatus !== 'ok') return

    const id = `demo_${config.type || 'bot'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(id)

    if (config.welcomeMessage) {
      setMessages([{
        role: 'assistant',
        content: config.welcomeMessage,
        timestamp: new Date()
      }])
    }
  }, [backendStatus, config.type, config.welcomeMessage])

  // ── Автоскролл при новых сообщениях ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Отправка сообщения ────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])
    setIsLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000)

    try {
      const response = await fetch(`${BASE_URL}${config.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: sessionId }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) throw new Error('Слишком много запросов. Подождите немного.')
        if (response.status === 504) throw new Error('Бот не успел ответить. Попробуйте переформулировать вопрос короче.')
        if (response.status === 503) {
          setBackendStatus('unavailable')
          throw new Error('Демо временно недоступно.')
        }
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || 'Не удалось отправить сообщение')
      }

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.reply || '',
        timestamp: new Date(),
        isFinal: data.is_final || data.done || false
      }])

    } catch (error) {
      clearTimeout(timeoutId)
      const errorText = error.name === 'AbortError'
        ? 'Бот не успел ответить за 35 секунд. Попробуйте переформулировать вопрос короче.'
        : (error.message || 'Произошла ошибка. Попробуйте ещё раз.')

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // ── Сброс чата ─────────────────────────────────────────────────────────────
  const clearChat = async () => {
    // Сбрасываем сессию на бэкенде, если задан resetEndpoint
    if (config.resetEndpoint && sessionId) {
      fetch(`${BASE_URL}${config.resetEndpoint}/${sessionId}`, { method: 'DELETE' })
        .catch(() => {}) // игнорируем ошибку — это best-effort
    }

    const newId = `demo_${config.type || 'bot'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newId)
    setMessages(config.welcomeMessage
      ? [{ role: 'assistant', content: config.welcomeMessage, timestamp: new Date() }]
      : []
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Состояние: проверяем доступность ──────────────────────────────────────
  if (backendStatus === 'checking') {
    return (
      <div className="bot-demo-widget bot-demo-checking">
        <div className="bot-demo-checking-dots">
          <span></span><span></span><span></span>
        </div>
        <p>Проверяем доступность демо...</p>
      </div>
    )
  }

  // ── Состояние: бэкенд недоступен → fallback ───────────────────────────────
  if (backendStatus === 'unavailable' && config.fallback) {
    return (
      <div className="bot-demo-widget bot-demo-fallback">
        <div className="bot-demo-fallback-icon">⚠️</div>
        <h3 className="bot-demo-fallback-title">{config.fallback.title}</h3>
        <p className="bot-demo-fallback-text">{config.fallback.text}</p>
        <div className="bot-demo-fallback-actions">
          {config.fallback.primaryUrl && (
            <a
              href={config.fallback.primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              {config.fallback.primaryLabel}
            </a>
          )}
          {config.fallback.secondaryUrl && (
            <a
              href={config.fallback.secondaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              {config.fallback.secondaryLabel}
            </a>
          )}
        </div>
      </div>
    )
  }

  // ── Основной UI ────────────────────────────────────────────────────────────
  return (
    <div className="bot-demo-widget">

      {/* Шапка */}
      <div className="bot-demo-header">
        <div className="bot-demo-header-info">
          <div className="bot-demo-avatar">🤖</div>
          <div className="bot-demo-header-text">
            <div className="bot-demo-title">{config.title}</div>
            <div className="bot-demo-subtitle">{config.subtitle}</div>
          </div>
        </div>
        <button
          className="bot-demo-reset-btn"
          onClick={clearChat}
          title="Начать заново"
          aria-label="Начать заново"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>

      {/* Быстрые подсказки */}
      {config.quickPrompts?.length > 0 && (
        <div className="bot-demo-quick-prompts">
          {config.quickPrompts.map((prompt, i) => (
            <button
              key={i}
              className="bot-demo-quick-btn"
              onClick={() => setInputValue(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Лента сообщений */}
      <div className="bot-demo-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={[
              'bot-demo-message',
              msg.role === 'user' ? 'is-user' : 'is-bot',
              msg.isError ? 'is-error' : '',
              msg.isFinal ? 'is-final' : ''
            ].filter(Boolean).join(' ')}
          >
            <div
              className="bot-demo-bubble"
              style={msg.role === 'user' ? {
                whiteSpace: 'nowrap',
                overflowWrap: 'normal',
                wordBreak: 'normal',
                hyphens: 'none'
              } : {}}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                    h1: ({ node, ...props }) => <strong {...props} />,
                    h2: ({ node, ...props }) => <strong {...props} />,
                    h3: ({ node, ...props }) => <strong {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {/* Индикатор печати */}
        {isLoading && (
          <div className="bot-demo-message is-bot">
            <div className="bot-demo-bubble">
              <div className="bot-demo-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="bot-demo-input-row">
        <textarea
          className="bot-demo-input"
          placeholder="Напишите сообщение..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="2"
          disabled={isLoading}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <button
          className="bot-demo-send-btn"
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          aria-label="Отправить"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Подвал с дисклеймером */}
      {config.disclaimer && (
        <div className="bot-demo-footer">
          <p className="bot-demo-disclaimer">{config.disclaimer}</p>
          <a
            href="https://t.me/eth1r"
            target="_blank"
            rel="noopener noreferrer"
            className="bot-demo-footer-link"
          >
            Обсудить похожее решение →
          </a>
        </div>
      )}
    </div>
  )
}

export default ProjectBotDemoWidget
