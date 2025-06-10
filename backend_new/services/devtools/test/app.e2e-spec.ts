import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DevTools MCP Server (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Set global prefix to match the main app configuration
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health endpoints', () => {
    it('/api/health (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('overallStatus');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('/api/health/services (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/health/services').expect(200);

      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.services)).toBe(true);
    });

    it('/api/health/system (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/health/system').expect(200);

      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('disk');
      expect(response.body).toHaveProperty('timestamp');

      expect(typeof response.body.cpu).toBe('number');
      expect(response.body.cpu).toBeGreaterThanOrEqual(0);
      expect(response.body.cpu).toBeLessThanOrEqual(100);
    });
  });

  describe('Project endpoints', () => {
    it('/api/project/overview (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/project/overview').expect(200);

      expect(response.body).toHaveProperty('projectRoot');
      expect(response.body).toHaveProperty('totalProjects');
      expect(response.body).toHaveProperty('runningServices');
      expect(response.body).toHaveProperty('projects');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('timestamp');

      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(Array.isArray(response.body.services)).toBe(true);
    });

    it('/api/project/stats (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/project/stats').expect(200);

      expect(response.body).toHaveProperty('totalFiles');
      expect(response.body).toHaveProperty('codeFiles');
      expect(response.body).toHaveProperty('totalLines');
      expect(response.body).toHaveProperty('fileTypes');
      expect(response.body).toHaveProperty('packageSize');
      expect(response.body).toHaveProperty('timestamp');

      expect(typeof response.body.totalFiles).toBe('number');
      expect(typeof response.body.codeFiles).toBe('number');
      expect(typeof response.body.totalLines).toBe('number');
    });

    it('/api/project/files/recent (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/project/files/recent')
        .expect(200);

      expect(response.body).toHaveProperty('files');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.files)).toBe(true);
    });
  });

  describe('Docker endpoints', () => {
    it('/api/docker/containers (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/docker/containers').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // The response is a direct array of containers
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('image');
        expect(response.body[0]).toHaveProperty('status');
      }
    });

    it('/api/docker/compose/status (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docker/compose/status')
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.services)).toBe(true);
    });
  });

  describe('MCP endpoints', () => {
    it('/api/mcp/server-info (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/mcp/server-info').expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('capabilities');
      expect(response.body).toHaveProperty('protocolVersion');
      expect(response.body).toHaveProperty('timestamp');

      expect(response.body.name).toBe('Social Tippster DevTools MCP Server');
      expect(Array.isArray(response.body.capabilities)).toBe(true);
    });

    it('/api/mcp/tools (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/mcp/tools').expect(200);

      expect(response.body).toHaveProperty('tools');
      expect(Array.isArray(response.body.tools)).toBe(true);
      expect(response.body.tools.length).toBeGreaterThan(0);

      // Check for essential tools
      const toolNames = response.body.tools.map((tool: any) => tool.name);
      expect(toolNames).toContain('list_containers');
      expect(toolNames).toContain('project_overview');
      expect(toolNames).toContain('health_check');
    });

    it('/api/mcp/resources (GET)', async () => {
      const response = await request(app.getHttpServer()).get('/api/mcp/resources').expect(200);

      expect(response.body).toHaveProperty('resources');
      expect(Array.isArray(response.body.resources)).toBe(true);
      expect(response.body.resources.length).toBeGreaterThan(0);

      // Check for essential resources
      const resourceUris = response.body.resources.map((resource: any) => resource.uri);
      expect(resourceUris).toContain('file://project/overview');
      expect(resourceUris).toContain('file://docker/containers');
    });

    it('/api/mcp/request (POST) - tools/list', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      };

      const response = await request(app.getHttpServer())
        .post('/api/mcp/request')
        .send(mcpRequest)
        .expect(201);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('tools');
      expect(Array.isArray(response.body.result.tools)).toBe(true);
    });

    it('/api/mcp/request (POST) - resources/list', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'resources/list',
        params: {},
      };

      const response = await request(app.getHttpServer())
        .post('/api/mcp/request')
        .send(mcpRequest)
        .expect(201);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 2);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('resources');
      expect(Array.isArray(response.body.result.resources)).toBe(true);
    });

    it('/api/mcp/request (POST) - tools/call', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'project_overview',
          arguments: {},
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/mcp/request')
        .send(mcpRequest)
        .expect(201);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('content');
      expect(Array.isArray(response.body.result.content)).toBe(true);
    });

    it('/api/mcp/request (POST) - invalid method', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'invalid/method',
        params: {},
      };

      const response = await request(app.getHttpServer())
        .post('/api/mcp/request')
        .send(mcpRequest)
        .expect(201);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 4);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', -32601);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      await request(app.getHttpServer()).get('/api/unknown/endpoint').expect(404);
    });

    it('should handle malformed MCP requests', async () => {
      const malformedRequest = {
        invalid: 'request',
      };

      const response = await request(app.getHttpServer())
        .post('/api/mcp/request')
        .send(malformedRequest)
        .expect(201);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance', () => {
    it('should respond to health check within acceptable time', async () => {
      const start = Date.now();

      await request(app.getHttpServer()).get('/api/health').expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it('should respond to project overview within acceptable time', async () => {
      const start = Date.now();

      await request(app.getHttpServer()).get('/api/project/overview').expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});
