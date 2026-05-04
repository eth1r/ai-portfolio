# Deploy Onboarding Coach to Production

Инструкция по деплою AI-наставника для онбординга на production сервер.

## Предварительные требования

- SSH доступ к серверу (130.49.151.250)
- Docker и docker-compose установлены
- Репозитории ai-portfolio и DevStandart-Coach на сервере

## Шаг 1: Подготовка DevStandart-Coach на сервере

```bash
# Подключаемся к серверу
ssh user@130.49.151.250

# Переходим в директорию проектов
cd /opt/apps

# Клонируем или обновляем репозиторий DevStandart-Coach
git clone https://github.com/eth1r/DevStandart-Coach.git
# или если уже есть:
cd DevStandart-Coach
git pull origin main

# Создаём .env файл
cp .env.example .env
nano .env
```

### Заполнить .env:

```env
OPENAI_API_KEY=sk-your-real-key-here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
TRAINING_TOPIC=Регламент работы команды
TRAINING_MATERIAL=Команда использует асинхронную коммуникацию по умолчанию. Все задачи фиксируются в трекере. Блокеры нужно эскалировать в течение 30 минут. Перед релизом обязательны code review, зеленые тесты и запись в changelog.
QUIZ_QUESTION_COUNT=5
WEB_DEMO_WRITE_TO_DB=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/onboarding
BOT_TOKEN=not_needed_for_web_api
```

## Шаг 2: Собрать образ onboarding-coach

```bash
cd /opt/apps/DevStandart-Coach
docker build -f Dockerfile.web -t onboarding-coach:latest .
```

## Шаг 3: Обновить ai-portfolio на сервере

```bash
cd /opt/apps/ai_portfolio
git pull origin main
```

## Шаг 4: Создать onboarding-coach.env

```bash
cd /opt/apps/ai_portfolio
cp onboarding-coach.env.example onboarding-coach.env
nano onboarding-coach.env
```

Заполнить реальными значениями (можно скопировать из `/opt/apps/DevStandart-Coach/.env`).

## Шаг 5: Поднять сервисы

```bash
cd /opt/apps/ai_portfolio

# Остановить старые контейнеры (если нужно)
docker compose down

# Поднять все сервисы включая onboarding-coach
docker compose up -d --build
```

## Шаг 6: Проверить статус контейнеров

```bash
docker ps | grep -E "ai_portfolio|ai_chat_backend|return_bot|onboarding_coach"
```

Ожидаемый вывод:
```
CONTAINER ID   IMAGE                    STATUS         PORTS                  NAMES
xxxxx          ai-portfolio_ai-portfolio   Up 2 minutes   0.0.0.0:8081->80/tcp   ai_portfolio
xxxxx          ai-portfolio_chat-backend   Up 2 minutes   0.0.0.0:8001->8000/tcp ai_chat_backend
xxxxx          return-bot:latest           Up 2 minutes                          return_bot
xxxxx          onboarding-coach:latest     Up 2 minutes                          onboarding_coach
```

## Шаг 7: Проверить логи

```bash
# Логи onboarding-coach
docker logs onboarding_coach --tail 50

# Логи ai_portfolio (nginx)
docker logs ai_portfolio --tail 50
```

## Шаг 8: Проверить endpoints

```bash
# Health check
curl http://localhost:8081/api/onboarding-coach/health

# Через production домен
curl https://portfolio.aiworker43.ru/api/onboarding-coach/health
```

Ожидаемый ответ:
```json
{"status":"ok","service":"onboarding-coach-web-api"}
```

## Шаг 9: Тестовый chat запрос

```bash
curl -X POST https://portfolio.aiworker43.ru/api/onboarding-coach/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_deploy_123",
    "message": "Хочу пройти обучение"
  }'
```

## Шаг 10: Проверить страницу кейса

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
- ✅ Reset работает

## Troubleshooting

### Проблема: onboarding_coach не запускается

**Проверить:**
```bash
docker logs onboarding_coach
```

**Возможные причины:**
- Неправильный OPENAI_API_KEY
- Отсутствует onboarding-coach.env
- Образ не собран

**Решение:**
```bash
# Пересобрать образ
cd /opt/apps/DevStandart-Coach
docker build -f Dockerfile.web -t onboarding-coach:latest .

# Проверить env
cat /opt/apps/ai_portfolio/onboarding-coach.env

# Перезапустить
cd /opt/apps/ai_portfolio
docker compose restart onboarding-coach
```

### Проблема: 502 Bad Gateway на /api/onboarding-coach/

**Проверить:**
```bash
# Контейнер запущен?
docker ps | grep onboarding_coach

# Healthcheck проходит?
docker inspect onboarding_coach | grep -A 10 Health
```

**Решение:**
```bash
# Проверить внутреннюю связность
docker exec ai_portfolio curl http://onboarding-coach:8000/api/onboarding-coach/health
```

### Проблема: Demo пишет в БД

**Проверить:**
```bash
grep WEB_DEMO_WRITE_TO_DB /opt/apps/ai_portfolio/onboarding-coach.env
```

Должно быть: `WEB_DEMO_WRITE_TO_DB=false`

### Проблема: return-bot или chat-backend сломались

**Проверить:**
```bash
docker ps -a | grep -E "return_bot|chat_backend"
docker logs return_bot --tail 20
docker logs ai_chat_backend --tail 20
```

**Решение:**
```bash
docker compose restart return-bot
docker compose restart chat-backend
```

## Откат изменений

Если что-то пошло не так:

```bash
cd /opt/apps/ai_portfolio

# Остановить onboarding-coach
docker compose stop onboarding-coach

# Удалить контейнер
docker compose rm -f onboarding-coach

# Вернуться к предыдущей версии docker-compose.yml
git checkout HEAD~1 docker-compose.yml Dockerfile

# Перезапустить остальные сервисы
docker compose up -d
```

## Мониторинг

### Проверка здоровья сервисов

```bash
# Все контейнеры
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Health checks
curl https://portfolio.aiworker43.ru/api/health
curl https://portfolio.aiworker43.ru/api/return-bot/health
curl https://portfolio.aiworker43.ru/api/onboarding-coach/health
```

### Логи в реальном времени

```bash
docker logs -f onboarding_coach
```

### Использование ресурсов

```bash
docker stats onboarding_coach
```

## Обновление в будущем

```bash
# 1. Обновить код
cd /opt/apps/DevStandart-Coach
git pull origin main

# 2. Пересобрать образ
docker build -f Dockerfile.web -t onboarding-coach:latest .

# 3. Перезапустить сервис
cd /opt/apps/ai_portfolio
docker compose up -d --no-deps --build onboarding-coach

# 4. Проверить
curl https://portfolio.aiworker43.ru/api/onboarding-coach/health
```

## Контакты

- **GitHub ai-portfolio:** https://github.com/eth1r/ai-portfolio
- **GitHub DevStandart-Coach:** https://github.com/eth1r/DevStandart-Coach
- **Production:** https://portfolio.aiworker43.ru
- **Telegram:** https://t.me/eth1r
