import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatWidget.css'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [config, setConfig] = useState(null)
  const messagesEndRef = useRef(null)

  const MAX_MESSAGE_LENGTH = 2000

  // API URL (в продакшене будет проксироваться через nginx)
  const API_URL = import.meta.env.VITE_API_URL || '/api'

  // Загрузка конфигурации и инициализация
  useEffect(() => {
    // Загружаем конфигурацию виджета
    fetch(`${API_URL}/config`)
      .then(res => res.json())
      .then(data => {
        setConfig(data)
        // Добавляем приветственное сообщение
        if (data.welcome_message) {
          setMessages([{
            role: 'assistant',
            content: data.welcome_message,
            timestamp: new Date()
          }])
        }
      })
      .catch(err => {
        console.error('Failed to load chat config:', err)
        setMessages([{
          role: 'assistant',
          content: 'Здравствуйте! Я AI-ассистент. Чем могу помочь?',
          timestamp: new Date()
        }])
      })

    // Загружаем или создаем session_id
    let storedSessionId = localStorage.getItem('chat_session_id')
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('chat_session_id', storedSessionId)
    }
    setSessionId(storedSessionId)

    // Загружаем историю сообщений из localStorage
    const storedMessages = localStorage.getItem('chat_messages')
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages)
        if (parsed.length > 1) { // Если есть сообщения кроме приветствия
          setMessages(parsed)
        }
      } catch (e) {
        console.error('Failed to parse stored messages:', e)
      }
    }
  }, [])

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Сохранение истории в localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages))
    }
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

    // Timeout для запроса (35 секунд)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 35000)

    try {
      const response = await fetch(`${API_URL}/chat`, {
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
        
        // Специальная обработка для разных типов ошибок
        if (response.status === 429) {
          throw new Error('Слишком много запросов. Подождите немного.')
        } else if (response.status === 504) {
          throw new Error('Ассистент не успел ответить. Попробуйте переформулировать вопрос короче или напишите менеджеру.')
        } else if (response.status === 503) {
          throw new Error('Сервис временно недоступен. Напишите напрямую менеджеру.')
        }
        
        throw new Error(error.detail || 'Не удалось отправить сообщение')
      }

      const data = await response.json()

      // Добавляем ответ ассистента
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      // Обновляем session_id если получили новый
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id)
        localStorage.setItem('chat_session_id', data.session_id)
      }

    } catch (error) {
      clearTimeout(timeoutId)
      
      let errorText = 'Извините, произошла ошибка. '
      
      if (error.name === 'AbortError') {
        errorText = 'Ассистент не успел ответить за 35 секунд. Попробуйте переформулировать вопрос короче или напишите менеджеру напрямую.'
      } else if (error.message) {
        errorText = error.message
      } else {
        errorText += 'Попробуйте еще раз или напишите напрямую менеджеру.'
      }
      
      console.error('Chat error:', error)
      
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

  const clearChat = () => {
    if (confirm('Очистить историю чата?')) {
      const welcomeMsg = messages[0]
      setMessages([welcomeMsg])
      localStorage.removeItem('chat_messages')
      
      // Создаем новую сессию
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      localStorage.setItem('chat_session_id', newSessionId)
    }
  }

  return (
    <>
      {/* Кнопка открытия чата */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Открыть чат"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Окно чата */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-avatar">AI</div>
              <div className="chat-header-text">
                <div className="chat-header-title">AI-ассистент</div>
                <div className="chat-header-status">Онлайн</div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-action-btn"
                onClick={clearChat}
                title="Очистить историю"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button
                className="chat-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть чат"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'} ${msg.isError ? 'error-message' : ''}`}
              >
                <div className="message-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Кастомизация ссылок
                      a: ({node, ...props}) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                      // Отключаем заголовки, списки и другие элементы для простоты
                      h1: ({node, ...props}) => <strong {...props} />,
                      h2: ({node, ...props}) => <strong {...props} />,
                      h3: ({node, ...props}) => <strong {...props} />,
                      h4: ({node, ...props}) => <strong {...props} />,
                      h5: ({node, ...props}) => <strong {...props} />,
                      h6: ({node, ...props}) => <strong {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Напишите сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
              disabled={isLoading}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <button
              className="chat-send-btn"
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
          {inputValue.length > MAX_MESSAGE_LENGTH * 0.9 && (
            <div className="chat-input-warning">
              {inputValue.length}/{MAX_MESSAGE_LENGTH} символов
            </div>
          )}

          {config?.manager_contact && (
            <div className="chat-footer">
              <a href={config.manager_contact} target="_blank" rel="noopener noreferrer" className="chat-footer-link">
                Написать менеджеру →
              </a>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ChatWidget
