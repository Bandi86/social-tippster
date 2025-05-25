#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001/api"

echo -e "${BLUE}🔧 Creating Admin User for Social Tippster${NC}"
echo "=================================================="

# Admin user credentials
ADMIN_EMAIL="admin@socialtippster.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="AdminPassword123!"
ADMIN_FIRST_NAME="Admin"
ADMIN_LAST_NAME="User"

echo -e "\n${YELLOW}Step 1: Registering admin user...${NC}"

# Register the admin user
REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${ADMIN_EMAIL}"'",
    "username": "'"${ADMIN_USERNAME}"'",
    "password": "'"${ADMIN_PASSWORD}"'",
    "first_name": "'"${ADMIN_FIRST_NAME}"'",
    "last_name": "'"${ADMIN_LAST_NAME}"'"
  }')

echo "Register Response: ${REGISTER_RESPONSE}"

# Extract user ID and access token
ADMIN_USER_ID=$(echo "${REGISTER_RESPONSE}" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
ACCESS_TOKEN=$(echo "${REGISTER_RESPONSE}" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_USER_ID" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to register admin user or extract credentials${NC}"
    echo "Response: ${REGISTER_RESPONSE}"
    exit 1
fi

echo -e "${GREEN}✅ Admin user registered successfully${NC}"
echo "User ID: ${ADMIN_USER_ID}"
echo "Access Token: ${ACCESS_TOKEN:0:20}..."

echo -e "\n${YELLOW}Step 2: Promoting user to admin role...${NC}"

# Update user role to admin directly in database using psql
# First, let's try to connect to the database
DB_CONNECTION_STRING="postgresql://postgres:password@localhost:5432/socialtippster"

# Update the user role to admin
psql "${DB_CONNECTION_STRING}" -c "UPDATE users SET role = 'admin' WHERE user_id = '${ADMIN_USER_ID}';"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ User promoted to admin role successfully${NC}"
else
    echo -e "${RED}❌ Failed to promote user to admin role${NC}"
    echo "Trying alternative approach..."

    # Alternative: Try updating via API if we can make the current user admin temporarily
    echo "You may need to manually update the database:"
    echo "UPDATE users SET role = 'admin' WHERE user_id = '${ADMIN_USER_ID}';"
fi

echo -e "\n${YELLOW}Step 3: Verifying admin access...${NC}"

# Test admin endpoint access
ADMIN_TEST_RESPONSE=$(curl -s -X GET "${API_BASE}/admin/users/stats" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Admin Test Response: ${ADMIN_TEST_RESPONSE}"

if echo "${ADMIN_TEST_RESPONSE}" | grep -q '"total"'; then
    echo -e "${GREEN}✅ Admin access verified successfully${NC}"
else
    echo -e "${RED}❌ Admin access verification failed${NC}"
    echo "Response: ${ADMIN_TEST_RESPONSE}"
fi

echo -e "\n${BLUE}📋 Admin User Credentials:${NC}"
echo "=================================="
echo "Email: ${ADMIN_EMAIL}"
echo "Username: ${ADMIN_USERNAME}"
echo "Password: ${ADMIN_PASSWORD}"
echo "User ID: ${ADMIN_USER_ID}"
echo "Access Token: ${ACCESS_TOKEN}"

echo -e "\n${GREEN}🎉 Admin user creation process completed!${NC}"
echo "You can now login to the admin panel at: http://localhost:3000/admin"
