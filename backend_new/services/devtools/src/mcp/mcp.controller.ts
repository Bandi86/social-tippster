import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { McpRequestDto, McpResponseDto, McpServerInfoDto } from '../common/dto/mcp.dto';
import { McpService } from './mcp.service';

@ApiTags('mcp')
@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post('request')
  @ApiOperation({
    summary: 'Handle MCP protocol request',
    description: 'Process Model Context Protocol requests for tools and resources',
  })
  @ApiBody({ type: McpRequestDto })
  @ApiResponse({
    status: 200,
    description: 'MCP request processed successfully',
    type: McpResponseDto,
  })
  async handleMcpRequest(@Body() request: McpRequestDto) {
    return this.mcpService.handleMcpRequest(request.method, request.params, request.id);
  }

  @Get('server-info')
  @ApiOperation({ summary: 'Get MCP server information and capabilities' })
  @ApiResponse({
    status: 200,
    description: 'Server information retrieved successfully',
    type: McpServerInfoDto,
  })
  async getServerInfo() {
    return this.mcpService.getServerInfo();
  }

  @Get('tools')
  @ApiOperation({ summary: 'List all available MCP tools' })
  @ApiResponse({ status: 200, description: 'Tools list retrieved successfully' })
  async getTools() {
    const tools = await this.mcpService.getTools();
    return {
      tools,
      totalTools: tools.length,
      cached: true, // Indicate caching is enabled
      timestamp: new Date().toISOString(),
    };
  }

  @Get('resources')
  @ApiOperation({ summary: 'List all available MCP resources' })
  @ApiResponse({ status: 200, description: 'Resources list retrieved successfully' })
  async getResources() {
    const resources = await this.mcpService.getResources();
    return {
      resources,
      totalResources: resources.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('tools/:toolName/execute')
  @ApiOperation({ summary: 'Execute a specific MCP tool' })
  @ApiParam({ name: 'toolName', description: 'Name of the tool to execute' })
  @ApiBody({
    description: 'Tool parameters',
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @ApiResponse({ status: 200, description: 'Tool executed successfully' })
  async executeTool(@Param('toolName') toolName: string, @Body() params: any = {}) {
    const result = await this.mcpService.executeTool(toolName, params);
    return {
      toolName,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('resources/:resourceUri')
  @ApiOperation({ summary: 'Get content of a specific MCP resource' })
  @ApiParam({ name: 'resourceUri', description: 'URI of the resource (URL encoded)' })
  @ApiResponse({ status: 200, description: 'Resource content retrieved successfully' })
  async getResource(@Param('resourceUri') resourceUri: string) {
    // Decode the URI
    const decodedUri = decodeURIComponent(resourceUri);
    const content = await this.mcpService.getResource(decodedUri);
    return {
      uri: decodedUri,
      content,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('ping')
  @ApiOperation({ summary: 'Ping the MCP server' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  async ping() {
    return this.mcpService.handleMcpRequest('ping');
  }

  // Docker-specific MCP endpoints
  @Post('docker/containers')
  @ApiOperation({ summary: 'Get Docker containers via MCP' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        all: { type: 'boolean', description: 'Include stopped containers' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Docker containers retrieved via MCP' })
  async getDockerContainers(@Body() params: { all?: boolean } = {}) {
    return this.mcpService.executeTool('list_containers', params);
  }

  @Post('docker/logs')
  @ApiOperation({ summary: 'Get container logs via MCP' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        containerName: { type: 'string', description: 'Container name' },
        tail: { type: 'number', description: 'Number of lines' },
      },
      required: ['containerName'],
    },
  })
  @ApiResponse({ status: 200, description: 'Container logs retrieved via MCP' })
  async getContainerLogs(@Body() params: { containerName: string; tail?: number }) {
    return this.mcpService.executeTool('container_logs', params);
  }

  // Project-specific MCP endpoints
  @Post('project/overview')
  @ApiOperation({ summary: 'Get project overview via MCP' })
  @ApiResponse({ status: 200, description: 'Project overview retrieved via MCP' })
  async getProjectOverview() {
    return this.mcpService.executeTool('project_overview');
  }

  @Post('project/scan')
  @ApiOperation({ summary: 'Scan projects via MCP' })
  @ApiResponse({ status: 200, description: 'Projects scanned via MCP' })
  async scanProjects() {
    return this.mcpService.executeTool('scan_projects');
  }

  // Health-specific MCP endpoints
  @Post('health/check')
  @ApiOperation({ summary: 'Perform health check via MCP' })
  @ApiResponse({ status: 200, description: 'Health check performed via MCP' })
  async performHealthCheck() {
    return this.mcpService.executeTool('health_check');
  }

  @Post('health/system')
  @ApiOperation({ summary: 'Get system health via MCP' })
  @ApiResponse({ status: 200, description: 'System health retrieved via MCP' })
  async getSystemHealth() {
    return this.mcpService.executeTool('system_health');
  }

  @Get('health')
  @ApiOperation({ summary: 'Check MCP service health' })
  @ApiResponse({ status: 200, description: 'MCP service health status' })
  async checkHealth() {
    return {
      status: this.mcpService.isHealthy() ? 'healthy' : 'unhealthy',
      initialized: this.mcpService.isHealthy(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear MCP service cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    this.mcpService.clearCache();
    return {
      status: 'success',
      message: 'MCP cache cleared',
      timestamp: new Date().toISOString(),
    };
  }
}
