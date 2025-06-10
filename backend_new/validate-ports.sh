#!/bin/bash

# Port validation script for Social Tippster microservices
echo "🔍 Validating port configurations..."
echo "========================================"

cd backend_new

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    exit 1
fi

echo "✅ Docker Compose file found"

# Expected ports for each service
declare -A EXPECTED_PORTS=(
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

echo ""
echo "🔍 Checking docker-compose.yml port mappings..."
echo "================================================="

# Check production services
for service in "${!EXPECTED_PORTS[@]}"; do
    expected_port="${EXPECTED_PORTS[$service]}"

    # Extract port mapping from docker-compose.yml
    port_mapping=$(grep -A 20 "^  $service:" docker-compose.yml | grep "ports:" -A 1 | tail -1 | grep -o "'[0-9]*:[0-9]*'" | head -1)

    if [[ $port_mapping =~ \'([0-9]+):([0-9]+)\' ]]; then
        host_port="${BASH_REMATCH[1]}"
        container_port="${BASH_REMATCH[2]}"

        if [ "$host_port" = "$expected_port" ] && [ "$container_port" = "$expected_port" ]; then
            echo "✅ $service: $host_port:$container_port (correct)"
        else
            echo "❌ $service: $host_port:$container_port (expected $expected_port:$expected_port)"
        fi
    else
        echo "⚠️  $service: Port mapping not found or invalid format"
    fi
done

echo ""
echo "🔍 Checking development services..."
echo "=================================="

# Check dev services
for service in "${!EXPECTED_PORTS[@]}"; do
    expected_port="${EXPECTED_PORTS[$service]}"
    dev_service="${service}_dev"

    # Extract port mapping from docker-compose.yml for dev services
    port_mapping=$(grep -A 20 "^  $dev_service:" docker-compose.yml | grep "ports:" -A 1 | tail -1 | grep -o "'[0-9]*:[0-9]*'" | head -1)

    if [[ $port_mapping =~ \'([0-9]+):([0-9]+)\' ]]; then
        host_port="${BASH_REMATCH[1]}"
        container_port="${BASH_REMATCH[2]}"

        if [ "$host_port" = "$expected_port" ] && [ "$container_port" = "$expected_port" ]; then
            echo "✅ $dev_service: $host_port:$container_port (correct)"
        else
            echo "❌ $dev_service: $host_port:$container_port (expected $expected_port:$expected_port)"
        fi
    else
        echo "⚠️  $dev_service: Port mapping not found or invalid format"
    fi
done

echo ""
echo "🔍 Checking PORT environment variables..."
echo "========================================"

# Check if PORT env variables are set correctly
for service in "${!EXPECTED_PORTS[@]}"; do
    expected_port="${EXPECTED_PORTS[$service]}"

    # Check production service
    port_env=$(grep -A 15 "^  $service:" docker-compose.yml | grep "PORT:" | grep -o "PORT: [0-9]*" | head -1)
    if [[ $port_env =~ PORT:\ ([0-9]+) ]]; then
        env_port="${BASH_REMATCH[1]}"
        if [ "$env_port" = "$expected_port" ]; then
            echo "✅ $service PORT env: $env_port (correct)"
        else
            echo "❌ $service PORT env: $env_port (expected $expected_port)"
        fi
    else
        echo "⚠️  $service: PORT environment variable not found"
    fi

    # Check dev service
    dev_service="${service}_dev"
    port_env_dev=$(grep -A 15 "^  $dev_service:" docker-compose.yml | grep "PORT:" | grep -o "PORT: [0-9]*" | head -1)
    if [[ $port_env_dev =~ PORT:\ ([0-9]+) ]]; then
        env_port_dev="${BASH_REMATCH[1]}"
        if [ "$env_port_dev" = "$expected_port" ]; then
            echo "✅ $dev_service PORT env: $env_port_dev (correct)"
        else
            echo "❌ $dev_service PORT env: $env_port_dev (expected $expected_port)"
        fi
    else
        echo "⚠️  $dev_service: PORT environment variable not found"
    fi
done

echo ""
echo "🔍 Checking main.ts default ports..."
echo "==================================="

# Check main.ts files for correct default ports
for service in "${!EXPECTED_PORTS[@]}"; do
    expected_port="${EXPECTED_PORTS[$service]}"
    main_file="services/$service/src/main.ts"

    if [ -f "$main_file" ]; then
        # Extract default port from main.ts
        default_port=$(grep "process.env.PORT || " "$main_file" | grep -o "|| [0-9]*" | grep -o "[0-9]*" | head -1)

        if [ "$default_port" = "$expected_port" ]; then
            echo "✅ $service main.ts: default port $default_port (correct)"
        else
            echo "❌ $service main.ts: default port $default_port (expected $expected_port)"
        fi
    else
        echo "⚠️  $service: main.ts not found at $main_file"
    fi
done

echo ""
echo "🎯 Summary"
echo "=========="
echo "Port validation completed!"
echo ""
echo "Next steps:"
echo "1. Fix any ❌ issues found above"
echo "2. Run: docker compose up --build"
echo "3. Test services at their assigned ports"
