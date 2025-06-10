#!/usr/bin/env node
// devtools-mcp-server.mjs - MCP Protocol Server for VS Code
import { spawn } from 'child_process';
import readline from 'readline';

// MCP Protocol Implementation
class McpProtocolServer {
  constructor() {
    this.tools = [];
    this.resources = [];
    this.initialized = false;
    this.serverInfo = null;
    this.httpServerReady = false;

    // Setup stdio interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.initializeServer();
  }

  async initializeServer() {
    try {
      // First setup protocol communication
      this.setupProtocol();

      // Then start HTTP server
      await this.startHttpServer();
      this.httpServerReady = true;

      console.error('✅ MCP Protocol Server fully initialized and ready for requests');
    } catch (error) {
      console.error('❌ Failed to initialize MCP server:', error.message);
      process.exit(1);
    }
  }

  async startHttpServer() {
    // Start the HTTP server in background for service endpoints
    try {
      this.httpServer = spawn('node', ['dist/src/main.js'], {
        cwd: 'c:/Users/bandi/Documents/code/social-tippster/social-tippster/backend_new/services/devtools',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: '3033' },
      });

      // Wait for server to be ready by checking health endpoint
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max

      while (attempts < maxAttempts) {
        try {
          const response = await fetch('http://localhost:3033/api/health');
          if (response.ok) {
            console.error('🚀 HTTP DevTools server started and ready on port 3033');
            return;
          }
        } catch (error) {
          // Server not ready yet, continue waiting
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        console.error(`⏳ Waiting for HTTP server... (${attempts}/${maxAttempts})`);
      }

      throw new Error('HTTP server failed to start within 30 seconds');
    } catch (error) {
      console.error('❌ Failed to start HTTP server:', error.message);
      throw error;
    }
  }

  setupProtocol() {
    console.error('📡 Setting up MCP protocol stdio communication...');

    this.rl.on('line', async line => {
      try {
        console.error('📥 Received MCP request:', line.substring(0, 100) + '...');
        const request = JSON.parse(line);
        console.error('📝 Parsed request method:', request.method, 'ID:', request.id);

        const response = await this.handleRequest(request);
        if (response) {
          console.error('📤 Sending response for method:', request.method, 'ID:', request.id);
          const responseStr = JSON.stringify(response);
          console.log(responseStr);
          // Force flush by writing to stdout directly if available
          if (process.stdout.write) {
            process.stdout.write(''); // Empty write to trigger flush
          }
        } else {
          console.error('⚠️ No response generated for method:', request.method);
        }
      } catch (error) {
        console.error('❌ MCP Protocol Error:', error.message);
        console.error('🔍 Raw line:', line);
        const errorResponse = this.sendError(null, 'PARSE_ERROR', 'Invalid JSON request');
        console.log(JSON.stringify(errorResponse));
      }
    });

    this.rl.on('close', () => {
      console.error('📪 MCP Protocol connection closed');
      if (this.httpServer) {
        this.httpServer.kill();
      }
      process.exit(0);
    });

    console.error('✅ MCP protocol stdio listener ready');
  }

  async handleRequest(request) {
    const { id, method, params } = request;

    try {
      switch (method) {
        case 'initialize':
          return await this.handleInitialize(id, params);

        case 'tools/list':
          return await this.handleToolsList(id);

        case 'tools/call':
          return await this.handleToolCall(id, params);

        case 'resources/list':
          return await this.handleResourcesList(id);

        case 'resources/read':
          return await this.handleResourceRead(id, params);

        default:
          return this.sendError(id, 'METHOD_NOT_FOUND', `Method ${method} not supported`);
      }
    } catch (error) {
      console.error(`❌ Error handling ${method}:`, error.message);
      return this.sendError(id, 'INTERNAL_ERROR', error.message);
    }
  }

  async handleInitialize(id, params) {
    console.error('🔧 MCP Initialize request received');

    try {
      // Ensure HTTP server is ready
      if (!this.httpServerReady) {
        console.error('⏳ Waiting for HTTP server to be ready...');
        let attempts = 0;
        while (!this.httpServerReady && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        if (!this.httpServerReady) {
          throw new Error('HTTP server not ready after 30 seconds');
        }
      }

      // Fetch server info from HTTP service
      const response = await fetch('http://localhost:3033/api/mcp/server-info');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.serverInfo = await response.json();
      this.initialized = true;
      console.error('✅ MCP Server initialized successfully');

      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false, subscribe: false },
          },
          serverInfo: {
            name: 'DevTools MCP Server',
            version: '1.0.0',
          },
        },
      };
    } catch (error) {
      console.error('❌ Initialize failed:', error.message);
      return this.sendError(id, 'INITIALIZATION_FAILED', error.message);
    }
  }

  async handleToolsList(id) {
    if (!this.initialized) {
      return this.sendError(id, 'NOT_INITIALIZED', 'Server not initialized');
    }

    try {
      const response = await fetch('http://localhost:3033/api/mcp/tools');
      const data = await response.json();

      console.error(`🔧 Returning ${data.tools?.length || 0} tools to VS Code`);

      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: data.tools || [],
        },
      };
    } catch (error) {
      console.error('❌ Tools list failed:', error.message);
      return this.sendError(id, 'TOOLS_LIST_FAILED', error.message);
    }
  }

  async handleToolCall(id, params) {
    if (!this.initialized) {
      return this.sendError(id, 'NOT_INITIALIZED', 'Server not initialized');
    }

    try {
      const { name, arguments: args } = params;
      console.error(`🛠️  Tool call: ${name}`);

      const response = await fetch('http://localhost:3033/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: name, arguments: args }),
      });

      const result = await response.json();

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text:
                typeof result.result === 'string'
                  ? result.result
                  : JSON.stringify(result.result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      console.error('❌ Tool call failed:', error.message);
      return this.sendError(id, 'TOOL_CALL_FAILED', error.message);
    }
  }

  async handleResourcesList(id) {
    if (!this.initialized) {
      return this.sendError(id, 'NOT_INITIALIZED', 'Server not initialized');
    }

    try {
      const response = await fetch('http://localhost:3033/api/mcp/resources');
      const data = await response.json();

      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: data.resources || [],
        },
      };
    } catch (error) {
      console.error('❌ Resources list failed:', error.message);
      return this.sendError(id, 'RESOURCES_LIST_FAILED', error.message);
    }
  }

  async handleResourceRead(id, params) {
    if (!this.initialized) {
      return this.sendError(id, 'NOT_INITIALIZED', 'Server not initialized');
    }

    try {
      const { uri } = params;
      const response = await fetch(
        `http://localhost:3033/api/mcp/resource?uri=${encodeURIComponent(uri)}`,
      );
      const data = await response.json();

      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: data.content || 'No content',
            },
          ],
        },
      };
    } catch (error) {
      console.error('❌ Resource read failed:', error.message);
      return this.sendError(id, 'RESOURCE_READ_FAILED', error.message);
    }
  }

  sendError(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code:
          code === 'PARSE_ERROR'
            ? -32700
            : code === 'METHOD_NOT_FOUND'
              ? -32601
              : code === 'INVALID_PARAMS'
                ? -32602
                : -32603,
        message,
        data: { code },
      },
    };
  }
}

// Start MCP Protocol Server
console.error('🚀 Starting DevTools MCP Protocol Server for VS Code...');
new McpProtocolServer();
