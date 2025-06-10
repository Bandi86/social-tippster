#!/usr/bin/env node
// test-mcp-final.js - Final test of MCP communication
import { spawn } from 'child_process';

console.log('🎯 Final MCP Communication Test');

const mcpServer = spawn('node', ['devtools-mcp-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd(),
});

let serverReady = false;

mcpServer.stderr.on('data', data => {
  const message = data.toString().trim();
  console.log('[SERVER LOG]:', message);

  if (message.includes('fully initialized and ready for requests') && !serverReady) {
    serverReady = true;
    console.log('\n✅ Server ready! Sending initialize request...\n');

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
  }
});

mcpServer.stdout.on('data', data => {
  console.log('[RESPONSE]:', data.toString().trim());

  try {
    const response = JSON.parse(data.toString().trim());
    if (response.id === 1 && response.result) {
      console.log('\n🎉 SUCCESS: Initialize request/response working!');
      mcpServer.kill();
      process.exit(0);
    }
  } catch (e) {
    // Keep as raw output
  }
});

mcpServer.on('close', code => {
  console.log(`\n[CLOSED] Exit code: ${code}`);
});

setTimeout(() => {
  console.log('\n❌ Test timeout');
  mcpServer.kill();
  process.exit(1);
}, 30000);
