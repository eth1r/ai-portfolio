#!/bin/bash

# Универсальный скрипт деплоя на VPS
# Использование: bash deploy.sh

set -e

SERVER="${DEPLOY_SERVER:-your.server.ip}"
USER="root"
REMOTE_DIR="~/ai_portfolio"
LOCAL_DIR="."

echo "🚀 Начинаем деплой на $SERVER..."

# Проверка SSH подключения
echo "📡 Проверка подключения к серверу..."
if ! ssh -o ConnectTimeout=5 $USER@$SERVER "echo 'Подключение успешно'"; then
    echo "❌ Ошибка: Не удалось подключиться к серверу $SERVER"
    exit 1
fi

# Синхронизация файлов через rsync
echo "📦 Синхронизация файлов..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.DS_Store' \
    --exclude '*.log' \
    $LOCAL_DIR/ $USER@$SERVER:$REMOTE_DIR/

echo "✅ Файлы синхронизированы"

# Синхронизация backend/.env если существует локально
if [ -f "backend/.env" ]; then
    echo "📦 Синхронизация backend/.env..."
    rsync -avz backend/.env $USER@$SERVER:$REMOTE_DIR/backend/.env
    echo "✅ backend/.env синхронизирован"
else
    echo "⚠️  backend/.env не найден локально. Убедитесь, что он существует на сервере."
fi

# Запуск контейнеров на сервере
echo "🐳 Запуск Docker контейнеров на сервере..."
ssh $USER@$SERVER "cd $REMOTE_DIR && docker compose down --remove-orphans && docker compose build --no-cache ai-portfolio && docker compose up -d"

echo "✅ Деплой завершен успешно!"
echo ""
echo "📊 Проверка статуса контейнеров:"
ssh $USER@$SERVER "cd $REMOTE_DIR && docker compose ps"
echo ""
echo "🌐 Сайт доступен по адресу: http://$SERVER:8081"
echo ""
echo "📋 Для просмотра логов выполните:"
echo "   ssh $USER@$SERVER 'cd $REMOTE_DIR && docker compose logs -f ai-portfolio'"
