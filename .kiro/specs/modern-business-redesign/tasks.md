# Implementation Plan: Modern Business Redesign

## Overview

Поэтапная реализация глобального редизайна портфолио-сайта с трансформацией от "терминала разработчика" к современному бизнес-ориентированному дизайну. Каждый этап завершается промежуточным билдом для проверки на portfolio.aiworker43.ru.

## Tasks

- [x] 1. Типографика и Глобальные Стили
  - Обновить CSS переменные в src/index.css
  - Применить современный шрифт Inter для всех текстовых элементов
  - Сохранить monospace только для code элементов
  - Изменить цветовую палитру (глубокий темный фон #0F1117)
  - Добавить градиентные переменные
  - Увеличить line-height до 1.6
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 2. Checkpoint - Промежуточный билд и проверка
  - Запустить локальный билд (npm run build)
  - Проверить типографику и цвета
  - Задеплоить на portfolio.aiworker43.ru
  - Убедиться, что базовые стили применены корректно

- [ ] 3. Glassmorphism Эффекты для ProjectCard
  - [x] 3.1 Обновить стили карточек в src/components/ProjectCard.css
    - Применить полупрозрачный фон с rgba
    - Добавить backdrop-filter: blur(10px)
    - Создать светящуюся рамку с box-shadow
    - Усилить hover эффекты (translateY, box-shadow)
    - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.5_

  - [x] 3.2 Добавить мобильную адаптивность
    - Отключить backdrop-filter на <= 768px
    - Увеличить непрозрачность фона до 0.95 на мобильных
    - Добавить отступы между карточками (1.5rem)
    - Увеличить line-height до 1.7 на мобильных
    - Упростить hover эффекты на мобильных
    - Добавить поддержку prefers-reduced-motion
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 4. Checkpoint - Проверка Glassmorphism
  - Запустить локальный билд
  - Проверить эффекты на десктопе
  - Проверить производительность на мобильных (Chrome DevTools)
  - Задеплоить и протестировать на реальных устройствах

- [x] 5. Визуализация Метрик
  - [x] 5.1 Обновить стили метрик в src/components/ProjectCard.css
    - Создать цветные бейджи для метрик
    - Добавить классы .metric-badge.high, .medium, .low
    - Применить цветовую кодировку (зеленый/желтый/красный)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 5.2 Обновить логику рендеринга метрик в src/components/ProjectCard.jsx
    - Добавить функцию getMetricLevel(value) для определения уровня
    - Применить соответствующий класс к бейджам
    - Сохранить числовое значение рядом с индикатором
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 6. Иконки Архитектуры
  - [x] 6.1 Создать SVG иконки для категорий
    - Создать объект categoryIcons с маппингом
    - Добавить иконки: AI Architecture, Data Engineering, Automation
    - Создать placeholder иконку для неизвестных категорий
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.2 Обновить ProjectCard.jsx для рендеринга иконок
    - Добавить контейнер .card-icon-container в card-header
    - Реализовать логику выбора иконки по category
    - _Requirements: 5.1, 5.2_

  - [x] 6.3 Добавить стили для иконок в ProjectCard.css
    - Стилизовать .card-icon-container с градиентным фоном
    - Настроить размеры и позиционирование
    - _Requirements: 5.1_

- [x] 7. CTA Кнопки с Градиентом
  - Обновить стили .btn-primary в src/components/ProjectCard.css
  - Применить градиент из переменной --accent-gradient
  - Усилить hover эффект с box-shadow
  - _Requirements: 2.2, 2.3_

- [x] 8. Checkpoint - Финальная проверка
  - Запустить полный билд
  - Проверить все компоненты на десктопе
  - Проверить мобильную версию (iPhone, Android)
  - Проверить производительность (60fps)
  - Проверить читаемость текста
  - Задеплоить финальную версию

- [ ] 9. Тестирование
  - [ ]* 9.1 Настроить fast-check для property-based тестов
    - Установить fast-check: npm install --save-dev fast-check
    - Создать файл src/components/__tests__/ProjectCard.properties.test.js
    - Настроить Vitest для запуска тестов
    - _Requirements: Testing Strategy_

  - [ ]* 9.2 Написать property тесты для типографики
    - **Property 1: Modern Typography Application**
    - **Property 2: Monospace Preservation for Code**
    - **Property 3: Line Height Compliance**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 9.3 Написать property тесты для цветов и эффектов
    - **Property 4: Deep Dark Background**
    - **Property 5: Gradient on CTA Buttons**
    - **Property 6-8: Glassmorphism properties**
    - **Validates: Requirements 2.1, 2.2, 3.1, 3.2, 3.3**

  - [ ]* 9.4 Написать property тесты для метрик
    - **Property 9: Metric Indicator Rendering**
    - **Property 10: Metric Color Coding**
    - **Validates: Requirements 4.1-4.6**

  - [ ]* 9.5 Написать property тесты для мобильной адаптивности
    - **Property 17-21: Mobile optimization properties**
    - **Validates: Requirements 8.1-8.6**

  - [ ]* 9.6 Написать unit тесты для edge cases
    - Тест рендеринга карточки без метрик
    - Тест placeholder иконки для неизвестной категории
    - Тест граничных значений метрик (0.5, 0.8)
    - _Requirements: 4.3, 4.4, 4.5, 5.3_

- [x] 10. Финальный деплой и документация
  - Запустить все тесты (npm test)
  - Создать changelog с описанием изменений
  - Задеплоить на production
  - Проверить на portfolio.aiworker43.ru

## Notes

- Задачи с `*` являются опциональными (тестирование) и могут быть выполнены после основной реализации
- После каждого checkpoint необходимо деплоить на portfolio.aiworker43.ru для проверки
- Мобильная адаптивность критична - тестировать на реальных устройствах
- Производительность: целевые 60fps на устройствах 2019+
- Все изменения только в CSS, JavaScript логика не меняется
