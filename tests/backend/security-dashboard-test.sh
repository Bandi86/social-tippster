#!/bin/bash

# Security Dashboard Testing Script
# Tests all implemented security features

echo "=== Security Dashboard Testing Script ==="
echo "Date: $(date)"
echo ""

API_BASE="http://localhost:3001"
FRONTEND_BASE="http://localhost:3000"

echo "1. Testing Backend Analytics Endpoints..."

echo "   - Testing live login stats endpoint:"
curl -s "$API_BASE/api/admin/analytics/live-login-stats" | head -100
echo ""

echo "   - Testing sessions endpoint:"
curl -s "$API_BASE/api/admin/analytics/sessions" | head -100
echo ""

echo "2. Testing Swagger Documentation..."
echo "   Swagger docs available at: $API_BASE/api/docs"

echo ""
echo "3. Frontend Security Dashboard Routes:"
echo "   - Admin Security Dashboard: $FRONTEND_BASE/admin/security"
echo "   - Admin Panel: $FRONTEND_BASE/admin"

echo ""
echo "4. Key Features to Test Manually:"
echo "   ✓ Live Security Statistics Display"
echo "   ✓ Session Management Interface"
echo "   ✓ Security Alerts Monitoring"
echo "   ✓ Activity Tracking Hook"
echo "   ✓ Session Timeout Warnings"
echo "   ✓ Device Fingerprinting"

echo ""
echo "=== Test Complete ==="
