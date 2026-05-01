# Создание backend/.env на сервере

Деплой прошёл успешно, но нужно создать `backend/.env` на сервере.

## Вариант 1: Через SSH (быстро)

Подключитесь к серверу и создайте файл:

```bash
ssh root@your.server.ip
cd ~/ai_portfolio/backend
nano .env
```

Вставьте:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=your_assistant_id_here
VECTOR_STORE_ID=your_vector_store_id_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT=30
SYSTEM_PROMPT=Ты — AI-ассистент первой линии поддержки по ростовым куклам и комплектующим. Твоя задача: отвечать на вопросы клиентов о продукции, помогать с выбором кукол и комплектующих, предоставлять информацию о характеристиках и ценах. Будь вежливым и профессиональным. Если вопрос выходит за рамки твоих знаний или требует личной консультации, предложи связаться с менеджером.
WELCOME_MESSAGE=Здравствуйте! Я AI-ассистент.\n\nОтвечаю на вопросы по базе знаний о ростовых куклах и комплектующих. Если потребуется личная консультация, направлю к менеджеру.\n\nЧем могу помочь?
MANAGER_CONTACT=https://t.me/eth1r
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

Запустите контейнеры:

```bash
docker compose up -d
```

Проверьте логи:

```bash
docker compose logs -f chat-backend
```

## Вариант 2: Через SCP (если SSH-ключ настроен)

Если SSH-ключ настроен и работает без пароля:

```bash
scp backend/.env root@your.server.ip:~/ai_portfolio/backend/.env
ssh root@your.server.ip "cd ~/ai_portfolio && docker compose up -d"
```

## Вариант 3: Настроить SSH-ключ

Если SSH постоянно спрашивает пароль:

```bash
bash setup-ssh.sh
```

Выберите вариант 1 (автоматически), введите пароль один раз.

После этого деплой будет работать без пароля.

## Проверка после создания .env

```bash
ssh root@your.server.ip
cd ~/ai_portfolio
docker compose ps
docker compose logs -f chat-backend
```

В логах должно быть:
```
INFO: Using Assistants API with assistant_id: your_assistant_id_here
```

## Текущая ситуация

- ✅ Build прошёл успешно
- ✅ Образы собраны
- ❌ Контейнеры не запустились из-за отсутствия backend/.env
- 🔧 Нужно создать backend/.env на сервере

После создания `.env` запустите:

```bash
ssh root@your.server.ip "cd ~/ai_portfolio && docker compose up -d"
```
