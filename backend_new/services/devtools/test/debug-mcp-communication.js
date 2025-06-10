#!/usr/bin/env node
// debug-mcp-communication.js - Debug MCP Protocol Communication
import { spawn } from 'child_process';

console.log('🔍 Debugging MCP Protocol Communication...');

// Start the MCP server
const mcpServer = spawn('node', ['devtools-mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

// Handle server stderr (debug output)
mcpServer.stderr.on('data', data => {
  const message = data.toString().trim();
  console.log('📝 [SERVER LOG]:', message);
});

// Handle server stdout (protocol responses)
mcpServer.stdout.on('data', data => {
  try {
    const responses = data.toString().trim().split('\n');
    responses.forEach(responseStr => {
      if (responseStr.trim()) {
        const response = JSON.parse(responseStr.trim());
        console.log('📥 [PROTOCOL RESPONSE]:', JSON.stringify(response, null, 2));
      }
    });
  } catch (error) {
    console.log('⚠️  [RAW OUTPUT]:', data.toString());
  }
});

// Send test initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'debug-client',
      version: '1.0.0',
    },
  },
};

console.log('📤 [SENDING INITIALIZE]:', JSON.stringify(initRequest, null, 2));
mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

// Wait for response and then test tools
setTimeout(() => {
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  };

  console.log('📤 [SENDING TOOLS LIST]:', JSON.stringify(toolsRequest, null, 2));
  mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 2000);

// Cleanup after 10 seconds
setTimeout(() => {
  console.log('🔚 Debug session complete');
  mcpServer.kill();
  process.exit(0);
}, 10000);

mcpServer.on('error', error => {
  console.error('❌ [SERVER ERROR]:', error.message);
});

mcpServer.on('close', code => {
  console.log(`🔚 [SERVER CLOSED] Exit code: ${code}`);
});
