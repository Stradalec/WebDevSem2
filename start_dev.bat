@echo off
chcp 65001 > nul

echo Этот батник поднимает Docker контейнеры и запускает main_service и image_worker

echo [1/5] Запуск контейнеров...
docker compose up -d

if %ERRORLEVEL% NEQ 0 (
    echo Не удалось запустить docker compose!
    pause
    exit /b %ERRORLEVEL%
)

echo Команда выполнена успешно, контейнеры отправлены на запуск.

echo [2/5] Ждём 20-30 секунд, пока Кафка приходит в себя
timeout /t 35 /nobreak > nul

echo [3/5] Создаём топики Кафки (на всякий, вдруг погибли случайно)
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --if-not-exists --topic image.uploaded --partitions 1 --replication-factor 1
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --create --if-not-exists --topic image.processed --partitions 1 --replication-factor 1

echo [4/5] Подрубаем главное API
start "Main API" cmd /k "cd /d %~dp0main_service && npm run start:dev"

echo [5/5] Подрубаем обработчик картинок
start "Image Worker" cmd /k "cd /d %~dp0image_worker && npm run start:dev"

echo Если открылись два терминала - можно идти покупать лотерейный билет. Убивать процесс - скриптом stop_dev
echo Main API:      http://localhost:3000
echo Image Worker:  http://localhost:3001/health
echo: Список эндпоинтов в ReadMe
pause