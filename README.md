# AI Portfolio - Freelance Personal Brand

Профессиональный сайт-портфолио фрилансера, специализирующегося на внедрении AI и автоматизации для бизнеса.

## 🎯 О проекте

Современный одностраничный сайт (SPA) на React, демонстрирующий кейсы, услуги и экспертизу в области AI-решений и автоматизации бизнес-процессов.

### Ключевые особенности

- ✅ **Клиент-ориентированная подача** - Фокус на бизнес-ценности, не на технологиях
- ✅ **AI-чат виджет** - Интегрированный ассистент с базой знаний
- ✅ **Демо-боты** - Интерактивные демонстрации Telegram-ботов
- ✅ **Оптимизированная производительность** - 391 кБ основной бандл (125 кБ gzipped)
- ✅ **Централизованный контент** - Все тексты в одном файле для легкого редактирования
- ✅ **SEO-оптимизация** - Динамические meta-теги, Open Graph, Twitter Card
- ✅ **Адаптивный дизайн** - Полная поддержка мобильных устройств
- ✅ **Accessibility** - Keyboard navigation, reduced motion support

## 🚀 Быстрый старт

### Требования

- Node.js 18+
- npm или yarn

### Установка и запуск

```bash
# Клонировать репозиторий
git clone https://github.com/eth1r/ai-portfolio.git
cd ai-portfolio

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev

# Открыть в браузере
# http://localhost:5173
```

### Сборка для продакшена

```bash
# Собрать проект
npm run build

# Результат в папке dist/
```


## 📁 Структура проекта

```
ai-portfolio/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── Header.jsx       # Навигация
│   │   ├── CaseCard.jsx     # Карточка кейса
│   │   ├── ContactForm.jsx  # Форма контакта
│   │   ├── ChatWidget.jsx   # Глобальный AI-чат
│   │   └── MermaidChart.jsx # Диаграммы (lazy loaded)
│   ├── pages/               # Страницы
│   │   ├── Home.jsx         # Главная (лендинг)
│   │   ├── Cases.jsx        # Список кейсов
│   │   ├── CaseDetail.jsx   # Детальная страница кейса
│   │   ├── Services.jsx     # Услуги
│   │   ├── About.jsx        # Обо мне
│   │   ├── Contact.jsx      # Контакты
│   │   └── Lab.jsx          # Демо Telegram Return Bot
│   ├── content/             # Централизованный контент
│   │   └── siteContent.js   # Все тексты сайта
│   ├── App.jsx              # Роутинг
│   └── main.jsx             # Точка входа
├── backend/                 # FastAPI backend для AI-чата
│   ├── main.py              # Основной файл backend
│   ├── requirements.txt     # Python зависимости
│   └── .env.example         # Пример конфигурации
├── public/                  # Статические файлы
├── scripts/                 # Build utilities
│   ├── prerender.js         # Пререндеринг страниц
│   ├── generate-sitemap.js  # Генерация sitemap
│   └── generate-manifest.js # Генерация content manifest
├── projects.json            # Данные кейсов
├── .env.example             # Пример конфигурации
└── vite.config.js           # Конфигурация Vite
```

## 🎨 Технологический стек

### Frontend
- **React 18** - UI библиотека
- **React Router 6** - Роутинг
- **Vite 5** - Сборщик и dev-сервер
- **CSS3** - Стилизация (Custom properties, Glassmorphism)

### Backend (AI Chat)
- **FastAPI** - Python веб-фреймворк
- **OpenAI GPT-4** - AI-модель для чата
- **OpenAI Assistants API** - База знаний
- **Docker** - Контейнеризация backend

### Визуализация
- **Mermaid.js** - Диаграммы архитектуры (lazy loaded)

### Деплой
- **Docker** - Контейнеризация
- **Nginx** - Веб-сервер
- **SSL/TLS** - Безопасное соединение


## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# Endpoint для формы контакта (опционально)
VITE_CONTACT_ENDPOINT=/api/contact
VITE_CONTACT_METHOD=POST

# Если не настроен, используется mailto fallback
```

### Настройка AI-чата (опционально)

Для работы AI-чат виджета создайте `backend/.env` на основе `backend/.env.example`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Для подключения базы знаний (опционально)
OPENAI_ASSISTANT_ID=your_assistant_id_here
VECTOR_STORE_ID=your_vector_store_id_here

# Настройки чата
SYSTEM_PROMPT=Ваш системный промпт
WELCOME_MESSAGE=Приветственное сообщение
MANAGER_CONTACT=https://t.me/your_username
```

Подробная инструкция: [AI_CHAT_SETUP.md](./AI_CHAT_SETUP.md)

### Обновление контента

Все тексты сайта находятся в `src/content/siteContent.js`. Для изменения контента:

1. Откройте `src/content/siteContent.js`
2. Отредактируйте нужные секции
3. Сохраните файл
4. Пересоберите проект

### Обновление кейсов

Кейсы хранятся в `projects.json`. Структура кейса:

```json
{
  "id": "unique-id",
  "slug": "url-friendly-slug",
  "title": "Название кейса",
  "category": "AI-ассистенты",
  "audience": "Для кого",
  "short_pitch": "Краткое описание",
  "client_problem": "Проблема клиента",
  "solution": "Решение",
  "result": {
    "headline": "Главный результат",
    "metrics": [
      { "label": "Метрика", "value": "Значение" }
    ]
  },
  "business_value": ["Ценность 1", "Ценность 2"],
  "services_used": ["Услуга 1", "Услуга 2"],
  "deliverables": ["Что передано 1", "Что передано 2"],
  "timeline": "Срок",
  "stack": ["Технология 1", "Технология 2"],
  "isFeatured": true
}
```


## 🐳 Docker деплой

### Локальная сборка

```bash
# Собрать образ
docker build -t ai-portfolio .

# Запустить контейнер
docker run -p 80:80 ai-portfolio
```

### Docker Compose

```bash
# Запустить с docker-compose
docker-compose up -d

# Остановить
docker-compose down
```

### Деплой на сервер

```bash
# Запустить скрипт деплоя
./deploy.sh

# Или вручную
docker-compose -f docker-compose.yml up -d --build
```

## 📊 Производительность

### Метрики сборки

```
✓ built in 8.06s
Main bundle: 391.58 kB │ gzip: 125.09 kB
Mermaid (lazy): 497.98 kB │ gzip: 139.77 kB
```

### Оптимизации

- ✅ **Ленивая загрузка** Mermaid.js (загружается только при необходимости)
- ✅ **Code splitting** - Разделение на чанки
- ✅ **Tree shaking** - Удаление неиспользуемого кода
- ✅ **Минификация** - Сжатие JS и CSS
- ✅ **Gzip compression** - Сжатие на уровне сервера


## 🔧 Разработка

### Доступные команды

```bash
# Запуск dev-сервера
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр production сборки
npm run preview

# Линтинг
npm run lint
```

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте роут в `src/App.jsx`
3. Добавьте ссылку в навигацию (`src/components/Header.jsx`)
4. Добавьте контент в `src/content/siteContent.js` (если нужно)

### Добавление нового кейса

1. Добавьте объект кейса в `projects.json`
2. Заполните все обязательные поля
3. Установите `isFeatured: true` для отображения на главной
4. Кейс автоматически появится на странице /cases

## 📝 Документация

- **[CHANGELOG.md](./CHANGELOG.md)** - История изменений
- **[AI_CHAT_SETUP.md](./AI_CHAT_SETUP.md)** - Настройка AI-чат виджета
- **[DEPLOY_WITH_CHAT.md](./DEPLOY_WITH_CHAT.md)** - Деплой с чат-функциональностью
- **[START_HERE.md](./START_HERE.md)** - С чего начать


## 🎯 Целевая аудитория

Сайт ориентирован на:
- Малый и средний бизнес
- Онлайн-школы и образовательные проекты
- Сервисные компании
- Команды поддержки

## 💼 Услуги

1. **AI-ассистенты для поддержки** - Умные чат-боты для Telegram, WhatsApp, сайта
2. **Автоматизация бизнес-процессов** - Workflow между сервисами, экономия времени
3. **Обработка документов с AI** - Извлечение данных из документов с помощью AI
4. **AI для точных ответов по документам** - RAG-системы с базой знаний
5. **Быстрые AI-прототипы** - Проверка идей до полноценного внедрения

## 📈 Метрики

- 10+ реализованных проектов
- 70% снижение нагрузки на поддержку
- 40ч экономия времени в неделю
- 24ч ответ на запрос

## 🤝 Контакты

Для обсуждения проектов:
- 💬 Telegram: [@eth1r](https://t.me/eth1r)

## 📄 Лицензия

Этот проект создан для личного использования.

---

**Дата последнего обновления:** 1 мая 2026  
**Версия:** 2.1.0  
**Статус:** ✅ Production Ready
