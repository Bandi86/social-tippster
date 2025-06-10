#!/bin/bash

# MCP DevTools Server Diagnostics Script
# This script helps diagnose MCP connection issues

echo "🔍 MCP DevTools Server Diagnostics"
echo "=================================="
echo

# Check if server is running
echo "1. Checking if DevTools MCP server is running..."
if curl -s http://localhost:3033/api/health > /dev/null 2>&1; then
    echo "✅ DevTools MCP server is running on port 3033"
else
    echo "❌ DevTools MCP server is NOT running on port 3033"
    echo "   Try starting it with: node devtools-mcp-server-optimized.js"
    exit 1
fi

echo

# Check MCP endpoints
echo "2. Testing MCP endpoints..."

# Test tools endpoint
echo "   - Testing /api/mcp/tools..."
TOOLS_RESPONSE=$(curl -s http://localhost:3033/api/mcp/tools)
TOOLS_COUNT=$(echo $TOOLS_RESPONSE | jq -r '.totalTools // 0' 2>/dev/null || echo "0")
echo "     Found $TOOLS_COUNT tools"

# Test resources endpoint
echo "   - Testing /api/mcp/resources..."
RESOURCES_RESPONSE=$(curl -s http://localhost:3033/api/mcp/resources)
RESOURCES_COUNT=$(echo $RESOURCES_RESPONSE | jq -r '.totalResources // 0' 2>/dev/null || echo "0")
echo "     Found $RESOURCES_COUNT resources"

# Test server info
echo "   - Testing /api/mcp/server-info..."
SERVER_INFO=$(curl -s http://localhost:3033/api/mcp/server-info)
SERVER_NAME=$(echo $SERVER_INFO | jq -r '.name // "Unknown"' 2>/dev/null || echo "Unknown")
echo "     Server: $SERVER_NAME"

echo

# Test MCP protocol request
echo "3. Testing MCP protocol request..."
MCP_REQUEST='{"method":"tools/list","params":{},"id":"test-1"}'
MCP_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$MCP_REQUEST" \
  http://localhost:3033/api/mcp/request)

if echo $MCP_RESPONSE | jq . > /dev/null 2>&1; then
    RESULT_TOOLS=$(echo $MCP_RESPONSE | jq -r '.result.tools | length' 2>/dev/null || echo "0")
    echo "✅ MCP protocol request successful - returned $RESULT_TOOLS tools"
else
    echo "❌ MCP protocol request failed"
    echo "   Response: $MCP_RESPONSE"
fi

echo

# Check for potential issues
echo "4. Checking for potential issues..."

# Check for rate limiting
echo "   - Testing rate limiting (rapid requests)..."
for i in {1..5}; do
    curl -s http://localhost:3033/api/mcp/tools > /dev/null
done
RATE_TEST=$(curl -s http://localhost:3033/api/mcp/tools | jq -r '.cached // false' 2>/dev/null || echo "false")
if [ "$RATE_TEST" = "true" ]; then
    echo "✅ Rate limiting and caching working correctly"
else
    echo "⚠️  Rate limiting may not be working"
fi

echo

# Check WebSocket health
echo "5. Checking WebSocket health..."
WS_HEALTH=$(curl -s http://localhost:3033/api/websocket/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ WebSocket service is healthy"
else
    echo "⚠️  WebSocket service may have issues"
fi

echo

# Show recommendations
echo "6. Recommendations for VS Code MCP setup:"
echo "   - Use the optimized server script: node devtools-mcp-server-optimized.js"
echo "   - Set timeout to at least 30 seconds in VS Code MCP settings"
echo "   - Use stdio transport, not WebSocket for MCP in VS Code"
echo "   - Ensure server is fully started before connecting VS Code"

echo

echo "🏁 Diagnostics complete!"
echo "If you're still experiencing 'discovering tools' loops:"
echo "1. Stop VS Code completely"
echo "2. Restart the MCP server with: node devtools-mcp-server-optimized.js"
echo "3. Wait for server to fully start (see all endpoints logged)"
echo "4. Start VS Code and try the MCP connection again"
