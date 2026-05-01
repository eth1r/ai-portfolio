#!/bin/bash

# Скрипт настройки Nginx Proxy Manager
# Использование: bash setup-proxy.sh

set -e

SERVER="${DEPLOY_SERVER:-your.server.ip}"
USER="root"
REMOTE_DIR="~/ai_portfolio"

echo "🔧 Настройка Nginx Proxy Manager на $SERVER..."
echo ""

# Проверка SSH доступа
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 $USER@$SERVER "echo 'SSH OK'" 2>/dev/null; then
    echo "❌ Нет SSH доступа к серверу"
    echo ""
    echo "Сначала настройте SSH:"
    echo "  bash setup-ssh.sh"
    exit 1
fi

echo "✅ SSH доступ работает"
echo ""

# Синхронизация docker-compose.proxy.yml
echo "📦 Копирование docker-compose.proxy.yml на сервер..."
rsync -avz docker-compose.proxy.yml $USER@$SERVER:$REMOTE_DIR/

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при копировании файла"
    exit 1
fi

echo "✅ Файл скопирован"
echo ""

# Запуск Nginx Proxy Manager
echo "🚀 Запуск Nginx Proxy Manager..."
ssh $USER@$SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.proxy.yml up -d"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при запуске контейнера"
    exit 1
fi

echo ""
echo "✅ Nginx Proxy Manager успешно запущен!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Информация для доступа:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Админка NPM:  http://$SERVER:81"
echo ""
echo "🔐 Логин по умолчанию:"
echo "   Email:    admin@example.com"
echo "   Password: changeme"
echo ""
echo "⚠️  ВАЖНО: При первом входе вас попросят сменить пароль!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Следующие шаги:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Откройте админку: http://$SERVER:81"
echo ""
echo "2. Войдите с учетными данными выше"
echo ""
echo "3. Смените пароль и email"
echo ""
echo "4. Добавьте Proxy Host:"
echo "   - Domain Names: portfolio.aiworker43.ru"
echo "   - Scheme: http"
echo "   - Forward Hostname/IP: ai_portfolio"
echo "   - Forward Port: 80"
echo "   - Block Common Exploits: ✓"
echo "   - Websockets Support: ✓"
echo ""
echo "5. Включите SSL:"
echo "   - SSL Certificate: Request a new SSL Certificate"
echo "   - Force SSL: ✓"
echo "   - HTTP/2 Support: ✓"
echo "   - HSTS Enabled: ✓"
echo ""
echo "6. Проверьте сайт: https://portfolio.aiworker43.ru"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Подробная инструкция: README.md (раздел SSL и домен)"
echo ""
