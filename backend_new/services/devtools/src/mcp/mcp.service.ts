import { Injectable, Logger } from '@nestjs/common';
import { McpResource, McpTool } from '../common/interfaces';
import { DockerService } from '../docker/docker.service';
import { HealthService } from '../health/health.service';
import { ProjectService } from '../project/project.service';

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);
  private tools: Map<string, McpTool> = new Map();
  private resources: Map<string, McpResource> = new Map();

  // Add caching and connection management
  private toolsCache: any[] | null = null;
  private resourcesCache: any[] | null = null;
  private lastRequestTime = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds cache
  private readonly MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests
  private isInitialized = false;

  // Anti-loop protection
  private toolDiscoveryCount = 0;
  private toolDiscoveryWindowStart = 0;
  private readonly MAX_DISCOVERY_REQUESTS = 3; // Max 3 discovery requests
  private readonly DISCOVERY_WINDOW = 60000; // per 60 seconds
  private isDiscoveryBlocked = false;
  private blockUntil = 0;

  constructor(
    private dockerService: DockerService,
    private projectService: ProjectService,
    private healthService: HealthService,
  ) {
    this.initializeTools();
    this.initializeResources();
    this.isInitialized = true;
    this.logger.log('DevTools MCP Service initialized successfully');
  }

  private initializeTools() {
    // Docker tools
    this.registerTool({
      name: 'list_containers',
      description: 'List all Docker containers',
      inputSchema: {
        type: 'object',
        properties: {
          all: { type: 'boolean', description: 'Include stopped containers' },
        },
      },
      handler: async params => {
        return this.dockerService.listContainers(params.all);
      },
    });

    this.registerTool({
      name: 'container_logs',
      description: 'Get logs from a specific container',
      inputSchema: {
        type: 'object',
        properties: {
          containerName: { type: 'string', description: 'Name of the container' },
          tail: { type: 'number', description: 'Number of lines to tail', default: 50 },
        },
        required: ['containerName'],
      },
      handler: async params => {
        return this.dockerService.getContainerLogs(params.containerName, params.tail);
      },
    });

    this.registerTool({
      name: 'container_stats',
      description: 'Get statistics for a specific container',
      inputSchema: {
        type: 'object',
        properties: {
          containerName: { type: 'string', description: 'Name of the container' },
        },
        required: ['containerName'],
      },
      handler: async params => {
        return this.dockerService.getContainerStats(params.containerName);
      },
    });

    this.registerTool({
      name: 'restart_container',
      description: 'Restart a specific container',
      inputSchema: {
        type: 'object',
        properties: {
          containerName: { type: 'string', description: 'Name of the container' },
        },
        required: ['containerName'],
      },
      handler: async params => {
        return this.dockerService.restartContainer(params.containerName);
      },
    });

    this.registerTool({
      name: 'execute_command',
      description: 'Execute a command in a container',
      inputSchema: {
        type: 'object',
        properties: {
          containerName: { type: 'string', description: 'Name of the container' },
          command: { type: 'string', description: 'Command to execute' },
        },
        required: ['containerName', 'command'],
      },
      handler: async params => {
        return this.dockerService.executeCommand(params.containerName, params.command);
      },
    });

    // Project tools
    this.registerTool({
      name: 'project_overview',
      description: 'Get complete project overview',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return this.projectService.getProjectOverview();
      },
    });

    this.registerTool({
      name: 'scan_projects',
      description: 'Scan and refresh all projects',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return this.projectService.scanProjects();
      },
    });

    this.registerTool({
      name: 'project_stats',
      description: 'Get detailed statistics for a project',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'Path to the project' },
        },
      },
      handler: async params => {
        return this.projectService.getProjectStats(params.projectPath);
      },
    });

    this.registerTool({
      name: 'recent_files',
      description: 'Get recently modified files',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: { type: 'string', description: 'Path to the project' },
          limit: { type: 'number', description: 'Number of files to return', default: 10 },
        },
      },
      handler: async params => {
        return this.projectService.getRecentFiles(params.projectPath, params.limit);
      },
    });

    // Health tools
    this.registerTool({
      name: 'health_check',
      description: 'Perform health check on all services',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return this.healthService.checkAllServices();
      },
    });

    this.registerTool({
      name: 'service_health',
      description: 'Get health status of a specific service',
      inputSchema: {
        type: 'object',
        properties: {
          serviceName: { type: 'string', description: 'Name of the service' },
        },
        required: ['serviceName'],
      },
      handler: async params => {
        return this.healthService.getServiceHealth(params.serviceName);
      },
    });

    this.registerTool({
      name: 'system_health',
      description: 'Get system health (CPU, Memory, Disk)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return this.healthService.getSystemHealth();
      },
    });

    this.registerTool({
      name: 'docker_health',
      description: 'Check Docker daemon health',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        return this.healthService.getDockerHealth();
      },
    });
  }

  private initializeResources() {
    // Project resources
    this.registerResource({
      uri: 'file://project/overview',
      name: 'Project Overview',
      description: 'Complete project overview with all services',
      mimeType: 'application/json',
    });

    this.registerResource({
      uri: 'file://project/stats',
      name: 'Project Statistics',
      description: 'Detailed project statistics and metrics',
      mimeType: 'application/json',
    });

    // Docker resources
    this.registerResource({
      uri: 'file://docker/containers',
      name: 'Docker Containers',
      description: 'List of all Docker containers',
      mimeType: 'application/json',
    });

    this.registerResource({
      uri: 'file://docker/compose',
      name: 'Docker Compose Status',
      description: 'Status of Docker Compose services',
      mimeType: 'application/json',
    });

    // Health resources
    this.registerResource({
      uri: 'file://health/services',
      name: 'Services Health',
      description: 'Health status of all services',
      mimeType: 'application/json',
    });

    this.registerResource({
      uri: 'file://health/system',
      name: 'System Health',
      description: 'System resource usage and health',
      mimeType: 'application/json',
    });
  }

  registerTool(tool: McpTool) {
    this.tools.set(tool.name, tool);
    this.toolsCache = null; // Invalidate cache
    this.logger.log(`Registered MCP tool: ${tool.name}`);
  }

  registerResource(resource: McpResource) {
    this.resources.set(resource.uri, resource);
    this.resourcesCache = null; // Invalidate cache
    this.logger.log(`Registered MCP resource: ${resource.uri}`);
  }

  // Add method to clear cache manually
  clearCache() {
    this.toolsCache = null;
    this.resourcesCache = null;
    this.lastRequestTime = 0;

    // Reset anti-loop protection
    this.toolDiscoveryCount = 0;
    this.toolDiscoveryWindowStart = 0;
    this.isDiscoveryBlocked = false;
    this.blockUntil = 0;

    this.logger.log('🗑️ MCP cache and anti-loop protection cleared');
  }

  // Add health check for MCP service
  isHealthy(): boolean {
    return this.isInitialized && this.tools.size > 0 && this.resources.size > 0;
  }

  async getTools() {
    // Implement rate limiting and caching
    const now = Date.now();

    // Check if discovery is blocked
    if (this.isDiscoveryBlocked && now < this.blockUntil) {
      const remainingTime = Math.ceil((this.blockUntil - now) / 1000);
      this.logger.warn(
        `Tool discovery BLOCKED for ${remainingTime} more seconds - too many requests`,
      );
      return this.toolsCache || [];
    }

    // Reset block if time expired
    if (this.isDiscoveryBlocked && now >= this.blockUntil) {
      this.isDiscoveryBlocked = false;
      this.toolDiscoveryCount = 0;
      this.toolDiscoveryWindowStart = now;
      this.logger.log('Tool discovery block lifted - reset counter');
    }

    // Check discovery window and count
    if (now - this.toolDiscoveryWindowStart > this.DISCOVERY_WINDOW) {
      // Reset counter if window expired
      this.toolDiscoveryCount = 0;
      this.toolDiscoveryWindowStart = now;
    }

    // Increment discovery count
    this.toolDiscoveryCount++;

    // Check if we've exceeded the limit
    if (this.toolDiscoveryCount > this.MAX_DISCOVERY_REQUESTS) {
      this.isDiscoveryBlocked = true;
      this.blockUntil = now + 5 * 60 * 1000; // Block for 5 minutes
      this.logger.error(
        `🚫 DISCOVERY LOOP DETECTED! Blocking tool discovery for 5 minutes. Request count: ${this.toolDiscoveryCount}`,
      );
      return this.toolsCache || [];
    }

    // Return cached tools if available and not expired
    if (this.toolsCache && now - this.lastRequestTime < this.CACHE_TTL) {
      this.logger.debug(
        `Returning cached tools list (request ${this.toolDiscoveryCount}/${this.MAX_DISCOVERY_REQUESTS})`,
      );
      return this.toolsCache;
    }

    // Prevent too frequent requests
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      this.logger.warn('Tool discovery rate limited - too frequent requests');
      return this.toolsCache || [];
    }

    this.lastRequestTime = now;

    const tools = Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    this.toolsCache = tools;
    this.logger.log(
      `🔧 Returning ${tools.length} tools (cached for ${this.CACHE_TTL}ms) - Request ${this.toolDiscoveryCount}/${this.MAX_DISCOVERY_REQUESTS}`,
    );

    return tools;
  }

  async getResources() {
    // Implement caching for resources as well
    const now = Date.now();
    if (this.resourcesCache && now - this.lastRequestTime < this.CACHE_TTL) {
      this.logger.debug('Returning cached resources list');
      return this.resourcesCache;
    }

    const resources = Array.from(this.resources.values());
    this.resourcesCache = resources;
    this.logger.log(`Returning ${resources.length} resources (cached)`);

    return resources;
  }

  async getTool(name: string): Promise<McpTool | undefined> {
    return this.tools.get(name);
  }

  async getResource(uri: string): Promise<any> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    // Generate content based on URI
    switch (uri) {
      case 'file://project/overview':
        return this.projectService.getProjectOverview();

      case 'file://project/stats':
        return this.projectService.getProjectStats();

      case 'file://docker/containers':
        return this.dockerService.listContainers(true);

      case 'file://docker/compose':
        return this.dockerService.getDockerComposeStatus();

      case 'file://health/services':
        return this.healthService.checkAllServices();

      case 'file://health/system':
        return this.healthService.getSystemHealth();

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async executeTool(name: string, params: any = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      this.logger.log(`Executing MCP tool: ${name}`);
      const result = await tool.handler(params);
      this.logger.log(`MCP tool executed successfully: ${name}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute MCP tool ${name}: ${error.message}`);
      throw error;
    }
  }

  async getServerInfo() {
    return {
      name: 'Social Tippster DevTools MCP Server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      serverCapabilities: {
        tools: {
          listChanged: false, // Prevent tools list change notifications
        },
        resources: {
          subscribe: false, // Prevent resource subscription loops
          listChanged: false,
        },
        logging: {},
        prompts: {},
        experimental: {
          antiLoop: true, // Custom flag to indicate anti-loop measures
          cacheEnabled: true,
          rateLimited: true,
          maxDiscoveryRequests: this.MAX_DISCOVERY_REQUESTS,
          discoveryWindow: this.DISCOVERY_WINDOW,
        },
      },
      capabilities: [
        {
          name: 'tools',
          description:
            'Execute development tools for Docker, project management, and health monitoring',
          enabled: true,
          config: {
            toolCount: this.tools.size,
            cacheEnabled: true,
            rateLimited: true,
            antiLoopProtection: true,
          },
        },
        {
          name: 'resources',
          description: 'Access project resources and data',
          enabled: true,
          config: {
            resourceCount: this.resources.size,
            cacheEnabled: true,
          },
        },
        {
          name: 'logging',
          description: 'Centralized logging for development operations',
          enabled: true,
          config: {
            logLevel: 'info',
          },
        },
      ],
      experimental: {
        connection: {
          keepAlive: true,
          timeout: 30000, // 30 second timeout
          maxRetries: 3,
        },
        antiLoop: {
          enabled: true,
          isBlocked: this.isDiscoveryBlocked,
          requestCount: this.toolDiscoveryCount,
          maxRequests: this.MAX_DISCOVERY_REQUESTS,
          windowMs: this.DISCOVERY_WINDOW,
          blockUntil: this.isDiscoveryBlocked ? new Date(this.blockUntil).toISOString() : null,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  async handleMcpRequest(method: string, params: any = {}, id?: string) {
    try {
      this.logger.debug(`Handling MCP request: ${method} (ID: ${id})`);

      // Check if service is properly initialized
      if (!this.isInitialized) {
        this.logger.warn('MCP service not yet initialized');
        return {
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Service not initialized',
          },
          id,
        };
      }

      let result;

      switch (method) {
        case 'initialize':
          result = await this.getServerInfo();
          this.logger.log('MCP server initialized successfully');
          break;

        case 'initialized':
          // Handle initialized notification (no response needed)
          this.logger.log('MCP client confirmed initialization');
          return null; // No response for notifications

        case 'tools/list':
          result = {
            tools: await this.getTools(),
          };
          this.logger.debug(`Returned ${result.tools.length} tools to client`);
          break;

        case 'resources/list':
          result = {
            resources: await this.getResources(),
          };
          this.logger.debug(`Returned ${result.resources.length} resources to client`);
          break;

        case 'tools/call':
          if (!params.name) {
            throw new Error('Tool name is required');
          }
          const toolResult = await this.executeTool(params.name, params.arguments || {});
          result = {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
          };
          break;

        case 'resources/read':
          if (!params.uri) {
            throw new Error('Resource URI is required');
          }
          result = {
            contents: [
              {
                uri: params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(await this.getResource(params.uri), null, 2),
              },
            ],
          };
          break;

        case 'ping':
          result = { status: 'pong' };
          break;

        default:
          // Return -32601 for unknown methods (Method not found)
          return {
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Unknown method: ${method}`,
              data: {
                method,
                params,
              },
            },
            id,
          };
      }

      return {
        jsonrpc: '2.0',
        result,
        id,
      };
    } catch (error) {
      this.logger.error(`MCP request failed: ${error.message}`);
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message,
          data: {
            method,
            params,
          },
        },
        id,
      };
    }
  }
}
