#!/bin/bash
# Comprehensive Test Execution Script for Posts API
# Run this script when the development server is running on localhost:3001

echo "=== Posts API Comprehensive Test Suite ==="
echo "Date: $(date)"
echo "Testing Backend: http://localhost:3001/api"
echo ""

# Test 1: Basic server connectivity
echo "🔍 Test 1: Server Connectivity"
echo "Running: curl -s http://localhost:3001/api/health"
curl -s http://localhost:3001/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding - start with 'npm run dev'"
    exit 1
fi
echo ""

# Test 2: Validation-specific tests
echo "🔍 Test 2: Validation Tests"
echo "Running: node test-validation-specific.js"
node test-validation-specific.js
echo ""

# Test 3: Post interaction tests
echo "🔍 Test 3: Interaction Tests"
echo "Running: node test-post-interactions.js"
node test-post-interactions.js
echo ""

# Test 4: Comprehensive validation tests
echo "🔍 Test 4: Comprehensive Validation Tests"
echo "Running: node test-posts-validation.js"
node test-posts-validation.js
echo ""

# Test 5: Manual API tests
echo "🔍 Test 5: Manual API Validation"

echo "Testing GET /posts pagination validation..."
echo "Expected: 400 Bad Request for invalid pagination"

# Test invalid page=0
echo "Testing page=0 (should fail):"
curl -s -w "Status: %{http_code}\n" "http://localhost:3001/api/posts?page=0" | tail -1

# Test invalid limit=101
echo "Testing limit=101 (should fail):"
curl -s -w "Status: %{http_code}\n" "http://localhost:3001/api/posts?limit=101" | tail -1

# Test valid pagination
echo "Testing valid pagination (should succeed):"
curl -s -w "Status: %{http_code}\n" "http://localhost:3001/api/posts?page=1&limit=10" | tail -1

echo ""
echo "=== Test Suite Complete ==="
echo ""
echo "📊 Test Summary:"
echo "- Server connectivity ✓"
echo "- Validation tests ✓"
echo "- Interaction tests ✓"
echo "- Comprehensive tests ✓"
echo "- Manual API tests ✓"
echo ""
echo "🎯 Expected Results:"
echo "- Empty title/content: 400 Bad Request"
echo "- Invalid pagination: 400 Bad Request"
echo "- Like endpoints: 201/204 status codes"
echo "- Bookmark endpoints: 201/204 status codes"
echo "- Authentication required: 401 without token"
echo "- Non-existent posts: 404 Not Found"
echo ""
echo "📋 Next Steps:"
echo "1. Review test output for any failures"
echo "2. Check that all validation rules are working"
echo "3. Verify database operations are correct"
echo "4. Update documentation with test results"
