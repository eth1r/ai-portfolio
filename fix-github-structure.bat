@echo off
chcp 65001 >nul
echo ========================================
echo Исправление структуры GitHub репозитория
echo ========================================
echo.

REM Проверяем что мы в portfolio_site
if not exist "package.json" (
    echo ❌ ОШИБКА: Запустите скрипт из папки portfolio_site
    pause
    exit /b 1
)

echo 📁 Текущая директория: %CD%
echo.

REM Переходим в родительскую директорию
cd ..
echo 📂 Перешли в: %CD%
echo.

REM Создаём временную директорию
echo 🔨 Создаём временную директорию...
if exist "ai-portfolio-clean" (
    echo ⚠️  Удаляем старую временную директорию...
    rmdir /s /q "ai-portfolio-clean"
)
mkdir "ai-portfolio-clean"
echo ✅ Временная директория создана
echo.

REM Копируем файлы портфолио (исключая .git, node_modules, dist)
echo 📦 Копируем файлы портфолио...
xcopy /E /I /H /Y "portfolio_site\*" "ai-portfolio-clean\" /EXCLUDE:portfolio_site\fix-github-structure-exclude.txt
echo ✅ Файлы скопированы
echo.

REM Переходим во временную директорию
cd ai-portfolio-clean
echo 📂 Перешли в: %CD%
echo.

REM Инициализируем git
echo 🔧 Инициализируем Git...
git init
echo ✅ Git инициализирован
echo.

REM Добавляем все файлы
echo 📝 Добавляем файлы в Git...
git add .
echo ✅ Файлы добавлены
echo.

REM Создаём коммит
echo 💾 Создаём коммит...
git commit -m "Initial commit: AI Portfolio Website" -m "" -m "- React 18 + Vite 5 frontend" -m "- FastAPI backend with OpenAI integration" -m "- AI chat widget with knowledge base" -m "- Case studies and service descriptions" -m "- Responsive glassmorphism UI" -m "- SEO optimized with prerendering" -m "- Docker deployment ready" -m "- Production tested and ready"
echo ✅ Коммит создан
echo.

REM Подключаем remote
echo 🔗 Подключаем к GitHub...
git remote add origin https://github.com/eth1r/ai-portfolio.git
echo ✅ Remote подключен
echo.

REM Показываем что будет запушено
echo 📊 Статистика:
git log --oneline
echo.
git diff --stat 4b825dc642cb6eb9a060e54bf8d69288fbee4904 HEAD
echo.

echo ========================================
echo ⚠️  ВНИМАНИЕ!
echo ========================================
echo Сейчас будет выполнен FORCE PUSH
echo Это заменит весь контент репозитория на GitHub
echo.
echo Старый проект (Competition Monitor) будет удалён
echo Останется только чистый портфолио-сайт
echo.
set /p confirm="Продолжить? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo ❌ Отменено пользователем
    cd ..
    rmdir /s /q "ai-portfolio-clean"
    pause
    exit /b 0
)

echo.
echo 🚀 Выполняем force push...
git push -f origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ УСПЕШНО!
    echo ========================================
    echo.
    echo Репозиторий обновлён: https://github.com/eth1r/ai-portfolio
    echo.
    echo Теперь на GitHub только чистый портфолио-сайт в корне
    echo Старые файлы (Competition Monitor) удалены
    echo.
    echo 🧹 Очистка...
    cd ..
    rmdir /s /q "ai-portfolio-clean"
    echo ✅ Временные файлы удалены
    echo.
    echo 🎉 Всё готово!
) else (
    echo.
    echo ❌ ОШИБКА при push
    echo.
    echo Возможные причины:
    echo - Нет доступа к интернету
    echo - Нет прав на запись в репозиторий
    echo - Нужна аутентификация GitHub
    echo.
    echo Временная директория сохранена: %CD%
    echo Вы можете попробовать выполнить push вручную
)

echo.
pause
