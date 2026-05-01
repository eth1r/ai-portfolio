#!/bin/bash

# Скрипт настройки SSH доступа к серверу
# Использование: bash setup-ssh.sh

SERVER="${DEPLOY_SERVER:-your.server.ip}"
USER="root"

echo "🔐 Настройка SSH доступа к $SERVER..."
echo ""

# Проверка наличия SSH ключа
if [ ! -f ~/.ssh/id_rsa.pub ] && [ ! -f ~/.ssh/id_ed25519.pub ]; then
    echo "📝 SSH ключ не найден. Создаем новый..."
    echo ""
    
    read -p "Введите ваш email для SSH ключа: " email
    
    if [ -z "$email" ]; then
        email="your_email@example.com"
    fi
    
    ssh-keygen -t ed25519 -C "$email"
    
    echo ""
    echo "✅ SSH ключ создан!"
    echo ""
fi

# Определяем путь к публичному ключу
if [ -f ~/.ssh/id_ed25519.pub ]; then
    PUB_KEY_PATH=~/.ssh/id_ed25519.pub
elif [ -f ~/.ssh/id_rsa.pub ]; then
    PUB_KEY_PATH=~/.ssh/id_rsa.pub
else
    echo "❌ Не удалось найти публичный SSH ключ"
    exit 1
fi

echo "📋 Ваш публичный SSH ключ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat $PUB_KEY_PATH
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Выберите способ добавления ключа на сервер:"
echo ""
echo "1) Автоматически (требуется пароль от сервера)"
echo "2) Вручную (скопируйте ключ и добавьте на сервер)"
echo ""

read -p "Ваш выбор (1 или 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🔄 Копируем ключ на сервер..."
    echo "Введите пароль от сервера когда попросит:"
    echo ""
    
    ssh-copy-id $USER@$SERVER
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SSH ключ успешно добавлен на сервер!"
        echo ""
        echo "Проверяем подключение..."
        if ssh -o BatchMode=yes $USER@$SERVER "echo 'Подключение успешно!'"; then
            echo ""
            echo "✅ SSH доступ настроен! Теперь можно деплоить без пароля."
            echo ""
            echo "Запустите проверку:"
            echo "  bash pre-deploy-check.sh"
        else
            echo ""
            echo "⚠️  Что-то пошло не так. Попробуйте вручную."
        fi
    else
        echo ""
        echo "❌ Не удалось скопировать ключ. Попробуйте вручную."
    fi
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "📝 Инструкция для ручного добавления:"
    echo ""
    echo "1. Скопируйте ваш публичный ключ (выделен выше)"
    echo ""
    echo "2. Подключитесь к серверу:"
    echo "   ssh $USER@$SERVER"
    echo ""
    echo "3. Создайте директорию .ssh (если нет):"
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo ""
    echo "4. Добавьте ключ в authorized_keys:"
    echo "   nano ~/.ssh/authorized_keys"
    echo "   # Вставьте скопированный ключ в конец файла"
    echo "   # Сохраните: Ctrl+O, Enter, Ctrl+X"
    echo ""
    echo "5. Установите правильные права:"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "6. Выйдите с сервера:"
    echo "   exit"
    echo ""
    echo "7. Проверьте подключение:"
    echo "   ssh $USER@$SERVER"
    echo ""
    echo "Если все сделано правильно, пароль больше не потребуется."
    echo ""
else
    echo ""
    echo "❌ Неверный выбор. Запустите скрипт снова."
    exit 1
fi
