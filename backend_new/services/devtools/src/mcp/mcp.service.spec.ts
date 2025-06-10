import { Test, TestingModule } from '@nestjs/testing';
import { DockerService } from '../docker/docker.service';
import { HealthService } from '../health/health.service';
import { ProjectService } from '../project/project.service';
import { McpService } from './mcp.service';

describe('McpService', () => {
  let service: McpService;
  let dockerService: jest.Mocked<DockerService>;
  let projectService: jest.Mocked<ProjectService>;
  let healthService: jest.Mocked<HealthService>;

  beforeEach(async () => {
    const mockDockerService = {
      listContainers: jest.fn(),
      getContainerLogs: jest.fn(),
      getContainerStats: jest.fn(),
      restartContainer: jest.fn(),
      executeCommand: jest.fn(),
    };

    const mockProjectService = {
      getProjectOverview: jest.fn(),
      scanProjects: jest.fn(),
      getProjectStats: jest.fn(),
      getRecentFiles: jest.fn(),
    };

    const mockHealthService = {
      getServiceHealth: jest.fn(),
      getSystemHealth: jest.fn(),
      getDockerHealth: jest.fn(),
      checkAllServices: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        {
          provide: DockerService,
          useValue: mockDockerService,
        },
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    service = module.get<McpService>(McpService);
    dockerService = module.get<DockerService>(DockerService) as jest.Mocked<DockerService>;
    projectService = module.get<ProjectService>(ProjectService) as jest.Mocked<ProjectService>;
    healthService = module.get<HealthService>(HealthService) as jest.Mocked<HealthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should register MCP tools on module init', async () => {
      const tools = await service.getTools();
      expect(tools.length).toBeGreaterThan(0);

      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('list_containers');
      expect(toolNames).toContain('project_overview');
      expect(toolNames).toContain('health_check');
    });

    it('should register MCP resources on module init', async () => {
      const resources = await service.getResources();
      expect(resources.length).toBeGreaterThan(0);

      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('file://project/overview');
      expect(resourceUris).toContain('file://docker/containers');
      expect(resourceUris).toContain('file://health/services');
    });
  });

  describe('getServerInfo', () => {
    it('should return MCP server information', async () => {
      const result = await service.getServerInfo();

      expect(result.capabilities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'tools',
            description:
              'Execute development tools for Docker, project management, and health monitoring',
            enabled: true,
            config: { toolCount: expect.any(Number) },
          }),
          expect.objectContaining({
            name: 'resources',
            description: 'Access project resources and data',
            enabled: true,
            config: { resourceCount: expect.any(Number) },
          }),
          expect.objectContaining({
            name: 'logging',
            description: 'Centralized logging for development operations',
            enabled: true,
            config: { logLevel: 'info' },
          }),
        ]),
      );
    });
  });

  describe('executeTool', () => {
    it('should execute list_containers tool', async () => {
      const mockContainers = [
        {
          id: 'test123',
          name: 'test-container',
          image: 'test:latest',
          status: 'running',
          state: 'running',
          ports: [],
          created: new Date(),
        },
      ];

      dockerService.listContainers.mockResolvedValue(mockContainers);

      const result = await service.executeTool('list_containers', {});

      expect(result).toEqual(mockContainers);
      expect(dockerService.listContainers).toHaveBeenCalled();
    });

    it('should execute project_overview tool', async () => {
      const mockOverview = {
        projectRoot: '/test/path',
        totalProjects: 5,
        runningServices: 4,
        totalServices: 10,
        projects: [],
        services: [],
        timestamp: new Date().toISOString(),
      };

      projectService.getProjectOverview.mockResolvedValue(mockOverview);

      const result = await service.executeTool('project_overview', {});

      expect(result).toEqual(mockOverview);
      expect(projectService.getProjectOverview).toHaveBeenCalled();
    });

    it('should execute health_check tool', async () => {
      const mockHealthResponse = {
        overallStatus: 'healthy' as const,
        services: [
          {
            serviceName: 'devtools',
            status: 'healthy' as const,
            responseTime: 120,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            details: {
              port: 3020,
              url: 'http://localhost:3020/api/health',
              statusCode: 200,
              responseSize: 256,
            },
          },
        ],
        summary: {
          total: 1,
          healthy: 1,
          unhealthy: 0,
          degraded: 0,
          unknown: 0,
        },
        timestamp: new Date().toISOString(),
      };

      healthService.checkAllServices.mockResolvedValue(mockHealthResponse);

      const result = await service.executeTool('health_check', {});

      expect(result).toEqual(mockHealthResponse);
      expect(healthService.checkAllServices).toHaveBeenCalled();
    });

    it('should throw error for unknown tool', async () => {
      await expect(service.executeTool('unknown_tool', {})).rejects.toThrow(
        'Tool not found: unknown_tool',
      );
    });
  });

  describe('getResource', () => {
    it('should get project overview resource', async () => {
      const mockOverview = {
        projectRoot: '/test/path',
        totalProjects: 5,
        runningServices: 4,
        totalServices: 10,
        projects: [],
        services: [],
        timestamp: new Date().toISOString(),
      };

      projectService.getProjectOverview.mockResolvedValue(mockOverview);

      const result = await service.getResource('file://project/overview');

      expect(result).toEqual(mockOverview);
      expect(projectService.getProjectOverview).toHaveBeenCalled();
    });

    it('should get docker containers resource', async () => {
      const mockContainers = [];

      dockerService.listContainers.mockResolvedValue(mockContainers);

      const result = await service.getResource('file://docker/containers');

      expect(result).toEqual(mockContainers);
      expect(dockerService.listContainers).toHaveBeenCalled();
    });

    it('should throw error for unknown resource', async () => {
      await expect(service.getResource('file://unknown/resource')).rejects.toThrow(
        'Resource not found: file://unknown/resource',
      );
    });
  });

  describe('handleMcpRequest', () => {
    it('should handle tools/list request', async () => {
      const result = await service.handleMcpRequest('tools/list', {}, '1');

      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('tools');
      expect(Array.isArray(result.result.tools)).toBe(true);
      expect(result.id).toBe('1');
    });

    it('should handle resources/list request', async () => {
      const result = await service.handleMcpRequest('resources/list', {}, '2');

      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('resources');
      expect(Array.isArray(result.result.resources)).toBe(true);
      expect(result.id).toBe('2');
    });

    it('should handle tools/call request', async () => {
      const mockContainers = [];
      dockerService.listContainers.mockResolvedValue(mockContainers);

      const result = await service.handleMcpRequest('tools/call', { name: 'list_containers' }, '3');

      expect(result).toHaveProperty('result');
      expect(result.id).toBe('3');
      expect(dockerService.listContainers).toHaveBeenCalled();
    });

    it('should handle invalid method', async () => {
      const result = await service.handleMcpRequest('invalid/method', {}, '4');

      expect(result).toHaveProperty('error');
      expect(result.error.message).toBe('Unknown method: invalid/method');
      expect(result.id).toBe('4');
    });

    it('should handle tools/call without tool name', async () => {
      const result = await service.handleMcpRequest('tools/call', {}, '5');

      expect(result).toHaveProperty('error');
      expect(result.error.message).toBe('Tool name is required');
      expect(result.id).toBe('5');
    });
  });
});
