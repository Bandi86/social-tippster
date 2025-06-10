#!/usr/bin/env node
// test-final-mcp.js - Final test of MCP Protocol
import { spawn } from 'child_process';

console.log('🎯 Final MCP Protocol Test...');

const mcpServer = spawn('node', ['devtools-mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

let responseCount = 0;

mcpServer.stderr.on('data', data => {
  console.log('📝 Server:', data.toString().trim());
});

mcpServer.stdout.on('data', data => {
  try {
    const response = JSON.parse(data.toString().trim());
    responseCount++;

    if (response.id === 1 && response.result) {
      console.log('✅ Initialize: SUCCESS');

      // Test tools list
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      };

      mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
    } else if (response.id === 2 && response.result) {
      console.log(`✅ Tools List: SUCCESS (${response.result.tools?.length || 0} tools)`);
      console.log('🎉 MCP Protocol is working perfectly!');

      mcpServer.kill();
      process.exit(0);
    }
  } catch (error) {
    console.log('⚠️ Response:', data.toString());
  }
});

// Send initialize
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'final-test', version: '1.0.0' },
  },
};

mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

// Timeout after 15 seconds
setTimeout(() => {
  console.log('❌ Test timeout');
  mcpServer.kill();
  process.exit(1);
}, 15000);
