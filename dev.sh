#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$PROJECT_DIR/.dev.pid"
LOG_FILE="$PROJECT_DIR/.dev.log"
PORT=3000

check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

start() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "Already running (PID: $PID)"
            echo "Use './dev.sh stop' to stop first"
            exit 1
        fi
    fi

    if check_port; then
        echo "ERROR: Port $PORT is already in use"
        echo ""
        echo "Running process on port $PORT:"
        lsof -Pi :$PORT -sTCP:LISTEN
        echo ""
        echo "Options:"
        echo "  1. Kill existing process: kill \$(lsof -t -i:$PORT)"
        echo "  2. Use different port: PORT=3001 npm start"
        exit 1
    fi

    echo "Starting dev server on port $PORT..."
    cd "$PROJECT_DIR"
    nohup npm start > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    sleep 3
    if check_port; then
        echo "Dev server started (PID: $(cat "$PID_FILE"))"
        echo "URL: http://localhost:$PORT"
        echo "Logs: $LOG_FILE"
    else
        echo "Waiting for server to start..."
        echo "Check logs: ./dev.sh logs"
    fi
}

stop() {
    if [ ! -f "$PID_FILE" ]; then
        echo "No PID file found."
        if check_port; then
            echo "Found process on port $PORT, killing..."
            kill $(lsof -t -i:$PORT) 2>/dev/null
            pkill -f "react-scripts start" 2>/dev/null
            echo "Stopped"
        else
            echo "Server not running"
        fi
        exit 0
    fi

    PID=$(cat "$PID_FILE")
    echo "Stopping dev server (PID: $PID)..."
    kill "$PID" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    rm -f "$PID_FILE"
    sleep 1
    
    if check_port; then
        echo "Force killing port $PORT..."
        kill $(lsof -t -i:$PORT) 2>/dev/null
    fi
    echo "Dev server stopped"
}

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "Running (PID: $PID)"
            echo "URL: http://localhost:$PORT"
            return
        fi
    fi
    
    if check_port; then
        echo "Port $PORT in use (not started by this script)"
        lsof -Pi :$PORT -sTCP:LISTEN
    else
        echo "Not running"
    fi
}

logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        echo "No log file found"
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start dev server (port $PORT)"
        echo "  stop    - Stop dev server"
        echo "  restart - Restart dev server"
        echo "  status  - Check server status"
        echo "  logs    - Tail log file"
        exit 1
        ;;
esac
