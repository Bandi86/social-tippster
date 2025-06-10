#!/bin/bash

# Docker service health check script
echo "🚀 Starting Docker services health check..."
echo "==========================================="

cd /c/Users/bandi/Documents/code/social-tippster/social-tippster/backend_new

# Expected services and their ports
declare -A SERVICES=(
    ["postgres_api_gateway"]="5433"
    ["postgres_auth"]="5434"
    ["postgres_user"]="5435"
    ["postgres_post"]="5436"
    ["postgres_stats"]="5437"
    ["postgres_tipp"]="5438"
    ["postgres_notifications"]="5439"
    ["postgres_chat"]="5440"
    ["postgres_data"]="5441"
    ["postgres_image"]="5442"
    ["postgres_live"]="5443"
    ["postgres_log"]="5444"
    ["postgres_admin"]="5445"
    ["redis"]="6379"
    ["rabbitmq"]="5672"
)

declare -A API_SERVICES=(
    ["api-gateway"]="3000"
    ["auth"]="3001"
    ["user"]="3003"
    ["post"]="3004"
    ["stats"]="3005"
    ["tipp"]="3006"
    ["notifications"]="3007"
    ["chat"]="3008"
    ["data"]="3009"
    ["image"]="3010"
    ["live"]="3011"
    ["log"]="3012"
    ["admin"]="3013"
)

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    exit 1
fi

echo "✅ Docker Compose file found"
echo ""

# Function to check if a port is open
check_port() {
    local port=$1
    local service=$2

    # Use netstat to check if port is listening
    if netstat -an | grep -q ":$port.*LISTENING"; then
        echo "✅ $service (port $port) - RUNNING"
        return 0
    else
        echo "❌ $service (port $port) - NOT RUNNING"
        return 1
    fi
}

# Function to check service health endpoint
check_health() {
    local port=$1
    local service=$2

    # Try to curl the health endpoint
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "✅ $service health endpoint - HEALTHY"
        return 0
    elif curl -s "http://localhost:$port/api/health" > /dev/null 2>&1; then
        echo "✅ $service health endpoint - HEALTHY"
        return 0
    else
        echo "⚠️  $service health endpoint - NOT RESPONDING"
        return 1
    fi
}

echo "🔍 Checking infrastructure services..."
echo "====================================="

for service in "${!SERVICES[@]}"; do
    port="${SERVICES[$service]}"
    check_port "$port" "$service"
done

echo ""
echo "🔍 Checking API microservices..."
echo "==============================="

for service in "${!API_SERVICES[@]}"; do
    port="${API_SERVICES[$service]}"
    check_port "$port" "$service"
done

echo ""
echo "🔍 Checking health endpoints..."
echo "============================="

for service in "${!API_SERVICES[@]}"; do
    port="${API_SERVICES[$service]}"
    check_health "$port" "$service"
done

echo ""
echo "🔍 Checking Docker container status..."
echo "===================================="

if command -v docker &> /dev/null; then
    # Get container status
    running_containers=$(docker compose ps --services --filter "status=running" 2>/dev/null | wc -l)
    total_containers=$(docker compose ps --services 2>/dev/null | wc -l)

    echo "Running containers: $running_containers/$total_containers"

    if [ "$running_containers" -gt 0 ]; then
        echo "✅ Some containers are running"
        echo ""
        echo "Running services:"
        docker compose ps --filter "status=running" 2>/dev/null || echo "Could not get container status"
    else
        echo "❌ No containers are running"
        echo ""
        echo "💡 To start the services, run:"
        echo "   docker compose up --build"
        echo ""
        echo "   For development with hot reload:"
        echo "   docker compose up --build api-gateway_dev auth_dev user_dev post_dev stats_dev tipp_dev notifications_dev chat_dev data_dev image_dev live_dev log_dev admin_dev frontend_new_dev"
    fi
else
    echo "⚠️  Docker command not found"
fi

echo ""
echo "🎯 Quick Start Commands"
echo "======================"
echo ""
echo "# Start all infrastructure (databases, redis, rabbitmq):"
echo "docker compose up -d redis rabbitmq postgres_api_gateway postgres_auth postgres_user postgres_post postgres_stats postgres_tipp postgres_notifications postgres_chat postgres_data postgres_image postgres_live postgres_log postgres_admin"
echo ""
echo "# Start all API services in development mode:"
echo "docker compose up --build api-gateway_dev auth_dev user_dev post_dev stats_dev tipp_dev notifications_dev chat_dev data_dev image_dev live_dev log_dev admin_dev"
echo ""
echo "# Start frontend in development mode:"
echo "docker compose up --build frontend_new_dev"
echo ""
echo "# Start everything at once:"
echo "docker compose up --build"
echo ""
echo "# Check logs:"
echo "docker compose logs -f [service-name]"
echo ""
echo "# Stop everything:"
echo "docker compose down"
