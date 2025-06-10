#!/usr/bin/env node
// test-improved-mcp.js - Test the improved MCP server
import { spawn } from 'child_process';

console.log('🧪 Testing Improved MCP Server...');

const mcpServer = spawn('node', ['devtools-mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

let testComplete = false;

mcpServer.stderr.on('data', data => {
  const message = data.toString().trim();
  console.log('📝 [SERVER]:', message);

  // Check if server is fully ready
  if (message.includes('MCP Protocol Server fully initialized')) {
    console.log('✅ Server ready, sending initialize request...');

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

    mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  }
});

mcpServer.stdout.on('data', data => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log('📥 [RESPONSE]:', JSON.stringify(response, null, 2));

    if (response.id === 1 && response.result) {
      console.log('🎉 SUCCESS: MCP server initialized correctly!');
      testComplete = true;
      mcpServer.kill();
      process.exit(0);
    }
  } catch (error) {
    console.log('⚠️ [RAW]:', data.toString());
  }
});

mcpServer.on('error', error => {
  console.error('❌ [ERROR]:', error.message);
  process.exit(1);
});

mcpServer.on('close', code => {
  if (!testComplete) {
    console.log(`❌ [CLOSED] Code: ${code}`);
    process.exit(1);
  }
});

// Timeout after 60 seconds
setTimeout(() => {
  if (!testComplete) {
    console.log('❌ Test timeout after 60 seconds');
    mcpServer.kill();
    process.exit(1);
  }
}, 60000);
