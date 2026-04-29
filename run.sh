#!/bin/bash
set -e

echo "=========================================="
echo "FinSight Platform - Starting Services"
echo "=========================================="

command -v docker >/dev/null 2>&1 || {
    echo "Error: Docker is not installed"
    exit 1
}

command -v docker-compose >/dev/null 2>&1 || {
    echo "Error: docker-compose is not installed"
    exit 1
}

echo "[1/4] Building Docker images..."
docker-compose build --parallel

echo "[2/4] Starting services..."
docker-compose up -d

echo "[3/4] Waiting for services to be healthy..."

sleep 10

for service in postgres redis auth-service project-service forecasting-service assistant-service frontend; do
    echo "Checking $service..."
    for i in {1..30}; do
        if docker-compose ps $service | grep -q "(healthy)"; then
            echo "$service is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "Warning: $service may not be fully healthy yet"
        fi
        sleep 2
    done
done

echo "[4/4] Checking service status..."
docker-compose ps

echo ""
echo "=========================================="
echo "FinSight Platform is running!"
echo "=========================================="
echo "Frontend:      http://localhost:3000"
echo "Auth Service:  http://localhost:8001"
echo "Project Svc:   http://localhost:8002"
echo "Forecast Svc:  http://localhost:8003"
echo "Assistant Svc: http://localhost:8004"
echo "Airflow:       http://localhost:8080"
echo ""
echo "Default credentials:"
echo "  Email:    admin@finsight.com"
echo "  Password: admin123"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f [service]"
echo "=========================================="
