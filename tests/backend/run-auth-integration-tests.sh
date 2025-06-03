#!/bin/bash

echo "🚀 Starting Authentication System Integration Tests..."
echo "=================================================="

# Set environment
export NODE_ENV=test

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if backend dependencies are installed
print_status "Checking backend dependencies..."
if [ ! -d "backend/node_modules" ]; then
    print_warning "Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
    if [ $? -ne 0 ]; then
        print_error "Failed to install backend dependencies"
        exit 1
    fi
fi

# Check if root dependencies are installed
print_status "Checking root dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "Root dependencies not found. Installing..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install root dependencies"
        exit 1
    fi
fi

# Install additional test dependencies if needed
print_status "Installing test dependencies..."
npm install --save-dev @nestjs/testing supertest ts-jest @types/supertest

# Create test database directory if needed
mkdir -p tests/temp
mkdir -p tests/coverage

# Check if backend is running (optional - tests will use in-memory database)
print_status "Checking if backend services are available..."
curl -s http://localhost:3001/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Backend service is running"
else
    print_warning "Backend service not running - tests will use in-memory database"
fi

# Run the authentication integration tests
print_status "Running authentication integration tests..."
echo ""

npx jest --config=tests/backend/jest.auth-integration.config.js --verbose --coverage --detectOpenHandles --forceExit

# Check if tests passed
if [ $? -eq 0 ]; then
    print_success "✅ All authentication integration tests passed!"
    echo ""
    print_status "📊 Coverage report available in tests/coverage/auth-integration/"
    echo ""
    print_status "📋 Test Summary:"
    echo "   - User Registration Tests: ✅"
    echo "   - User Login Tests: ✅"
    echo "   - Protected Routes Tests: ✅"
    echo "   - Token Refresh Tests: ✅"
    echo "   - Logout Tests: ✅"
    echo "   - Logout All Devices Tests: ✅"
    echo "   - Data Integrity Tests: ✅"
    echo "   - JWT Token Validation Tests: ✅"
    echo "   - User State Management Tests: ✅"
    echo "   - Analytics and Tracking Tests: ✅"
    echo ""
    print_success "🎉 Authentication system is working correctly!"
else
    print_error "❌ Some authentication tests failed. Please check the output above."
    echo ""
    print_status "🔍 Common issues to check:"
    echo "   - Backend modules are properly configured"
    echo "   - Database entities are correctly defined"
    echo "   - JWT secrets are properly set"
    echo "   - All dependencies are installed"
    echo ""
    exit 1
fi

# Cleanup temporary files
print_status "Cleaning up temporary files..."
rm -rf tests/temp/*

echo ""
print_success "Authentication test suite completed successfully! 🎯"
