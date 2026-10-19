#!/bin/bash

cd "$(dirname "$0")"

# Запускаем dev-сервер в фоне
npm run dev &
SERVER_PID=$!

# Ждём, пока сервер запустится
sleep 3

# Запускаем Firefox как отдельный процесс
firefox --new-instance http://localhost:5173/CardBench/ &
BROWSER_PID=$!

# Функция очистки
cleanup() {
    echo "Останавливаю dev-сервер..."
    # Убиваем всех потомков сервера (vite) и сам сервер
    pkill -P $SERVER_PID 2>/dev/null
    kill $SERVER_PID 2>/dev/null
}

# Перехватываем сигналы завершения
trap cleanup EXIT INT TERM

# Ждём, пока браузер закроется
wait $BROWSER_PID

# Выход - сработает trap
