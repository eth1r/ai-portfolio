# PROJECT-SPECIFIC WIDGETS SYSTEM — REFACTORING COMPLETE

**Дата:** 1 мая 2026  
**Статус:** ✅ ГОТОВО

---

## 1. СТАТУС

**✅ ГОТОВО**

Demo-блок успешно переведён в универсальную систему project-specific widgets.

---

## 2. ЧТО ИЗМЕНЕНО В МОДЕЛИ ДАННЫХ

### Новая структура `demo_widget` в `projects.json`

Вместо простого флага `demo_mode: true` теперь используется полноценная конфигурация виджета:

```json
{
  "demo_widget": {
    "enabled": true,
    "widget_type": "bot",
    "title": "AI-бот для возвратов — web-демо",
    "subtitle": "Можно пройти сценарий прямо на сайте и посмотреть, как бот собирает заявку",
    "disclaimer": "⚠️ Это демонстрационный режим. Заявки из этого виджета не отправляются реальному оператору.",
    "api_endpoint": "/api/demo/telegram-return-bot",
    "quick_prompts": [
      "Хочу оформить возврат товара",
      "Товар пришёл с браком",
      "Хочу вернуть заказ ORD-12345",
      "Экран не работает, хочу сделать возврат"
    ],
    "welcome_message": "Здравствуйте! Я демо-бот по возвратам...",
    "fallback": {
      "title": "Демо временно недоступно",
      "text": "Можно посмотреть код проекта на GitHub или написать мне в Telegram.",
      "primary_label": "Код на GitHub",
      "primary_url": "https://github.com/eth1r/telegram-return-bot",
      "secondary_label": "Написать в Telegram",
      "secondary_url": "https://t.me/eth1r"
    }
  }
}
```

### Где используется

Текущий проект с виджетом: **telegram-return-bot**

Все остальные проекты не имеют `demo_widget`, поэтому виджет для них не показывается.

---

## 3. ЧТО ИЗМЕНЕНО В FRONTEND

### ✅ Создан универсальный компонент `ProjectDemoWidget`

**Файлы:**
- `src/components/ProjectDemoWidget.jsx`
- `src/components/ProjectDemoWidget.css`

**Возможности:**
- Принимает `config` из данных проекта
- Рендерит заголовок, подзаголовок, disclaimer из конфига
- Рендерит quick prompts из конфига
- Использует `api_endpoint` из конфига
- Управляет session_id
- Показывает typing indicator
- Поддерживает markdown в ответах бота
- Показывает fallback UI при недоступности backend
- Кнопка "Начать заново" для сброса диалога

### ✅ Удалён старый компонент `TelegramReturnBotDemo`

**Удалённые файлы:**
- `src/components/TelegramReturnBotDemo.jsx` ❌
- `src/components/TelegramReturnBotDemo.css` ❌

Весь функционал перенесён в универсальный `ProjectDemoWidget`.

### ✅ Обновлён `CaseDetail.jsx`

**Было:**
```jsx
import TelegramReturnBotDemo from '../components/TelegramReturnBotDemo'

{project.demo_mode && (
  <section className="case-section demo-section" id="demo-section">
    <TelegramReturnBotDemo />
  </section>
)}
```

**Стало:**
```jsx
import ProjectDemoWidget from '../components/ProjectDemoWidget'

{project.demo_widget?.enabled && (
  <section className="case-section demo-section" id="demo-section">
    <ProjectDemoWidget config={project.demo_widget} />
  </section>
)}
```

Теперь страница проекта:
- Не импортирует жёстко один конкретный компонент
- Проверяет наличие `demo_widget.enabled` в данных проекта
- Передаёт конфиг виджета в универсальный компонент

### ✅ Обновлён `CaseCard.jsx`

**Было:**
```jsx
{project.demo_mode && (
  <Link to={`/cases/${project.slug}#demo`} className="btn btn-primary btn-demo">
    Попробовать демо
  </Link>
)}
```

**Стало:**
```jsx
{project.demo_widget?.enabled && (
  <Link to={`/cases/${project.slug}#demo`} className="btn btn-primary btn-demo">
    Попробовать демо
  </Link>
)}
```

Кнопка "Попробовать демо" теперь показывается на основе новой модели данных.

---

## 4. КАК ТЕПЕРЬ ДОБАВЛЯТЬ НОВЫЙ ПРОЕКТ С ВИДЖЕТОМ

### Шаг 1: Добавить конфиг виджета в `projects.json`

```json
{
  "id": "new-bot-project",
  "slug": "new-bot-project",
  "title": "Новый AI-бот",
  ...
  "demo_widget": {
    "enabled": true,
    "widget_type": "bot",
    "title": "Название виджета",
    "subtitle": "Краткое описание",
    "disclaimer": "⚠️ Предупреждение для пользователя",
    "api_endpoint": "/api/demo/new-bot",
    "quick_prompts": [
      "Первый быстрый промпт",
      "Второй быстрый промпт"
    ],
    "welcome_message": "Приветственное сообщение бота",
    "fallback": {
      "title": "Демо недоступно",
      "text": "Альтернативные действия",
      "primary_label": "GitHub",
      "primary_url": "https://github.com/...",
      "secondary_label": "Telegram",
      "secondary_url": "https://t.me/..."
    }
  }
}
```

### Шаг 2: Создать backend endpoint

Backend должен принимать:
```json
{
  "message": "текст от пользователя",
  "session_id": "уникальный ID сессии"
}
```

Backend должен возвращать:
```json
{
  "response": "ответ бота",
  "is_final": false
}
```

### Шаг 3: Готово!

Никакого дополнительного frontend-кода писать не нужно. Виджет автоматически появится на странице проекта.

---

## 5. BUILD / ПРОВЕРКА

### ✅ Сборка проходит успешно

```bash
npm run build
```

**Результат:**
- ✅ Build успешен
- ✅ 393.22 kB main bundle (125.52 kB gzipped)
- ✅ Prerender 10 страниц
- ✅ Sitemap сгенерирован
- ✅ Content manifest создан

### ✅ Существующий кейс не сломан

Проект **telegram-return-bot**:
- ✅ Виджет показывается на странице кейса
- ✅ Кнопка "Попробовать демо" работает на карточке
- ✅ Quick prompts рендерятся из конфига
- ✅ API endpoint берётся из конфига
- ✅ Fallback UI настроен

---

## 6. АРХИТЕКТУРНЫЕ ПРЕИМУЩЕСТВА

### ✅ Расширяемость

Добавление нового бота теперь требует:
1. Добавить конфиг в `projects.json` (1 минута)
2. Создать backend endpoint (зависит от логики бота)
3. **Никакого нового frontend-кода**

### ✅ Разделение ответственности

- **Данные проекта** → `projects.json`
- **UI виджета** → `ProjectDemoWidget.jsx` (один компонент для всех)
- **Логика бота** → Backend endpoint (отдельно для каждого бота)

### ✅ Не смешивается с общим чатом сайта

- Общий чат сайта → `ChatWidget.jsx` (отдельная сущность)
- Project-specific виджеты → `ProjectDemoWidget.jsx` (отдельная сущность)

### ✅ Легко поддерживать

- Один компонент вместо N компонентов
- Изменения в UI применяются ко всем виджетам сразу
- Конфигурация в данных, а не в коде

---

## 7. ACCEPTANCE CRITERIA

| Критерий | Статус |
|----------|--------|
| Current demo block переведён в универсальную систему | ✅ |
| Конфиг виджета хранится в данных проекта | ✅ |
| CaseDetail рендерит виджет по данным проекта | ✅ |
| CaseCard показывает кнопку демо по новой модели | ✅ |
| Общий чат сайта не сломан | ✅ |
| telegram-return-bot кейс продолжает работать | ✅ |
| Добавление новых ботов стало расширяемым | ✅ |
| Нет копипаста frontend-кода | ✅ |

---

## 8. СЛЕДУЮЩИЕ ШАГИ (ОПЦИОНАЛЬНО)

Если в будущем появятся новые боты:

1. **Support Bot** — добавить конфиг в projects.json
2. **FAQ Bot** — добавить конфиг в projects.json
3. **Knowledge Base Bot** — добавить конфиг в projects.json
4. **Intake Bot** — добавить конфиг в projects.json

Все они будут использовать один и тот же `ProjectDemoWidget` компонент.

---

## 9. ФАЙЛЫ, ЗАТРОНУТЫЕ РЕФАКТОРИНГОМ

### Созданы
- ✅ `src/components/ProjectDemoWidget.jsx`
- ✅ `src/components/ProjectDemoWidget.css`
- ✅ `PROJECT_WIDGETS_REFACTORING.md` (этот документ)

### Изменены
- ✅ `src/pages/CaseDetail.jsx`
- ✅ `src/components/CaseCard.jsx`
- ✅ `projects.json`

### Удалены
- ❌ `src/components/TelegramReturnBotDemo.jsx`
- ❌ `src/components/TelegramReturnBotDemo.css`
- ❌ `projects_updated.json` (временный файл)

---

## 10. ИТОГ

✅ **Задача выполнена полностью.**

Demo-блок успешно переведён в универсальную, расширяемую систему project-specific widgets без потери функциональности и без нарушения работы существующего кейса.

Система готова к добавлению новых ботов без копипаста frontend-кода.
