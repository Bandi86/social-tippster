#!/usr/bin/env node
// test-mcp-protocol.js - Test MCP Protocol Communication
import { spawn } from 'child_process';

console.log('🧪 Testing MCP Protocol Communication...');

// Start the MCP server
const mcpServer = spawn('node', ['devtools-mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

// Setup timeout
const timeout = setTimeout(() => {
  console.log('❌ Test timeout after 30 seconds');
  mcpServer.kill();
  process.exit(1);
}, 30000);

// Handle server stderr (debug output)
mcpServer.stderr.on('data', data => {
  console.log('📝 Server log:', data.toString().trim());
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0',
    },
  },
};

console.log('📤 Sending initialize request...');
mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

// Handle server response
mcpServer.stdout.on('data', data => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log('📥 Server response:', JSON.stringify(response, null, 2));

    if (response.id === 1 && response.result) {
      console.log('✅ Initialize successful! Server is MCP-compliant.');

      // Test tools list
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      };

      console.log('📤 Sending tools/list request...');
      mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
    } else if (response.id === 2 && response.result) {
      console.log(`✅ Tools list successful! Found ${response.result.tools?.length || 0} tools.`);
      console.log('🎉 MCP Protocol test completed successfully!');

      clearTimeout(timeout);
      mcpServer.kill();
      process.exit(0);
    }
  } catch (error) {
    console.log('❌ Failed to parse server response:', data.toString());
  }
});

mcpServer.on('close', code => {
  console.log(`🔚 MCP server exited with code ${code}`);
  clearTimeout(timeout);
});

mcpServer.on('error', error => {
  console.error('❌ MCP server error:', error.message);
  clearTimeout(timeout);
  process.exit(1);
});
