# Инструкция по деплою кейса "Telegram Return Bot"

## Быстрый деплой

### 1. Подготовка на локальной машине

```bash
# Убедиться что build проходит
npm run build

# Проверить что все файлы на месте
ls src/components/TelegramReturnBotDemo.*
ls projects.json
```

### 2. Деплой на сервер

```bash
# Подключиться к серверу
ssh root@${DEPLOY_SERVER:-your.server.ip}

# Перейти в директорию проекта
cd /var/www/portfolio

# Сохранить текущую версию (на всякий случай)
git stash

# Получить изменения
git pull origin main

# Установить зависимости (если нужно)
npm install

# Собрать проект
npm run build

# Перезапустить nginx
sudo systemctl restart nginx

# Проверить статус
sudo systemctl status nginx
```

### 3. Проверка backend

```bash
# Перейти в директорию backend
cd /var/www/portfolio/backend

# Проверить что .env содержит OPENAI_API_KEY
cat .env | grep OPENAI_API_KEY

# Перезапустить backend
sudo systemctl restart portfolio-backend

# Проверить статус
sudo systemctl status portfolio-backend

# Проверить логи
sudo journalctl -u portfolio-backend -f
```

### 4. Проверка работы

Открыть в браузере:
1. http://${DEPLOY_SERVER:-your.server.ip}:8081/ - главная страница
2. http://${DEPLOY_SERVER:-your.server.ip}:8081/cases - все кейсы
3. http://${DEPLOY_SERVER:-your.server.ip}:8081/cases/telegram-return-bot - детальная страница
4. Прокрутить к секции "Попробовать демо"
5. Нажать на быструю подсказку или написать сообщение
6. Проверить что бот отвечает

### 5. Тестирование демо-виджета

**Сценарий 1: Быстрая подсказка**
1. Нажать "Хочу оформить возврат товара"
2. Бот должен начать собирать данные
3. Ответить на вопросы бота
4. В конце должно появиться demo-сообщение

**Сценарий 2: Свободный текст**
1. Написать: "Товар пришёл с браком, хочу вернуть"
2. Бот должен извлечь информацию и запросить недостающие данные
3. Продолжить диалог
4. Проверить финальное demo-сообщение

**Сценарий 3: Очистка диалога**
1. Начать диалог
2. Нажать кнопку "Начать заново" (иконка обновления)
3. История должна очиститься
4. Должно появиться приветственное сообщение

## Проверка API

### Healthcheck
```bash
curl http://${DEPLOY_SERVER:-your.server.ip}:8081/api/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "openai_configured": true
}
```

### Тест демо-endpoint
```bash
curl -X POST http://${DEPLOY_SERVER:-your.server.ip}:8081/api/demo/telegram-return-bot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Хочу оформить возврат товара",
    "session_id": "test_session_123"
  }'
```

Ожидаемый ответ:
```json
{
  "response": "Здравствуйте! Помогу вам оформить возврат...",
  "session_id": "test_session_123"
}
```

## Возможные проблемы

### Проблема: 503 Service Unavailable
**Причина**: Backend не запущен или не отвечает

**Решение**:
```bash
sudo systemctl status portfolio-backend
sudo systemctl restart portfolio-backend
sudo journalctl -u portfolio-backend -n 50
```

### Проблема: Демо не отвечает
**Причина**: Нет OPENAI_API_KEY

**Решение**:
```bash
cd /var/www/portfolio/backend
nano .env
# Добавить: OPENAI_API_KEY=sk-...
sudo systemctl restart portfolio-backend
```

### Проблема: 404 на странице кейса
**Причина**: Не выполнен prerender

**Решение**:
```bash
cd /var/www/portfolio
npm run build
sudo systemctl restart nginx
```

### Проблема: Стили не применяются
**Причина**: Кэш браузера

**Решение**:
- Ctrl+Shift+R (жесткая перезагрузка)
- Или очистить кэш браузера

## Откат изменений (если что-то пошло не так)

```bash
cd /var/www/portfolio

# Вернуться к предыдущему коммиту
git log --oneline -5
git reset --hard <commit-hash>

# Пересобрать
npm run build

# Перезапустить
sudo systemctl restart nginx
sudo systemctl restart portfolio-backend
```

## Мониторинг

### Логи nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Логи backend
```bash
sudo journalctl -u portfolio-backend -f
```

### Проверка использования ресурсов
```bash
htop
df -h
free -h
```

## Контакты

При возникновении проблем: https://t.me/eth1r
