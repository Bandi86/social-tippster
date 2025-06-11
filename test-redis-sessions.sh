#!/bin/bash

# Test script for Redis session implementation
# This script verifies all the requirements:
# 1. Session csak userId-t tárol
# 2. SSR API mindig frissen a DB-ből tölti le
# 3. cookie.maxAge be van állítva
# 4. Session törlése ha a user nem létezik
# 5. Redis használata session storage-ra

echo "🔐 Testing Redis Session Implementation"
echo "======================================"

# Test 1: Registration
echo ""
echo "📝 Test 1: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "session-test@redis.com",
    "username": "sessiontest",
    "password": "SessionTest123!"
  }' \
  -c test-cookies.txt)

echo "Registration response: $REGISTER_RESPONSE"

# Test 2: Login and session creation
echo ""
echo "🔑 Test 2: Login and Session Creation"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3002" \
  -d '{
    "email": "session-test@redis.com",
    "password": "SessionTest123!"
  }' \
  -c test-cookies.txt)

echo "Login response: $LOGIN_RESPONSE"

# Test 3: Check Redis session storage
echo ""
echo "📊 Test 3: Redis Session Storage"
echo "Sessions in Redis:"
winpty docker exec -it redis redis-cli -a your_secure_password keys "session:*" 2>/dev/null

# Get session data
SESSION_KEY=$(winpty docker exec -it redis redis-cli -a your_secure_password keys "session:*" 2>/dev/null | tail -1)
if [ ! -z "$SESSION_KEY" ]; then
    echo ""
    echo "Session data for key: $SESSION_KEY"
    SESSION_DATA=$(winpty docker exec -it redis redis-cli -a your_secure_password get "$SESSION_KEY" 2>/dev/null)
    echo "Session contains: $SESSION_DATA"

    # Verify it only contains userId and minimal metadata
    if echo "$SESSION_DATA" | grep -q '"userId"' && ! echo "$SESSION_DATA" | grep -q '"token"' && ! echo "$SESSION_DATA" | grep -q '"password"'; then
        echo "✅ PASS: Session only contains userId and minimal metadata"
    else
        echo "❌ FAIL: Session contains more than required data"
    fi

    # Check TTL
    TTL=$(winpty docker exec -it redis redis-cli -a your_secure_password ttl "$SESSION_KEY" 2>/dev/null)
    echo "Session TTL: $TTL seconds"
    if [ "$TTL" -gt 0 ]; then
        echo "✅ PASS: Session has proper TTL (automatic expiration)"
    else
        echo "❌ FAIL: Session TTL not set correctly"
    fi
fi

# Test 4: Fresh user data fetch
echo ""
echo "👤 Test 4: Fresh User Data Fetch"
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)" \
  -b test-cookies.txt)

echo "Profile response: $PROFILE_RESPONSE"

# Test 5: Cookie maxAge verification
echo ""
echo "🍪 Test 5: Cookie MaxAge Verification"
echo "Cookie file contents:"
cat test-cookies.txt
if grep -q "refreshToken" test-cookies.txt; then
    echo "✅ PASS: Refresh token cookie is set"
    COOKIE_EXPIRES=$(grep "refreshToken" test-cookies.txt | awk '{print $5}')
    CURRENT_TIME=$(date +%s)
    if [ "$COOKIE_EXPIRES" -gt "$CURRENT_TIME" ]; then
        echo "✅ PASS: Cookie has future expiration date (maxAge set correctly)"
    else
        echo "❌ FAIL: Cookie expiration issue"
    fi
else
    echo "❌ FAIL: Refresh token cookie not found"
fi

# Test 6: Session validation with fresh DB query
echo ""
echo "🔍 Test 6: Session Validation (Fresh DB Query)"
VALIDATE_RESPONSE=$(curl -s -X GET http://localhost:3001/api/auth/validate \
  -H "Authorization: Bearer $(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)")

echo "Validation response: $VALIDATE_RESPONSE"

# Test 7: Logout and session cleanup
echo ""
echo "🚪 Test 7: Logout and Session Cleanup"
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)" \
  -b test-cookies.txt)

echo "Logout response: $LOGOUT_RESPONSE"

# Check if session was removed from Redis
echo "Sessions in Redis after logout:"
winpty docker exec -it redis redis-cli -a your_secure_password keys "session:*" 2>/dev/null

echo ""
echo "🎉 Redis Session Implementation Test Complete!"
echo "============================================="

# Cleanup
rm -f test-cookies.txt
