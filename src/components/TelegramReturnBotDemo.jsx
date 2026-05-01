import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './TelegramReturnBotDemo.css'

function TelegramReturnBotDemo() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  const MAX_MESSAGE_LENGTH = 2000

  // API URL для демо-режима
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Быстрые подсказки
  const quickPrompts = [
    'Хочу оформить возврат товара',
    'Товар пришёл с браком',
    'Хочу вернуть заказ ORD-12345',
    'Экран не работает, хочу сделать возврат'
  ]

  // Инициализация
  useEffect(() => {
    // Приветственное сообщение
    setMessages([{
      role: 'assistant',
      content: 'Здравствуйте! Я демо-бот по возвратам.\n\nНапишите, что хотите оформить возврат, и я начну собирать данные по сценарию.\n\n⚠️ Это демонстрационный режим. Заявки из этого виджета не отправляются реальному оператору.',
      timestamp: new Date()
    }])

    // Создаем session_id для демо
    const demoSessionId = `demo_return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(demoSessionId)
  }, [])

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Добавляем сообщение пользователя
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    // Timeout для запроса
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000)

    try {
      const response = await fetch(`${API_URL}/demo/telegram-return-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        
        if (response.status === 429) {
          throw new Error('Слишком много запросов. Подождите немного.')
        } else if (response.status === 504) {
          throw new Error('Бот не успел ответить. Попробуйте переформулировать вопрос короче.')
        } else if (response.status === 503) {
          throw new Error('Демо временно недоступно. Можно посмотреть код проекта на GitHub или написать мне в Telegram.')
        }
        
        throw new Error(error.detail || 'Не удалось отправить сообщение')
      }

      const data = await response.json()

      // Добавляем ответ бота
      const botMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        is_final: data.is_final || false
      }
      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      clearTimeout(timeoutId)
      
      let errorText = 'Извините, произошла ошибка. '
      
      if (error.name === 'AbortError') {
        errorText = 'Бот не успел ответить за 35 секунд. Попробуйте переформулировать вопрос короче.'
      } else if (error.message) {
        errorText = error.message
      } else {
        errorText += 'Попробуйте еще раз.'
      }
      
      console.error('Demo bot error:', error)
      
      // Добавляем сообщение об ошибке
      const errorMessage = {
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQuickPrompt = (prompt) => {
    setInputValue(prompt)
  }

  const clearChat = () => {
    const welcomeMsg = messages[0]
    setMessages([welcomeMsg])
    
    // Создаем новую сессию
    const newSessionId = `demo_return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
  }

  return (
    <div className="telegram-demo-widget">
      <div className="demo-header">
        <div className="demo-header-content">
          <div className="demo-avatar">🤖</div>
          <div className="demo-header-text">
            <div className="demo-header-title">Демо-бот по возвратам</div>
            <div className="demo-header-subtitle">Это демонстрация сценария возврата</div>
          </div>
        </div>
        <button
          className="demo-clear-btn"
          onClick={clearChat}
          title="Начать заново"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>

      <div className="demo-quick-prompts">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isLoading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="demo-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`demo-message ${msg.role === 'user' ? 'user-message' : 'bot-message'} ${msg.isError ? 'error-message' : ''}`}
          >
            <div className="message-content" style={msg.role === 'user' ? {
              whiteSpace: 'nowrap',
              overflowWrap: 'normal',
              wordBreak: 'normal',
              hyphens: 'none'
            } : {}}>
              {msg.role === 'user' ? (
                // Простой текст без всяких оберток
                msg.content
              ) : (
                // Для сообщений бота используем ReactMarkdown
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({node, ...props}) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                    h1: ({node, ...props}) => <strong {...props} />,
                    h2: ({node, ...props}) => <strong {...props} />,
                    h3: ({node, ...props}) => <strong {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="demo-message bot-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="demo-input-container">
        <textarea
          className="demo-input"
          placeholder="Напишите сообщение..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="2"
          disabled={isLoading}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <button
          className="demo-send-btn"
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

      <div className="demo-footer">
        <p className="demo-footer-note">
          ⚠️ Это демонстрационный режим. Заявки не отправляются реальному оператору.
        </p>
        <a href="https://t.me/eth1r" target="_blank" rel="noopener noreferrer" className="demo-footer-link">
          Обсудить похожее решение →
        </a>
      </div>
    </div>
  )
}

export default TelegramReturnBotDemo
