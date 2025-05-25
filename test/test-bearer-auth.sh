#!/bin/bash

# Test script to verify Bearer token authentication for admin endpoints

BASE_URL="http://localhost:3001/api"

echo "🔐 Testing Bearer Token Authentication for Admin Endpoints"
echo ""

# Step 1: Register/Login to get access token
echo "1. Attempting to register a test user..."

# Try to register a user
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "testuser123@test.com",
    "password": "Test123!"
  }')

echo "Register response: $REGISTER_RESPONSE"

# Extract access token from response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "   Registration failed, attempting login..."

  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser123@test.com",
      "password": "Test123!"
    }')

  echo "Login response: $LOGIN_RESPONSE"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
fi

if [ -n "$ACCESS_TOKEN" ]; then
  echo "✅ Access token obtained: ${ACCESS_TOKEN:0:20}..."
else
  echo "❌ Failed to get access token"
  exit 1
fi

echo ""

# Step 2: Test admin endpoint with Bearer token
echo "2. Testing admin endpoint with Bearer token..."

ADMIN_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" -X GET "$BASE_URL/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$ADMIN_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$ADMIN_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "   HTTP Status: $HTTP_STATUS"
echo "   Response: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Admin endpoint accessible with Bearer token"
elif [ "$HTTP_STATUS" = "403" ]; then
  echo "⚠️  Access forbidden - user may not have admin privileges (this is expected for regular users)"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "❌ Authentication failed - Bearer token may be invalid"
else
  echo "❌ Unexpected response status: $HTTP_STATUS"
fi

echo ""

# Step 3: Test without Bearer token (should fail)
echo "3. Testing admin endpoint without Bearer token (should fail)..."

NO_TOKEN_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" -X GET "$BASE_URL/admin/users" \
  -H "Content-Type: application/json")

NO_TOKEN_HTTP_STATUS=$(echo "$NO_TOKEN_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d':' -f2)
NO_TOKEN_RESPONSE_BODY=$(echo "$NO_TOKEN_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "   HTTP Status: $NO_TOKEN_HTTP_STATUS"
echo "   Response: $NO_TOKEN_RESPONSE_BODY"

if [ "$NO_TOKEN_HTTP_STATUS" = "401" ]; then
  echo "✅ Admin endpoint correctly rejected request without Bearer token"
else
  echo "❌ Admin endpoint should have rejected request without Bearer token"
fi

echo ""

# Step 4: Test with invalid Bearer token (should fail)
echo "4. Testing admin endpoint with invalid Bearer token (should fail)..."

INVALID_TOKEN_RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" -X GET "$BASE_URL/admin/users" \
  -H "Authorization: Bearer invalid_token_123" \
  -H "Content-Type: application/json")

INVALID_TOKEN_HTTP_STATUS=$(echo "$INVALID_TOKEN_RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d':' -f2)
INVALID_TOKEN_RESPONSE_BODY=$(echo "$INVALID_TOKEN_RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "   HTTP Status: $INVALID_TOKEN_HTTP_STATUS"
echo "   Response: $INVALID_TOKEN_RESPONSE_BODY"

if [ "$INVALID_TOKEN_HTTP_STATUS" = "401" ]; then
  echo "✅ Admin endpoint correctly rejected invalid Bearer token"
else
  echo "❌ Admin endpoint should have rejected invalid Bearer token"
fi

echo ""
echo "🎉 Bearer token authentication test completed!"
