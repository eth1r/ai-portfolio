# AI Chat Widget - Инструкция по настройке

## Архитектура решения

### Стек
- **Frontend**: React компонент `ChatWidget.jsx`
- **Backend**: Python FastAPI сервис
- **Deployment**: Docker Compose (2 контейнера)
- **API**: OpenAI GPT-4o-mini

### Как это работает
1. Пользователь открывает виджет в правом нижнем углу
2. Сообщение отправляется на `/api/chat` (проксируется через Nginx)
3. Backend обрабатывает запрос и обращается к OpenAI API
4. Ответ возвращается в виджет
5. История диалога сохраняется в рамках сессии

## Структура файлов

### Frontend
- `src/components/ChatWidget.jsx` - компонент виджета
- `src/components/ChatWidget.css` - стили виджета
- `src/App.jsx` - интеграция виджета в приложение

### Backend
- `backend/main.py` - FastAPI сервер
- `backend/requirements.txt` - Python зависимости
- `backend/Dockerfile` - Docker образ для backend
- `backend/.env.example` - пример конфигурации
- `backend/.env` - реальная конфигурация (создать вручную)

### Docker
- `docker-compose.yml` - оркестрация контейнеров
- `Dockerfile` - обновлен для проксирования API

## Быстрый старт

### 1. Настройка Backend

Создайте файл `backend/.env` на основе `backend/.env.example`:

```bash
cd backend
cp .env.example .env
```

Отредактируйте `backend/.env` и укажите ваш OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
```

### 2. Локальная разработка

#### Запуск backend отдельно:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend будет доступен на `http://localhost:8000`

#### Запуск frontend:
```bash
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:3000`


### 3. Продакшен (Docker)

```bash
# Убедитесь, что backend/.env создан и содержит OPENAI_API_KEY
docker-compose up -d --build
```

Сайт будет доступен на порту 8081, backend на 8000.

## Настройка AI-ассистента

### System Prompt

Отредактируйте `backend/.env`:

```env
SYSTEM_PROMPT=Ты — AI-ассистент первой линии поддержки по ростовым куклам и комплектующим. [ваш промпт]
```

### Модель OpenAI

```env
OPENAI_MODEL=gpt-4o-mini
# или
OPENAI_MODEL=gpt-4o
```

### Приветственное сообщение

```env
WELCOME_MESSAGE=Здравствуйте! Я AI-ассистент. Чем могу помочь?
```

### Контакт менеджера

```env
MANAGER_CONTACT=https://t.me/eth1r
```

## Подключение базы знаний

Для подключения векторной базы знаний (RAG):

1. Откройте `backend/main.py`
2. Найдите секцию с OpenAI клиентом
3. Добавьте инициализацию vector store:

```python
# Пример с OpenAI Assistants API
assistant = client.beta.assistants.create(
    name="Support Assistant",
    instructions=SYSTEM_PROMPT,
    model=OPENAI_MODEL,
    tools=[{"type": "file_search"}]
)
```

4. Обновите эндпоинт `/api/chat` для использования assistant вместо chat.completions

Подробнее: https://platform.openai.com/docs/assistants/tools/file-search

## API Endpoints

### GET /api/health
Проверка статуса backend

### GET /api/config
Получение публичной конфигурации (приветствие, контакт менеджера)

### POST /api/chat
Отправка сообщения

Request:
```json
{
  "message": "Ваш вопрос",
  "session_id": "optional_session_id"
}
```

Response:
```json
{
  "response": "Ответ ассистента",
  "session_id": "session_id"
}
```

### DELETE /api/session/{session_id}
Очистка сессии

## Безопасность

### Реализованная защита:
- ✅ API key хранится только на backend
- ✅ Rate limiting (20 запросов в минуту на сессию)
- ✅ Валидация длины сообщений (макс 2000 символов)
- ✅ Обработка ошибок без падения сервиса
- ✅ CORS настроен

### Рекомендации для продакшена:
- Укажите конкретный домен в CORS вместо "*"
- Используйте Redis для хранения сессий вместо памяти
- Добавьте мониторинг и алерты
- Настройте логирование в файл

## Тестирование

### Проверка backend:
```bash
curl http://localhost:8000/api/health
```

### Проверка чата:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет", "session_id": "test123"}'
```

## Troubleshooting

### Виджет не появляется
- Проверьте консоль браузера на ошибки
- Убедитесь, что `ChatWidget` импортирован в `App.jsx`

### Backend не отвечает
- Проверьте логи: `docker-compose logs chat-backend`
- Убедитесь, что `backend/.env` создан и содержит `OPENAI_API_KEY`

### Ошибка "OpenAI API not configured"
- Проверьте, что `OPENAI_API_KEY` установлен в `backend/.env`
- Перезапустите контейнер: `docker-compose restart chat-backend`

### Ошибка CORS
- Убедитесь, что frontend обращается к `/api/chat`, а не напрямую к `http://localhost:8000`

## Масштабирование

Для продакшена с высокой нагрузкой:

1. Замените in-memory хранилище на Redis
2. Добавьте кеширование частых вопросов
3. Настройте горизонтальное масштабирование backend
4. Добавьте мониторинг (Prometheus + Grafana)
5. Настройте логирование в ELK/Loki

Дата: 2026-03-26
