# Деплой сайта с AI Chat Widget

## Перед деплоем

### 1. Создайте backend/.env на сервере

```bash
ssh root@${DEPLOY_SERVER:-your.server.ip}
cd ~/ai_portfolio
nano backend/.env
```

Вставьте:

```env
OPENAI_API_KEY=sk-ваш-ключ-здесь
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=30

# Для работы с базой знаний (Assistants API)
OPENAI_ASSISTANT_ID=asst_ваш_assistant_id
VECTOR_STORE_ID=vs_ваш_vector_store_id

# System prompt (используется только если НЕ указан OPENAI_ASSISTANT_ID)
SYSTEM_PROMPT=Ты — AI-ассистент первой линии поддержки по ростовым куклам и комплектующим. Твоя задача: отвечать на вопросы клиентов о продукции, помогать с выбором кукол и комплектующих, предоставлять информацию о характеристиках и ценах. Будь вежливым и профессиональным. Если вопрос выходит за рамки твоих знаний или требует личной консультации, предложи связаться с менеджером.

WELCOME_MESSAGE=Здравствуйте! Я AI-ассистент.\n\nОтвечаю на вопросы по базе знаний о ростовых куклах и комплектующих. Если потребуется личная консультация, направлю к менеджеру.\n\nЧем могу помочь?

MANAGER_CONTACT=https://t.me/eth1r
```

**Важно**: 
- Если `OPENAI_ASSISTANT_ID` указан - backend использует Assistants API с базой знаний
- Если не указан - backend использует Chat Completions API
- System prompt для Assistants API настраивается в OpenAI Dashboard, а не в `.env`

Сохраните: Ctrl+O, Enter, Ctrl+X

### 2. Синхронизируйте файлы

```bash
# Локально
bash deploy.sh
```

Или вручную:

```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
  ./ root@${DEPLOY_SERVER:-your.server.ip}:~/ai_portfolio/
```

### 3. Запустите на сервере

```bash
ssh root@${DEPLOY_SERVER:-your.server.ip}
cd ~/ai_portfolio

# Остановите старые контейнеры
docker compose down

# Запустите с новым backend
docker compose up -d --build
```

### 4. Проверьте статус

```bash
# Проверка контейнеров
docker compose ps

# Должны быть запущены:
# - ai_portfolio (frontend)
# - chat-backend (backend)

# Проверка логов backend
docker compose logs -f chat-backend

# В логах при старте должно быть:
# INFO: Started server process
# INFO: Application startup complete.

# При первом сообщении должно быть:
# INFO: Using Assistants API with assistant_id: asst_...
# INFO: New thread created: thread_...

# Проверка логов frontend
docker compose logs -f ai-portfolio
```

### 5. Проверьте работу

- Откройте: https://portfolio.aiworker43.ru
- Нажмите на кнопку чата в правом нижнем углу
- Отправьте тестовое сообщение
- Проверьте, что ответ приходит

### 6. Проверьте API напрямую

```bash
# На сервере
curl http://localhost:8000/api/health

# Должен вернуть:
# {"status":"healthy","openai_configured":true}

# Тест чата
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Привет","session_id":"test123"}'
```

## Troubleshooting

### Backend не запускается

```bash
# Проверьте логи
docker compose logs chat-backend

# Частые проблемы:
# - Нет backend/.env файла
# - Неправильный OPENAI_API_KEY
# - Порт 8000 занят
```

### Виджет не появляется

```bash
# Проверьте, что frontend собрался с виджетом
docker compose logs ai-portfolio | grep ChatWidget

# Откройте консоль браузера (F12) и проверьте ошибки
```

### API запросы не проходят

```bash
# Проверьте nginx конфигурацию
docker compose exec ai-portfolio cat /etc/nginx/conf.d/default.conf

# Должна быть секция:
# location /api/ {
#     proxy_pass http://chat-backend:8000/api/;
#     ...
# }
```

### Ошибка "OpenAI API not configured"

```bash
# Проверьте, что backend/.env существует и содержит ключ
docker compose exec chat-backend env | grep OPENAI_API_KEY

# Если пусто - создайте backend/.env и перезапустите
docker compose restart chat-backend
```

## Мониторинг

### Просмотр логов в реальном времени

```bash
# Backend
docker compose logs -f chat-backend

# Frontend
docker compose logs -f ai-portfolio

# Оба
docker compose logs -f
```

### Проверка использования ресурсов

```bash
docker stats
```

## Обновление настроек без пересборки

Если нужно изменить только настройки (prompt, модель, контакты):

```bash
# Отредактируйте backend/.env
nano backend/.env

# Перезапустите только backend (без пересборки)
docker compose restart chat-backend

# Изменения применятся за 2-3 секунды
```

Дата: 2026-03-26
