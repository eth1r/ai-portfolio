# Design Document: Modern Business Redesign

## Overview

Этот документ описывает дизайн глобального редизайна портфолио-сайта с целью трансформации визуального стиля от "терминала разработчика" к современному, визуально дорогому и бизнес-ориентированному дизайну. Редизайн фокусируется исключительно на изменении CSS стилей без модификации JavaScript логики или структуры компонентов.

## Architecture

### Принципы дизайна

1. **CSS-Only Approach**: Все изменения реализуются через модификацию CSS файлов
2. **Component Preservation**: Структура React компонентов остается неизменной
3. **Progressive Enhancement**: Новые визуальные эффекты добавляются поверх существующей функциональности
4. **Mobile-First**: Адаптивность сохраняется и улучшается

### Затрагиваемые файлы

- `src/index.css` - глобальные стили, типографика, цветовая палитра
- `src/App.css` - стили основного контейнера приложения
- `src/components/ProjectCard.css` - стили карточек проектов (основной фокус)
- `src/components/ProjectCard.jsx` - минимальные изменения для добавления иконок
- `src/pages/Home.css` - стили главной страницы
- `src/pages/Lab.css` - сохранение monospace для кода

## Components and Interfaces

### 1. Глобальная Типографика (index.css)

**Изменения:**
- Замена базового шрифта на современный sans-serif стек
- Увеличение line-height до 1.6
- Сохранение monospace только для code, pre, .code, .prompt

**CSS Variables:**
```css
:root {
  --font-primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-code: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
}
```

### 2. Цветовая Палитра (index.css)

**Изменения:**
- Замена --bg-primary с #000000 на #0F1117
- Добавление градиентных переменных для CTA и акцентов

**CSS Variables:**
```css
:root {
  --bg-primary: #0F1117;
  --bg-secondary: #1a1d29;
  --bg-card: rgba(26, 29, 41, 0.6);
  --accent-gradient: linear-gradient(135deg, #3A86FF 0%, #8338EC 100%);
  --border-glow: rgba(58, 134, 255, 0.3);
}
```

### 3. ProjectCard Glassmorphism (ProjectCard.css)

**Изменения:**
- Полупрозрачный фон с backdrop-filter
- Светящаяся рамка с box-shadow
- Усиленные hover эффекты

**Ключевые стили:**
```css
.project-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(58, 134, 255, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(58, 134, 255, 0.1);
}

.project-card:hover {
  transform: translateY(-5px);
  border-color: var(--border-glow);
  box-shadow: 0 12px 48px rgba(58, 134, 255, 0.25),
              0 0 0 1px rgba(58, 134, 255, 0.3);
}
```

### 4. Визуализация Метрик (ProjectCard.css)

**Изменения:**
- Цветные бейджи вместо простых прогресс-баров
- Динамическая окраска на основе значений метрик

**Логика окраски:**
- Высокие значения (>0.8): зеленый (#34C759)
- Средние значения (0.5-0.8): желтый (#FF9500)
- Низкие значения (<0.5): красный (#FF3B30)

**Стили:**
```css
.metric-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.metric-badge.high {
  background: rgba(52, 199, 89, 0.15);
  color: #34C759;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.metric-badge.medium {
  background: rgba(255, 149, 0, 0.15);
  color: #FF9500;
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.metric-badge.low {
  background: rgba(255, 59, 48, 0.15);
  color: #FF3B30;
  border: 1px solid rgba(255, 59, 48, 0.3);
}
```

### 5. Иконки Архитектуры (ProjectCard.jsx + CSS)

**Изменения в JSX:**
- Добавление контейнера для иконки в card-header
- Маппинг категорий на SVG иконки
- Placeholder иконка для неизвестных категорий

**Маппинг категорий:**
```javascript
const categoryIcons = {
  'AI Architecture': <svg>...</svg>, // Мозг + база данных
  'Data Engineering': <svg>...</svg>, // Конвейер данных
  'Automation': <svg>...</svg>, // Шестеренки
  'default': <svg>...</svg> // Абстрактная иконка
}
```

**CSS для иконок:**
```css
.card-icon-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.card-icon {
  width: 28px;
  height: 28px;
  color: white;
}
```

### 6. CTA Кнопки с Градиентом (ProjectCard.css)

**Изменения:**
- Применение градиента к .btn-primary
- Усиленный hover эффект

**Стили:**
```css
.btn-primary {
  background: var(--accent-gradient);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(58, 134, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(58, 134, 255, 0.4);
}
```

## Data Models

### MetricLevel Enum
```typescript
enum MetricLevel {
  HIGH = 'high',    // > 0.8
  MEDIUM = 'medium', // 0.5 - 0.8
  LOW = 'low'       // < 0.5
}
```

### CategoryIcon Type
```typescript
type CategoryIcon = {
  category: string;
  icon: JSX.Element;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Modern Typography Application
*For any* text element (body, h1-h6, p), the computed font-family should include 'Inter' or system-ui as the first available font in the stack.
**Validates: Requirements 1.1**

### Property 2: Monospace Preservation for Code
*For any* code element (code, pre, .code, .prompt), the computed font-family should be monospace and NOT include 'Inter' or sans-serif fonts.
**Validates: Requirements 1.2**

### Property 3: Line Height Compliance
*For any* body or paragraph element, the computed line-height should be >= 1.6.
**Validates: Requirements 1.3**

### Property 4: Deep Dark Background
*For any* page load, the body background-color should be #0F1117 or #0a0a0a, NOT pure black (#000000).
**Validates: Requirements 2.1**

### Property 5: Gradient on CTA Buttons
*For any* .btn-primary element, the computed background-image should contain a linear-gradient.
**Validates: Requirements 2.2**

### Property 6: Glassmorphism Background
*For any* .project-card element, the computed background-color should have an alpha channel (rgba) with alpha < 1.
**Validates: Requirements 3.1**

### Property 7: Backdrop Filter Application
*For any* .project-card element, the computed backdrop-filter should include blur with value >= 10px.
**Validates: Requirements 3.2**

### Property 8: Glowing Border
*For any* .project-card element, the computed box-shadow should exist and contain rgba color values.
**Validates: Requirements 3.3**

### Property 9: Metric Indicator Rendering
*For any* ProjectCard with metrics.faithfulness or metrics.context_precision, a visual indicator element (.metric-badge or .metric-bar) should be rendered in the DOM.
**Validates: Requirements 4.1, 4.2**

### Property 10: Metric Color Coding
*For any* metric value, if value > 0.8 then indicator color should be green (#34C759), if 0.5 <= value <= 0.8 then yellow (#FF9500), if value < 0.5 then red (#FF3B30).
**Validates: Requirements 4.3, 4.4, 4.5**

### Property 11: Icon Container Presence
*For any* .project-card element, a .card-icon-container element should exist in the card header.
**Validates: Requirements 5.1**

### Property 12: Hover Transform Effect
*For any* .project-card element on hover state, the computed transform should include translateY with negative value.
**Validates: Requirements 6.1**

### Property 13: Hover Glow Enhancement
*For any* .project-card element on hover state, the computed box-shadow should be more intense than non-hover state.
**Validates: Requirements 6.2**

### Property 14: Smooth Transitions
*For any* interactive element (.project-card, .btn), the computed transition-duration should be >= 0.3s.
**Validates: Requirements 6.3, 6.5**

### Property 15: Functional Preservation
*For any* link element after redesign, the href attribute and click handlers should remain functional and unchanged.
**Validates: Requirements 7.1**

### Property 16: Data Rendering Integrity
*For any* project in projects.json, all data fields (title, description, metrics, etc.) should be rendered in the DOM after redesign.
**Validates: Requirements 7.2**

### Property 17: Mobile Backdrop-Filter Disabled
*For any* device with viewport width <= 768px, .project-card elements should NOT have backdrop-filter applied (computed value should be 'none').
**Validates: Requirements 8.1**

### Property 18: Mobile Background Opacity
*For any* device with viewport width <= 768px, .project-card background-color should have alpha >= 0.95 for text readability.
**Validates: Requirements 8.2**

### Property 19: Mobile Card Spacing
*For any* device with viewport width <= 768px, .project-card elements should have margin-bottom >= 1.5rem to prevent card merging.
**Validates: Requirements 8.3**

### Property 20: Mobile Line Height
*For any* text element on mobile (viewport <= 768px), line-height should be >= 1.7 for improved readability.
**Validates: Requirements 8.4**

### Property 21: Reduced Motion Compliance
*For any* device with prefers-reduced-motion setting enabled, .project-card should NOT have backdrop-filter applied.
**Validates: Requirements 8.6**

## Error Handling

### CSS Fallbacks

1. **Font Loading Failures**: Если Inter не загружается, система автоматически использует system-ui или другие fallback шрифты из стека
2. **Backdrop-filter Support**: Для браузеров без поддержки backdrop-filter, карточки будут иметь непрозрачный фон
3. **Gradient Support**: Для старых браузеров без поддержки градиентов, используется solid color fallback

### Browser Compatibility

- **Modern Browsers**: Полная поддержка всех эффектов (Chrome 76+, Firefox 70+, Safari 13+)
- **Legacy Browsers**: Graceful degradation с сохранением функциональности

## Testing Strategy

### Unit Tests

Фокус на специфических примерах и edge cases:

1. **Typography Tests**:
   - Проверка применения Inter к body
   - Проверка сохранения monospace для <code>
   - Проверка line-height на конкретных элементах

2. **Color Tests**:
   - Проверка фонового цвета body
   - Проверка градиента на кнопках
   - Проверка цветов метрик для граничных значений (0.5, 0.8)

3. **Component Tests**:
   - Рендеринг ProjectCard с метриками
   - Рендеринг иконок для разных категорий
   - Проверка placeholder иконки

### Property-Based Tests

Фокус на универсальных свойствах across all inputs:

**Configuration**: Minimum 100 iterations per test

1. **Property Test: Typography Consistency**
   - **Feature: modern-business-redesign, Property 1**: Modern Typography Application
   - Generate random text elements, verify font-family contains Inter

2. **Property Test: Code Font Preservation**
   - **Feature: modern-business-redesign, Property 2**: Monospace Preservation for Code
   - Generate random code elements, verify monospace font

3. **Property Test: Metric Color Mapping**
   - **Feature: modern-business-redesign, Property 10**: Metric Color Coding
   - Generate random metric values (0.0-1.0), verify correct color class applied

4. **Property Test: Glassmorphism Effects**
   - **Feature: modern-business-redesign, Property 6, 7, 8**: Glassmorphism properties
   - Verify all cards have transparent background, backdrop-filter, and box-shadow

5. **Property Test: Hover Interactions**
   - **Feature: modern-business-redesign, Property 12, 13, 14**: Hover effects
   - Verify all interactive elements have proper hover states with transitions

6. **Property Test: Data Integrity**
   - **Feature: modern-business-redesign, Property 16**: Data Rendering Integrity
   - For all projects in projects.json, verify all fields render correctly

### Testing Framework

- **Unit Tests**: Vitest + React Testing Library
- **Property Tests**: fast-check (JavaScript property-based testing library)
- **Visual Regression**: Playwright для screenshot comparison (опционально)

### Test Execution

```bash
# Run all tests
npm test

# Run property tests with 100 iterations
npm test -- --run --reporter=verbose
```

## Implementation Notes

### CSS Custom Properties Strategy

Использование CSS переменных для централизованного управления дизайн-токенами:

```css
:root {
  /* Typography */
  --font-primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-code: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  --line-height-base: 1.6;
  
  /* Colors */
  --bg-primary: #0F1117;
  --bg-secondary: #1a1d29;
  --bg-card: rgba(26, 29, 41, 0.6);
  
  /* Gradients */
  --accent-gradient: linear-gradient(135deg, #3A86FF 0%, #8338EC 100%);
  
  /* Effects */
  --blur-amount: 10px;
  --border-glow: rgba(58, 134, 255, 0.3);
  
  /* Transitions */
  --transition-base: 0.3s ease;
}
```

### Performance Considerations

1. **Backdrop-filter**: Может быть ресурсоемким, применяется только к карточкам
2. **Box-shadow**: Множественные тени оптимизированы для GPU
3. **Transitions**: Используются только transform и opacity для 60fps анимаций

### Mobile-First Adaptivity

**Проблема**: Glassmorphism с backdrop-filter может тормозить на старых мобильных устройствах и создавать проблемы с читаемостью.

**Решение**:

1. **Отключение backdrop-filter на мобильных**:
```css
@media (max-width: 768px) {
  .project-card {
    backdrop-filter: none;
    background: rgba(26, 29, 41, 0.95); /* Более непрозрачный фон */
  }
}
```

2. **Увеличенные отступы для читаемости**:
```css
@media (max-width: 768px) {
  .project-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem; /* Предотвращение слияния карточек */
  }
  
  .card-description,
  .business-value-text,
  .technical-stack-text {
    font-size: 0.95rem;
    line-height: 1.7; /* Увеличенный для мобильных */
  }
}
```

3. **Упрощенные эффекты на мобильных**:
```css
@media (max-width: 768px) {
  .project-card:hover {
    transform: translateY(-2px); /* Меньше движения */
    box-shadow: 0 8px 24px rgba(58, 134, 255, 0.2); /* Легче */
  }
  
  .btn-primary:hover {
    transform: none; /* Без трансформации на touch */
  }
}
```

4. **Контрастность текста**:
```css
@media (max-width: 768px) {
  .card-description {
    color: #B8B8B8; /* Светлее для лучшей читаемости */
  }
  
  .business-value-text,
  .technical-stack-text {
    color: #E5E5E5; /* Высокий контраст */
  }
}
```

5. **Детекция производительности устройства**:
```css
/* Для устройств с низкой производительностью */
@media (prefers-reduced-motion: reduce) {
  .project-card {
    backdrop-filter: none;
    background: rgba(26, 29, 41, 0.95);
  }
}
```

**Тестирование мобильной версии**:
- Chrome DevTools Device Mode (iPhone SE, Galaxy S8)
- Реальные устройства: iOS Safari, Android Chrome
- Проверка читаемости при разном освещении
- Тест производительности: 60fps на устройствах 2019+ года

### Accessibility

1. **Contrast Ratios**: Все цветовые комбинации соответствуют WCAG AA (4.5:1 для текста)
2. **Focus States**: Сохранены и улучшены для keyboard navigation
3. **Reduced Motion**: Добавлена поддержка prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
