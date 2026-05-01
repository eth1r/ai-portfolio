#!/bin/bash

# Скрипт проверки готовности к деплою
# Использование: bash pre-deploy-check.sh

set -e

SERVER="${DEPLOY_SERVER:-your.server.ip}"
USER="root"

echo "🔍 Проверка готовности к деплою на $SERVER..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ============================================================================
# 1. Проверка SSH доступа
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Проверка SSH доступа"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ssh -o BatchMode=yes -o ConnectTimeout=5 $USER@$SERVER "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH доступ работает (без пароля)${NC}"
else
    echo -e "${RED}❌ SSH доступ НЕ работает или требует пароль${NC}"
    echo ""
    echo "Решение:"
    echo "  1. Сгенерируйте SSH ключ (если нет):"
    echo "     ssh-keygen -t rsa -b 4096"
    echo ""
    echo "  2. Скопируйте ключ на сервер:"
    echo "     ssh-copy-id $USER@$SERVER"
    echo ""
    echo "  3. Или добавьте ключ вручную:"
    echo "     cat ~/.ssh/id_rsa.pub | ssh $USER@$SERVER 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================================================
# 2. Проверка Docker на сервере
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Проверка Docker на сервере"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ssh -o BatchMode=yes -o ConnectTimeout=5 $USER@$SERVER "docker --version" 2>/dev/null; then
    DOCKER_VERSION=$(ssh $USER@$SERVER "docker --version" 2>/dev/null)
    echo -e "${GREEN}✅ Docker установлен: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}❌ Docker НЕ установлен${NC}"
    echo ""
    echo "Решение:"
    echo "  ssh $USER@$SERVER"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sh get-docker.sh"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

echo ""

if ssh -o BatchMode=yes -o ConnectTimeout=5 $USER@$SERVER "docker compose version" 2>/dev/null; then
    COMPOSE_VERSION=$(ssh $USER@$SERVER "docker compose version" 2>/dev/null)
    echo -e "${GREEN}✅ Docker Compose установлен: $COMPOSE_VERSION${NC}"
else
    echo -e "${RED}❌ Docker Compose НЕ установлен${NC}"
    echo ""
    echo "Решение:"
    echo "  Docker Compose обычно идет вместе с Docker."
    echo "  Если нет, установите вручную:"
    echo "  ssh $USER@$SERVER"
    echo "  apt-get update && apt-get install docker-compose-plugin"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================================================
# 3. Проверка SPA роутинга в Nginx
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Проверка SPA роутинга в Nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "try_files.*index.html" Dockerfile; then
    echo -e "${GREEN}✅ SPA роутинг настроен в Dockerfile${NC}"
    echo "   Найдено: try_files \$uri \$uri/ /index.html;"
else
    echo -e "${RED}❌ SPA роутинг НЕ настроен${NC}"
    echo ""
    echo "Решение: Добавьте в Dockerfile конфигурацию Nginx:"
    echo "  location / {"
    echo "      try_files \$uri \$uri/ /index.html;"
    echo "  }"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ============================================================================
# 4. Дополнительные проверки
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Дополнительные проверки"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Проверка наличия Node.js локально
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js установлен локально: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js не найден локально${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Проверка наличия npm локально
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm установлен локально: $NPM_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  npm не найден локально${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Проверка наличия rsync
if command -v rsync &> /dev/null; then
    echo -e "${GREEN}✅ rsync установлен${NC}"
else
    echo -e "${RED}❌ rsync НЕ установлен${NC}"
    echo ""
    echo "Решение:"
    echo "  # Windows (через Chocolatey):"
    echo "  choco install rsync"
    echo ""
    echo "  # Linux:"
    echo "  apt-get install rsync"
    echo ""
    echo "  # macOS:"
    echo "  brew install rsync"
    echo ""
    ERRORS=$((ERRORS + 1))
fi

# Проверка наличия package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json найден${NC}"
else
    echo -e "${RED}❌ package.json НЕ найден${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Проверка наличия projects.json
if [ -f "projects.json" ]; then
    echo -e "${GREEN}✅ projects.json найден${NC}"
else
    echo -e "${YELLOW}⚠️  projects.json не найден${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Проверка наличия Dockerfile
if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✅ Dockerfile найден${NC}"
else
    echo -e "${RED}❌ Dockerfile НЕ найден${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Проверка наличия docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.yml найден${NC}"
else
    echo -e "${RED}❌ docker-compose.yml НЕ найден${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Проверка порта 8081 на сервере
echo ""
if ssh -o BatchMode=yes -o ConnectTimeout=5 $USER@$SERVER "netstat -tuln | grep :8081" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Порт 8081 уже занят на сервере${NC}"
    echo "   Возможно, контейнер уже запущен или порт используется другим приложением"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Порт 8081 свободен на сервере${NC}"
fi

echo ""

# ============================================================================
# Итоговый результат
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Итоговый результат"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Все проверки пройдены! Готов к деплою.${NC}"
    echo ""
    echo "Запустите деплой:"
    echo "  bash deploy.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Есть предупреждения: $WARNINGS${NC}"
    echo ""
    echo "Можно продолжить деплой, но рекомендуется исправить предупреждения."
    echo ""
    echo "Запустите деплой:"
    echo "  bash deploy.sh"
    exit 0
else
    echo -e "${RED}❌ Найдено критических ошибок: $ERRORS${NC}"
    echo -e "${YELLOW}⚠️  Предупреждений: $WARNINGS${NC}"
    echo ""
    echo "Исправьте ошибки перед деплоем!"
    exit 1
fi
