#!/bin/bash

echo "Testing Social Tippster Backend API..."

# Test if the application is running
echo "Testing application health..."
curl -f http://localhost:3001/ || echo "Application not running on port 3001"

# Test Auth endpoints
echo -e "\n\nTesting auth endpoints..."

# Test registration
echo "Testing user registration..."
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }' || echo "Registration endpoint not available"

# Test login
echo -e "\n\nTesting user login..."
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' || echo "Login endpoint not available"

# Test users endpoints
echo -e "\n\nTesting users endpoints..."
curl -f http://localhost:3001/users || echo "Users endpoint not available"

echo -e "\n\nAPI tests completed!"
