# AI Chat Backend

FastAPI сервис для обработки сообщений чат-виджета.

## Быстрый старт

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Настройка

Создайте `.env` файл:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите ваш OpenAI API key.

### 3. Запуск

```bash
python main.py
```

Сервер запустится на `http://localhost:8000`

## API Endpoints

- `GET /` - информация о сервисе
- `GET /api/health` - проверка здоровья
- `GET /api/config` - публичная конфигурация
- `POST /api/chat` - отправка сообщения
- `DELETE /api/session/{session_id}` - очистка сессии

## Конфигурация

Все настройки через переменные окружения в `.env`:

### Обязательные:
- `OPENAI_API_KEY` - ключ OpenAI API

### Опциональные:
- `OPENAI_MODEL` - модель (по умолчанию gpt-4o-mini)
- `OPENAI_TIMEOUT` - таймаут запросов в секундах (по умолчанию 30)
- `SYSTEM_PROMPT` - системный промпт для ассистента
- `WELCOME_MESSAGE` - приветственное сообщение
- `MANAGER_CONTACT` - ссылка на менеджера

### Для работы с базой знаний (Assistants API):
- `OPENAI_ASSISTANT_ID` - ID assistant из OpenAI Platform (формат: asst_...)
- `VECTOR_STORE_ID` - ID vector store из OpenAI Platform (формат: vs_...)

**Важно**: Если `OPENAI_ASSISTANT_ID` указан, backend автоматически использует Assistants API с базой знаний. Если не указан — работает стандартный Chat Completions API.

## Docker

```bash
docker build -t ai-chat-backend .
docker run -p 8000:8000 --env-file .env ai-chat-backend
```

## Подключение базы знаний

Backend поддерживает два режима работы:

1. **Стандартный режим** (без базы знаний):
   - Используется Chat Completions API
   - Быстрые ответы
   - Работает на основе system prompt

2. **Режим с базой знаний** (Assistants API):
   - Используется Assistants API + Vector Store
   - Ассистент отвечает на основе загруженных документов
   - Автоматический поиск по базе знаний

Для подключения базы знаний см. [KNOWLEDGE_BASE_SETUP.md](./KNOWLEDGE_BASE_SETUP.md)

## Логирование

Backend логирует:
- Session ID
- Длину сообщений
- Время ответа
- Используемую модель/assistant
- Количество токенов (для Chat Completions)
- Все ошибки с деталями

Просмотр логов:
```bash
docker compose logs -f chat-backend
```
