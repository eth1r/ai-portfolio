# AI Chat Widget - Быстрый старт

## Что добавлено

✅ Чат-виджет в правом нижнем углу сайта
✅ Python FastAPI backend для обработки сообщений
✅ Интеграция с OpenAI API
✅ Сохранение истории диалога в рамках сессии
✅ Rate limiting и защита от спама
✅ Адаптивный дизайн (desktop + mobile)

## Запуск за 3 шага

### 1. Создайте backend/.env

```bash
cd backend
cp .env.example .env
```

Откройте `backend/.env` и вставьте ваш OpenAI API key:

```env
OPENAI_API_KEY=sk-ваш-ключ-здесь
```

### 2. Запустите проект

```bash
# Из корня проекта
docker-compose up -d --build
```

### 3. Проверьте

- Сайт: http://localhost:8081
- Backend API: http://localhost:8000/api/health
- Виджет: кнопка чата в правом нижнем углу

## Настройка ассистента

Отредактируйте `backend/.env`:

```env
# Ваш промпт
SYSTEM_PROMPT=Ты — AI-ассистент первой линии поддержки...

# Приветствие
WELCOME_MESSAGE=Здравствуйте! Чем могу помочь?

# Контакт менеджера
MANAGER_CONTACT=https://t.me/eth1r

# Модель
OPENAI_MODEL=gpt-4o-mini
```

После изменений:
```bash
docker-compose restart chat-backend
```

## Подключение базы знаний

Для RAG/векторного поиска см. раздел "Подключение базы знаний" в `AI_CHAT_SETUP.md`

## Файлы

**Frontend:**
- `src/components/ChatWidget.jsx` - компонент виджета
- `src/components/ChatWidget.css` - стили

**Backend:**
- `backend/main.py` - FastAPI сервер
- `backend/requirements.txt` - зависимости
- `backend/.env` - конфигурация (создать вручную)

**Docker:**
- `docker-compose.yml` - обновлен (добавлен chat-backend)
- `Dockerfile` - обновлен (API proxy)

Полная документация: `AI_CHAT_SETUP.md`
