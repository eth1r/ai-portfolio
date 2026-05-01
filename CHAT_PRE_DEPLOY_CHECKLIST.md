# AI Chat Widget - Чек-лист перед деплоем

## ✅ Проверка 1: Подключение к базе знаний

**Текущее состояние:**
- ✅ Backend поддерживает Assistants API + Vector Store
- ✅ Автоматическое переключение между режимами
- ✅ В `.env` указаны: OPENAI_ASSISTANT_ID, VECTOR_STORE_ID

**Режимы работы:**

1. **С базой знаний** (если `OPENAI_ASSISTANT_ID` указан):
   - Используется Assistants API
   - Ассистент отвечает на основе Vector Store
   - Автоматический поиск по документам

2. **Без базы знаний** (если `OPENAI_ASSISTANT_ID` не указан):
   - Используется Chat Completions API
   - Работает на основе system prompt

**Проверка после деплоя:**
```bash
docker compose logs -f chat-backend
```

В логах должно быть:
```
Using Assistants API with assistant_id: asst_...
New thread created: thread_... for session session_...
```

Подробнее: `backend/KNOWLEDGE_BASE_SETUP.md`

---

## ✅ Проверка 2: Timeout и fallback

**Реализовано:**
- ✅ Backend timeout: 30 секунд (настраивается через `OPENAI_TIMEOUT`)
- ✅ Frontend timeout: 35 секунд
- ✅ Понятные сообщения об ошибках:
  - "Ассистент не успел ответить за 35 секунд..."
  - "Сервис временно недоступен..."
  - "Слишком много запросов..."

**Тестирование:**
```bash
# Проверьте, что при долгом ответе пользователь видит понятное сообщение
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "очень сложный вопрос"}'
```

---

## ✅ Проверка 3: Логирование

**Реализовано:**
- ✅ Логирование создания сессий
- ✅ Логирование запросов (session_id, длина сообщения)
- ✅ Логирование ответов (модель, время ответа, токены)
- ✅ Логирование ошибок (тип ошибки, session_id, время)
- ✅ Логирование rate limit превышений

**Пример логов:**
```
INFO: New session created: session_1234567890
INFO: Session session_1234567890: Processing message (length: 45)
INFO: Model: gpt-4o-mini, Response time: 2.34s, Tokens: 156
INFO: Session session_1234567890: Response sent successfully
```

**Просмотр логов:**
```bash
# Docker
docker-compose logs -f chat-backend

# Локально
python backend/main.py
```

---

## ✅ Проверка 4: Ограничение длины сообщения

**Реализовано:**
- ✅ Backend: максимум 2000 символов
- ✅ Frontend: `maxLength={2000}` на textarea
- ✅ Визуальный счетчик при приближении к лимиту (90%)
- ✅ Валидация на backend с понятной ошибкой

**Тестирование:**
Попробуйте вставить длинный текст в чат - увидите счетчик символов.

---

## ✅ Проверка 5: Дисклеймер в приветствии

**Реализовано:**
- ✅ Обновлено приветственное сообщение в `backend/.env.example`:

```env
WELCOME_MESSAGE=Здравствуйте! Я AI-ассистент.\n\nОтвечаю на вопросы по базе знаний о ростовых куклах и комплектующих. Если потребуется личная консультация, направлю к менеджеру.\n\nЧем могу помочь?
```

**Настройка:**
Отредактируйте `WELCOME_MESSAGE` в `backend/.env` под вашу специфику.

---

## ✅ Проверка 6: Быстрая смена настроек

**Все настройки через backend/.env:**

```env
# Модель
OPENAI_MODEL=gpt-4o-mini

# System prompt (можно многострочный)
SYSTEM_PROMPT=Ваш промпт здесь...

# Приветствие (используйте \n для переносов)
WELCOME_MESSAGE=Здравствуйте!...\n\nЧем могу помочь?

# Контакт менеджера
MANAGER_CONTACT=https://t.me/eth1r

# Timeout
OPENAI_TIMEOUT=30

# База знаний (опционально)
OPENAI_ASSISTANT_ID=asst_xxxxx
VECTOR_STORE_ID=vs_xxxxx
```

**Применение изменений:**
```bash
# Перезапустите только backend
docker-compose restart chat-backend

# Изменения применятся за 2-3 секунды
```

**Без правки кода!** ✅

---

## Итоговый статус

| Проверка | Статус | Комментарий |
|----------|--------|-------------|
| 1. База знаний | ✅ Реализовано | Assistants API интегрирован, готов к работе |
| 2. Timeout/Fallback | ✅ Реализовано | 30s backend + 35s frontend + понятные ошибки |
| 3. Логирование | ✅ Реализовано | session_id, время, модель/assistant, ошибки |
| 4. Ограничение длины | ✅ Реализовано | 2000 символов + счетчик |
| 5. Дисклеймер | ✅ Реализовано | В приветственном сообщении |
| 6. Быстрая настройка | ✅ Реализовано | Все через .env без правки кода |

---

## Следующие шаги перед деплоем

### 1. Создайте backend/.env

```bash
cd backend
cp .env.example .env
```

### 2. Укажите ваш OpenAI API key и Assistant ID

```env
OPENAI_API_KEY=sk-ваш-ключ
OPENAI_ASSISTANT_ID=asst_ваш_assistant_id
VECTOR_STORE_ID=vs_ваш_vector_store_id
```

Если Assistant ещё не создан, см. `backend/KNOWLEDGE_BASE_SETUP.md`

### 3. (Опционально) Подключите базу знаний

См. `backend/KNOWLEDGE_BASE_SETUP.md`

### 4. Запустите

```bash
docker-compose up -d --build
```

### 5. Проверьте

- Откройте сайт
- Нажмите на кнопку чата
- Отправьте тестовое сообщение
- Проверьте логи: `docker-compose logs -f chat-backend`

---

Дата: 2026-03-26
