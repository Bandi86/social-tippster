#!/usr/bin/env node
// devtools-mcp-server.mjs - MCP Protocol Server for VS Code
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
      console.error('🚀 Starting DevTools MCP Protocol Server for VS Code...');

      // Setup protocol communication
      this.setupProtocol();

      // Mark as ready without HTTP server for now
      this.httpServerReady = true;

      console.error('✅ MCP protocol stdio listener ready');
    } catch (error) {
      console.error('❌ Failed to initialize MCP server:', error.message);
      process.exit(1);
    }
  }

  // HTTP server startup - disabled for now, focusing on MCP protocol
  /*
  async startHttpServer() {
    // Start the HTTP server in background for service endpoints
    try {
      const devtoolsPath = path.join(__dirname, 'backend_new', 'services', 'devtools');
      console.error(`🔧 DevTools path: ${devtoolsPath}`);

      // Check if the directory exists
      try {
        const fs = await import('fs');
        if (!fs.existsSync(devtoolsPath)) {
          throw new Error(`DevTools directory not found: ${devtoolsPath}`);
        }

        const mainJsPath = path.join(devtoolsPath, 'dist', 'src', 'main.js');
        if (!fs.existsSync(mainJsPath)) {
          throw new Error(`Main.js not found: ${mainJsPath}. Try running 'npm run build' in the devtools directory.`);
        }
      } catch (fsError) {
        console.error('❌ File system check failed:', fsError.message);
        throw fsError;
      }

      this.httpServer = spawn('node', ['dist/src/main.js'], {
        cwd: devtoolsPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PORT: '3033' },
      });

      // Add error handling for the spawned process
      this.httpServer.on('error', (error) => {
        console.error('❌ HTTP server spawn error:', error.message);
      });

      this.httpServer.stderr.on('data', (data) => {
        console.error('📝 HTTP server stderr:', data.toString());
      });

      this.httpServer.stdout.on('data', (data) => {
        console.error('📋 HTTP server stdout:', data.toString());
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
  */

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

  async handleInitialize(id, _params) {
    console.error('🔧 MCP Initialize request received');

    try {
      // Server is ready since we simplified initialization
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
      // Return basic tools without requiring HTTP server
      const tools = [
        {
          name: 'bb7_list_containers',
          description: 'List Docker containers',
          inputSchema: {
            type: 'object',
            properties: {
              all: { type: 'boolean', description: 'Show all containers, not just running ones' },
            },
          },
        },
        {
          name: 'bb7_service_logs',
          description: 'Get logs from a Docker service',
          inputSchema: {
            type: 'object',
            properties: {
              serviceName: { type: 'string', description: 'Name of the service' },
              lines: { type: 'number', description: 'Number of lines to show' },
            },
            required: ['serviceName'],
          },
        },
      ];

      console.error(`🔧 Returning ${tools.length} tools to VS Code`);

      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools,
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

      let result;

      switch (name) {
        case 'bb7_list_containers':
          result = await this.executeDockerPs(args.all || false);
          break;
        case 'bb7_service_logs':
          result = await this.executeDockerLogs(args.serviceName, args.lines || 50);
          break;
        default:
          throw new Error(`Tool ${name} not implemented`);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      console.error('❌ Tool call failed:', error.message);
      return this.sendError(id, 'TOOL_CALL_FAILED', error.message);
    }
  }

  async executeDockerPs(all = false) {
    const { promisify } = await import('util');
    const exec = promisify((await import('child_process')).exec);

    try {
      const command = all ? 'docker ps -a' : 'docker ps';
      const { stdout } = await exec(command);
      return stdout;
    } catch (error) {
      return `Error executing docker ps: ${error.message}`;
    }
  }

  async executeDockerLogs(serviceName, lines = 50) {
    const { promisify } = await import('util');
    const exec = promisify((await import('child_process')).exec);

    try {
      const command = `docker logs --tail ${lines} ${serviceName}`;
      const { stdout, stderr } = await exec(command);
      return stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
    } catch (error) {
      return `Error getting logs for ${serviceName}: ${error.message}`;
    }
  }

  async handleResourcesList(id) {
    if (!this.initialized) {
      return this.sendError(id, 'NOT_INITIALIZED', 'Server not initialized');
    }

    try {
      // Return basic resources
      const resources = [
        {
          uri: 'docker://containers',
          name: 'Docker Containers',
          description: 'List of all Docker containers',
        },
        {
          uri: 'docker://compose',
          name: 'Docker Compose Status',
          description: 'Status of Docker Compose services',
        },
      ];

      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources,
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
      let content = 'Resource not found';

      if (uri === 'docker://containers') {
        content = await this.executeDockerPs(true);
      } else if (uri === 'docker://compose') {
        content = await this.getDockerComposeStatus();
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: content,
            },
          ],
        },
      };
    } catch (error) {
      console.error('❌ Resource read failed:', error.message);
      return this.sendError(id, 'RESOURCE_READ_FAILED', error.message);
    }
  }

  async getDockerComposeStatus() {
    const { promisify } = await import('util');
    const exec = promisify((await import('child_process')).exec);

    try {
      const { stdout } = await exec('docker-compose ps');
      return stdout;
    } catch (error) {
      return `Error getting docker-compose status: ${error.message}`;
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
