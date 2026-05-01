# Тестирование Assistants API после деплоя

## Быстрая проверка

### 1. Проверьте, что backend запущен

```bash
docker compose ps
```

Должен быть запущен `chat-backend`.

### 2. Проверьте логи

```bash
docker compose logs -f chat-backend
```

При старте должно быть:
```
INFO: Started server process
INFO: Waiting for application startup.
INFO: Application startup complete.
```

### 3. Откройте чат на сайте

1. Перейдите на ваш сайт
2. Нажмите на кнопку чата в правом нижнем углу
3. Отправьте тестовое сообщение

### 4. Проверьте логи после отправки

В логах должно появиться:

```
INFO: Session session_...: Processing message (length: XX)
INFO: Using Assistants API with assistant_id: your_assistant_id_here
INFO: New thread created: thread_... for session session_...
INFO: Session session_...: Response sent successfully
INFO: Assistant: your_assistant_id_here, Response time: X.XXs
```

### 5. Проверьте ответ

Ассистент должен ответить на основе базы знаний из Vector Store.

## Что проверить

### ✅ Базовая работа
- [ ] Чат открывается
- [ ] Сообщение отправляется
- [ ] Приходит ответ
- [ ] В логах `Using Assistants API`

### ✅ База знаний
- [ ] Задайте вопрос из базы знаний
- [ ] Ассистент отвечает на основе документов
- [ ] Ответ релевантен загруженным файлам

### ✅ Timeout
- [ ] Если ответ > 30 секунд, пользователь видит сообщение об ошибке
- [ ] В логах: `Assistant timeout after 30s`

### ✅ Rate limiting
- [ ] Отправьте > 20 сообщений за минуту
- [ ] Должна сработать защита: "Слишком много запросов..."

### ✅ Длина сообщения
- [ ] Попробуйте вставить текст > 2000 символов
- [ ] Должен появиться счетчик символов
- [ ] Backend вернёт ошибку при отправке

## Типичные проблемы

### Ассистент не отвечает

Проверьте логи:
```bash
docker compose logs chat-backend | grep -i error
```

Возможные причины:
- Неверный OPENAI_API_KEY
- Неверный OPENAI_ASSISTANT_ID
- Проблемы с сетью
- Превышен лимит OpenAI

### В логах "Using Chat Completions API" вместо "Using Assistants API"

Проверьте `backend/.env`:
```bash
docker compose exec chat-backend cat /app/.env | grep ASSISTANT
```

Должно быть:
```
OPENAI_ASSISTANT_ID=your_assistant_id_here
```

Если нет - добавьте и перезапустите:
```bash
docker compose restart chat-backend
```

### Медленные ответы (> 20 секунд)

Это нормально для Assistants API с File Search. Если нужно быстрее:
- Увеличьте `OPENAI_TIMEOUT` в `.env`
- Или используйте более быструю модель
- Или переключитесь на Chat Completions API (уберите OPENAI_ASSISTANT_ID)

### Ошибка "Assistant run failed"

Проверьте настройки Assistant в OpenAI Platform:
- File Search включен
- Vector Store привязан
- Модель доступна

## Мониторинг

Следите за использованием в [OpenAI Dashboard](https://platform.openai.com/usage):
- Количество запросов
- Использование токенов
- Стоимость

Assistants API с File Search стоит дороже обычного Chat API из-за поиска по документам.

## Переключение режимов

### На Chat Completions (без базы знаний):

1. Закомментируйте в `backend/.env`:
   ```env
   # OPENAI_ASSISTANT_ID=asst_...
   # VECTOR_STORE_ID=vs_...
   ```

2. Перезапустите:
   ```bash
   docker compose restart chat-backend
   ```

3. В логах должно быть: `Using Chat Completions API with model: gpt-4o-mini`

### Обратно на Assistants API:

1. Раскомментируйте в `backend/.env`
2. Перезапустите backend
3. В логах должно быть: `Using Assistants API with assistant_id`
