#!/usr/bin/env node
// debug-stdio.js - Debug stdio communication
import { spawn } from 'child_process';

console.log('🔍 Testing stdio communication with MCP server...');

const mcpServer = spawn('node', ['devtools-mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

let initializeSent = false;

mcpServer.stderr.on('data', data => {
  const message = data.toString().trim();
  console.log('📝 [SERVER]:', message);

  // Send initialize when server is ready
  if (message.includes('MCP Protocol Server fully initialized') && !initializeSent) {
    console.log('🚀 Server ready, sending initialize...');
    initializeSent = true;

    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' },
      },
    };

    console.log('📤 Sending:', JSON.stringify(initRequest));
    mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  }
});

mcpServer.stdout.on('data', data => {
  console.log('📥 [STDOUT]:', data.toString().trim());

  try {
    const response = JSON.parse(data.toString().trim());
    if (response.id === 1 && response.result) {
      console.log('✅ SUCCESS: Initialize response received!');
      mcpServer.kill();
      process.exit(0);
    }
  } catch (error) {
    // Keep raw output for debugging
  }
});

mcpServer.on('error', error => {
  console.error('❌ [ERROR]:', error.message);
});

mcpServer.on('close', code => {
  console.log(`🔚 [CLOSED] Code: ${code}`);
});

// Timeout
setTimeout(() => {
  console.log('❌ Test timeout');
  mcpServer.kill();
  process.exit(1);
}, 30000);
