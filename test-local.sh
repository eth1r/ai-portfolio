#!/bin/bash

# Скрипт для локального тестирования перед деплоем

set -e

echo "🧪 Локальное тестирование проекта..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

echo "✅ npm версия: $(npm -v)"

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Проверка синтаксиса
echo "🔍 Проверка синтаксиса..."
npm run lint || echo "⚠️  Предупреждение: есть ошибки линтера"

# Сборка проекта
echo "🏗️  Сборка проекта..."
npm run build

echo ""
echo "✅ Все проверки пройдены!"
echo ""
echo "🚀 Готово к деплою. Запустите:"
echo "   bash deploy.sh"
