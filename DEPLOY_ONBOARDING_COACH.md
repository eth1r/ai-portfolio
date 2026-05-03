# Deploy Onboarding Coach to Production

Инструкции по деплою AI-наставника для онбординга на production сервер.

## Предварительные требования

- SSH доступ к серверу (130.49.151.250)
- Docker и docker-compose установлены
- Репозитории ai-portfolio и DevStandart-Coach на сервере

## Шаг 1: Подготовка DevStandart-Coach на сервере

```bash
# SSH на сервер
ssh user@130.49.151.250

# Перейти в директорию приложений
cd /opt/apps

# Клонировать или обновить репозиторий
git clone https://github.com/eth1r/DevStandart-Coach.git
# или если уже есть:
cd DevStandart-Coach
git pull origin main

# Создать .env файл
cp .env.example .env
nano .env
```

### Заполнить .env:

```env
BOT_TOKEN=not_needed_for_web_api
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/onboarding
OPENAI_API_KEY=sk-ваш-реальный-ключ
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
TRAINING_TOPIC=Регламент работы команды
TRAINING_MATERIAL=Команда использует асинхронную коммуникацию по умолчанию. Все задачи фиксируются в трекере. Блокеры нужно эскалировать в течение 30 минут. Перед релизом обязательны code review, зеленые тесты и запись в changelog.
QUIZ_QUESTION_COUNT=5
LOG_LEVEL=INFO
WEB_DEMO_WRITE_TO_DB=false
```

**ВАЖНО:** `WEB_DEMO_WRITE_TO_DB=false` — это критично для безопасности!

## Шаг 2: Собрать Docker образ

```bash
cd /opt/apps/DevStandart-Coach
docker build -f Dockerfile.web -t onboarding-coach:latest .
```

Проверить, что образ создан:
```bash
docker images | grep onboarding-coach
```

## Шаг 3: Создать env файл для docker-compose

```bash
cd /opt/apps/ai_portfolio

# Создать onboarding-coach.env
cp onboarding-coach.env.example onboarding-coach.env
nano onboarding-coach.env
```

Заполнить теми же значениями, что и в `/opt/apps/DevStandart-Coach/.env`

## Шаг 4: Обновить ai-portfolio

```bash
cd /opt/apps/ai_portfolio
git pull origin main
```

Проверить, что изменения применились:
- `Dockerfile` содержит proxy для `/api/onboarding-coach/`
- `docker-compose.yml` содержит сервис `onboarding-coach`

## Шаг 5: Пересобрать и запустить контейнеры

```bash
cd /opt/apps/ai_portfolio

# Остановить текущие контейнеры
docker compose down

# Пересобрать ai_portfolio (nginx с новым proxy)
docker compose build ai-portfolio

# Запустить все сервисы
docker compose up -d
```

## Шаг 6: Проверить статус контейнеров

```bash
docker ps

# Должны быть running:
# - ai_portfolio
# - ai_chat_backend
# - return_bot
# - onboarding_coach
```

Проверить логи:
```bash
docker logs onboarding_coach
docker logs ai_portfolio
```

## Шаг 7: Проверить endpoints

### Health check:
```bash
curl https://portfolio.aiworker43.ru/api/onboarding-coach/health
```

Ожидаемый ответ:
```json
{"status":"ok","service":"onboarding-coach-web-api"}
```

### Chat endpoint:
```bash
curl -X POST https://portfolio.aiworker43.ru/api/onboarding-coach/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_deploy_123",
    "message": "Хочу пройти обучение"
  }'
```

Ожидаемый ответ:
```json
{
  "reply": "Напишите ваше имя, чтобы начать обучение.",
  "done": false,
  "collected_data": null,
  "result_preview": null,
  "submitted_to_db": false
}
```

### Reset session:
```bash
curl -X DELETE https://portfolio.aiworker43.ru/api/onboarding-coach/session/test_deploy_123
```

Ожидаемый ответ: `204 No Content`

## Шаг 8: Проверить страницу кейса

Открыть в браузере:
```
https://portfolio.aiworker43.ru/cases/ai-onboarding-coach
```

Проверить:
- ✅ Страница загружается
- ✅ Demo widget отображается
- ✅ Quick prompts работают
- ✅ Можно отправить сообщение
- ✅ Бот отвечает
- ✅ Можно пройти сценарий обучения
- ✅ Итоговый результат отображается
- ✅ Reset работает

## Шаг 9: Проверить безопасность

Убедиться, что demo mode не пишет в БД:

```bash
# Проверить логи onboarding_coach
docker logs onboarding_coach | grep -i "demo\|db\|write"

# Проверить env
docker exec onboarding_coach env | grep WEB_DEMO_WRITE_TO_DB
```

Должно быть: `WEB_DEMO_WRITE_TO_DB=false`

## Шаг 10: Проверить существующие сервисы

Убедиться, что ничего не сломалось:

### Return bot:
```bash
curl https://portfolio.aiworker43.ru/api/return-bot/health
```

### Chat backend:
```bash
curl https://portfolio.aiworker43.ru/api/health
```

### Главная страница:
```
https://portfolio.aiworker43.ru
```

## Troubleshooting

### Проблема: onboarding_coach не запускается

**Решение:**
```bash
docker logs onboarding_coach
# Проверить ошибки в логах

# Проверить env файл
cat /opt/apps/ai_portfolio/onboarding-coach.env

# Пересобрать образ
cd /opt/apps/DevStandart-Coach
docker build -f Dockerfile.web -t onboarding-coach:latest .

# Перезапустить
cd /opt/apps/ai_portfolio
docker compose restart onboarding-coach
```

### Проблема: 502 Bad Gateway на /api/onboarding-coach/

**Причина:** nginx не может достучаться до контейнера

**Решение:**
```bash
# Проверить, что контейнер running
docker ps | grep onboarding

# Проверить сеть
docker network inspect ai_portfolio_portfolio_network

# Проверить, что onboarding-coach в сети
docker inspect onboarding_coach | grep -A 10 Networks

# Перезапустить ai_portfolio
docker compose restart ai-portfolio
```

### Проблема: 503 Service Unavailable

**Причина:** Сервис не инициализирован

**Решение:**
```bash
# Проверить логи
docker logs onboarding_coach

# Проверить OPENAI_API_KEY
docker exec onboarding_coach env | grep OPENAI_API_KEY

# Перезапустить с чистыми логами
docker compose restart onboarding-coach
docker logs -f onboarding_coach
```

### Проблема: CORS error в браузере

**Причина:** Домен не в allowed_origins

**Решение:**
Проверить `web/api.py` в DevStandart-Coach:
```python
allowed_origins = [
    "https://portfolio.aiworker43.ru",
    "http://portfolio.aiworker43.ru",
    ...
]
```

## Rollback

Если что-то пошло не так:

```bash
cd /opt/apps/ai_portfolio

# Откатить изменения
git checkout HEAD~1 Dockerfile docker-compose.yml

# Пересобрать
docker compose build ai-portfolio

# Перезапустить без onboarding-coach
docker compose up -d ai-portfolio chat-backend return-bot
```

## Мониторинг

### Проверка здоровья:
```bash
watch -n 5 'curl -s https://portfolio.aiworker43.ru/api/onboarding-coach/health | jq'
```

### Логи в реальном времени:
```bash
docker logs -f onboarding_coach
```

### Статус всех контейнеров:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Успешный деплой

После успешного деплоя должно быть:

✅ 4 контейнера running:
- ai_portfolio
- ai_chat_backend  
- return_bot
- onboarding_coach

✅ Все health checks проходят:
- /api/health
- /api/return-bot/health
- /api/onboarding-coach/health

✅ Страница кейса работает:
- https://portfolio.aiworker43.ru/cases/ai-onboarding-coach

✅ Demo mode безопасный:
- `submitted_to_db: false` в ответах
- `WEB_DEMO_WRITE_TO_DB=false` в env

✅ Существующие сервисы не сломаны:
- Главная страница загружается
- Return bot работает
- Общий чат работает
