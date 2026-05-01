#!/bin/bash

# Скрипт установки Docker на сервере
# Использование: bash setup-docker.sh

SERVER="${DEPLOY_SERVER:-your.server.ip}"
USER="root"

echo "🐳 Установка Docker на $SERVER..."
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

# Проверка, установлен ли уже Docker
if ssh $USER@$SERVER "docker --version" 2>/dev/null; then
    echo "✅ Docker уже установлен:"
    ssh $USER@$SERVER "docker --version"
    echo ""
    
    if ssh $USER@$SERVER "docker compose version" 2>/dev/null; then
        echo "✅ Docker Compose уже установлен:"
        ssh $USER@$SERVER "docker compose version"
        echo ""
        echo "🎉 Все готово! Можно деплоить."
        echo ""
        echo "Запустите проверку:"
        echo "  bash pre-deploy-check.sh"
        exit 0
    fi
fi

echo "📦 Устанавливаем Docker на сервере..."
echo ""

# Установка Docker
ssh $USER@$SERVER << 'ENDSSH'
set -e

echo "1️⃣  Обновление пакетов..."
apt-get update

echo ""
echo "2️⃣  Установка зависимостей..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

echo ""
echo "3️⃣  Добавление GPG ключа Docker..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo ""
echo "4️⃣  Добавление репозитория Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

echo ""
echo "5️⃣  Установка Docker Engine..."
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo ""
echo "6️⃣  Запуск Docker..."
systemctl start docker
systemctl enable docker

echo ""
echo "7️⃣  Проверка установки..."
docker --version
docker compose version

echo ""
echo "✅ Docker успешно установлен!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Docker успешно установлен на сервере!"
    echo ""
    echo "Версии:"
    ssh $USER@$SERVER "docker --version"
    ssh $USER@$SERVER "docker compose version"
    echo ""
    echo "Запустите проверку:"
    echo "  bash pre-deploy-check.sh"
else
    echo ""
    echo "❌ Ошибка при установке Docker"
    echo ""
    echo "Попробуйте установить вручную:"
    echo "  ssh $USER@$SERVER"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sh get-docker.sh"
    exit 1
fi
