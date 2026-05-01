# Интеграция Assistants API - Завершено

## Статус: ✅ Работает

Backend чата успешно интегрирован с OpenAI Assistants API и Vector Store.

## Что было сделано

### 1. Backend обновлён для поддержки Assistants API
- Добавлена поддержка двух режимов работы:
  - **Assistants API** (если `OPENAI_ASSISTANT_ID` указан) - с базой знаний через Vector Store
  - **Chat Completions API** (если не указан) - без базы знаний
- Автоматическое создание threads для каждой сессии
- Обработка timeout, статусов failed/cancelled
- Полное логирование: session_id, assistant_id, время ответа

### 2. Исправлена проблема с падением контейнера
**Проблема:** `TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`

**Решение:**
- Обновлены зависимости в `backend/requirements.txt`:
  ```
  openai>=1.55,<2
  httpx>=0.28,<0.29
  python-dotenv>=1.0
  ```
- Исправлена инициализация OpenAI клиента в `backend/main.py`:
  ```python
  client = OpenAI(
      api_key=OPENAI_API_KEY,
      timeout=OPENAI_TIMEOUT
  )
  ```

### 3. Исправлен healthcheck
**Проблема:** В контейнере отсутствовал `curl`

**Решение:** Добавлена установка curl в `backend/Dockerfile`:
```dockerfile
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

### 4. Настроен SSH без пароля
**Проблема:** SSH запрашивал пароль при каждом подключении

**Решение:**
- Добавлен локальный SSH ключ в `/root/.ssh/authorized_keys` на сервере
- Установлены правильные права: `chmod 700 /root/.ssh && chmod 600 /root/.ssh/authorized_keys`
- Теперь `deploy.sh` работает полностью автоматически без запроса пароля

## Конфигурация

### Backend Environment Variables (`backend/.env`)
```env
OPENAI_API_KEY=sk-proj-...
OPENAI_ASSISTANT_ID=your_assistant_id_here
VECTOR_STORE_ID=your_vector_store_id_here
```

### Docker Compose
- Backend работает на порту **8001** (8000 занят web-sentry)
- Frontend на порту **8081**
- Healthcheck проверяет `/api/health` каждые 30 секунд

## Проверка работы

### 1. Статус контейнеров
```bash
ssh root@${DEPLOY_SERVER:-your.server.ip} "cd ~/ai_portfolio && docker compose ps"
```
Должно показать `(healthy)` для `ai_chat_backend`

### 2. Проверка API
```bash
ssh root@${DEPLOY_SERVER:-your.server.ip} "curl -s http://localhost:8001/api/health"
```
Ответ: `{"status":"healthy","openai_configured":true}`

### 3. Логи backend
```bash
ssh root@${DEPLOY_SERVER:-your.server.ip} "cd ~/ai_portfolio && docker compose logs -f chat-backend"
```

### 4. Тест чата на сайте
Откройте https://portfolio.aiworker43.ru и протестируйте чат-виджет в правом нижнем углу.

## Деплой

Деплой теперь работает полностью автоматически:
```bash
bash deploy.sh
```

Скрипт:
1. Синхронизирует файлы через rsync
2. Синхронизирует `backend/.env`
3. Пересобирает и перезапускает контейнеры
4. Показывает статус

**Пароль НЕ запрашивается!**

## Файлы

- `backend/main.py` - FastAPI сервер с Assistants API
- `backend/requirements.txt` - зависимости (openai 1.55+, httpx 0.28+)
- `backend/Dockerfile` - Docker образ с curl
- `backend/.env` - конфигурация (не в git)
- `docker-compose.yml` - конфигурация контейнеров
- `deploy.sh` - скрипт автоматического деплоя

## Дата завершения
26 марта 2026
