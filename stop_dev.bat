@echo off
chcp 65001 > nul

echo [1/2] Уничтожаем контейнеры Docker
docker compose down

echo [2/2] На этом автоматизация закончилась. Дальше извольте ручками закрыть image_worker и main_service через ctrl+C