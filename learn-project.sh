#!/bin/bash

# Project Learning Script for AI Assistant
# This script helps analyze and document the Social Tippster project structure

echo "🧠 Social Tippster Project Learning System"
echo "=========================================="
echo "Date: $(date)"
echo ""

# Function to check if Docker is running
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        return 1
    fi

    if ! docker info &> /dev/null; then
        echo "❌ Docker is not running"
        return 1
    fi

    echo "✅ Docker is running"
    return 0
}

# Function to analyze project structure
analyze_structure() {
    echo "📁 Project Structure Analysis"
    echo "----------------------------"

    # Check main directories
    directories=("frontend_new" "backend_new" "docs" "tests")
    for dir in "${directories[@]}"; do
        if [ -d "$dir" ]; then
            echo "✅ $dir/ exists"
            case $dir in
                "frontend_new")
                    if [ -f "$dir/package.json" ]; then
                        echo "   📦 Next.js $(grep '"next"' $dir/package.json | cut -d'"' -f4) detected"
                    fi
                    ;;
                "backend_new")
                    echo "   🐳 Microservices detected:"
                    ls $dir/services/ 2>/dev/null | sed 's/^/      - /'
                    ;;
                "docs")
                    echo "   📚 Documentation structure:"
                    find $dir -maxdepth 2 -type d | sed 's/^/      /'
                    ;;
            esac
        else
            echo "❌ $dir/ missing"
        fi
    done
    echo ""
}

# Function to check Docker services
check_services() {
    echo "🐳 Docker Services Analysis"
    echo "---------------------------"

    cd backend_new 2>/dev/null || {
        echo "❌ Cannot access backend_new directory"
        return 1
    }

    if [ -f "docker-compose.yml" ]; then
        echo "✅ Docker Compose configuration found"

        # Count services
        service_count=$(grep -c "^  [a-zA-Z].*:$" docker-compose.yml)
        echo "   📊 Total services: $service_count"

        # List key services
        echo "   🔑 Key services:"
        grep "^  [a-zA-Z].*:$" docker-compose.yml | grep -E "(gateway|frontend|auth)" | sed 's/:$//' | sed 's/^/      - /'

        # Check for dev variants
        dev_services=$(grep -c "_dev:$" docker-compose.yml)
        echo "   🛠️ Development services: $dev_services"

    else
        echo "❌ docker-compose.yml not found"
    fi

    cd ..
    echo ""
}

# Function to check running containers
check_running() {
    echo "🚀 Running Services Status"
    echo "-------------------------"

    if check_docker; then
        running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -v "NAMES")

        if [ -z "$running_containers" ]; then
            echo "   ℹ️ No containers currently running"
        else
            echo "   🟢 Running containers:"
            echo "$running_containers" | sed 's/^/      /'
        fi
    fi
    echo ""
}

# Function to analyze package.json files
analyze_dependencies() {
    echo "📦 Technology Stack Analysis"
    echo "----------------------------"

    # Frontend dependencies
    if [ -f "frontend_new/package.json" ]; then
        echo "🎨 Frontend (frontend_new):"
        echo "   Framework: $(grep '"next"' frontend_new/package.json | cut -d'"' -f4 | sed 's/^/Next.js /')"
        echo "   React: $(grep '"react"' frontend_new/package.json | cut -d'"' -f4)"
        echo "   TypeScript: $(grep '"typescript"' frontend_new/package.json | cut -d'"' -f4)"

        # Key libraries
        echo "   Key libraries:"
        key_libs=("tailwindcss" "zustand" "axios" "next-themes" "lucide-react")
        for lib in "${key_libs[@]}"; do
            version=$(grep "\"$lib\"" frontend_new/package.json | cut -d'"' -f4)
            if [ ! -z "$version" ]; then
                echo "      - $lib: $version"
            fi
        done
    fi

    # Check if backend services have package.json
    if [ -d "backend_new/services" ]; then
        echo ""
        echo "🔧 Backend Services:"
        for service_dir in backend_new/services/*/; do
            service_name=$(basename "$service_dir")
            if [ -f "$service_dir/package.json" ]; then
                echo "   ✅ $service_name"
            else
                echo "   ❌ $service_name (no package.json)"
            fi
        done
    fi
    echo ""
}

# Function to check key configuration files
check_configs() {
    echo "⚙️ Configuration Files Check"
    echo "----------------------------"

    configs=(
        "frontend_new/next.config.ts:Next.js Config"
        "frontend_new/tailwind.config.js:TailwindCSS Config"
        "frontend_new/components.json:shadcn/ui Config"
        "backend_new/docker-compose.yml:Docker Compose"
        "tsconfig.json:Root TypeScript Config"
        "package.json:Root Package Config"
    )

    for config in "${configs[@]}"; do
        file=$(echo $config | cut -d':' -f1)
        name=$(echo $config | cut -d':' -f2)

        if [ -f "$file" ]; then
            echo "✅ $name"
        else
            echo "❌ $name (missing: $file)"
        fi
    done
    echo ""
}

# Function to generate learning summary
generate_summary() {
    echo "📋 Learning Summary"
    echo "------------------"
    echo "Project Type: Sports Betting/Tipping Platform"
    echo "Architecture: Microservices with Docker"
    echo "Frontend: Next.js 15 + TypeScript + TailwindCSS"
    echo "Backend: NestJS Microservices"
    echo "Database: PostgreSQL (one per service)"
    echo "Infrastructure: Redis + RabbitMQ"
    echo ""
    echo "🎯 Key Learning Points:"
    echo "- Use frontend_new/ and backend_new/ (active)"
    echo "- All services are containerized"
    echo "- API Gateway pattern implemented"
    echo "- Each microservice has its own database"
    echo "- Development environment has hot-reload"
    echo "- Theme system supports light/dark modes"
    echo ""
    echo "🚀 Quick Start Command:"
    echo "   cd backend_new && docker-compose up -d"
    echo ""
}

# Main execution
main() {
    analyze_structure
    check_configs
    analyze_dependencies
    check_services
    check_running
    generate_summary

    echo "💾 Learning complete! Data saved to:"
    echo "   - docs/PROJECT_MEMORY_SYSTEM.md"
    echo "   - docs/DOCKER_QUICK_REFERENCE.md"
    echo ""
    echo "🔄 Run this script anytime to refresh project knowledge"
}

# Execute main function
main
