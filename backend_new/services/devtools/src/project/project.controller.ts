import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectStatsDto } from '../common/dto/project.dto';
import { ProjectService } from './project.service';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get project overview with all services and status' })
  @ApiResponse({ status: 200, description: 'Project overview retrieved successfully' })
  async getProjectOverview() {
    return this.projectService.getProjectOverview();
  }

  @Get('scan')
  @ApiOperation({ summary: 'Scan and refresh all projects' })
  @ApiResponse({ status: 200, description: 'Projects scanned successfully' })
  async scanProjects() {
    const projects = await this.projectService.scanProjects();
    return {
      projects,
      totalProjects: projects.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('services/status')
  @ApiOperation({ summary: 'Get status of all services' })
  @ApiResponse({ status: 200, description: 'Service statuses retrieved successfully' })
  async getServiceStatuses() {
    const services = await this.projectService.getServiceStatuses();
    return {
      services,
      totalServices: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length,
      unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiQuery({ name: 'path', required: false, description: 'Specific project path to analyze' })
  @ApiResponse({
    status: 200,
    description: 'Project statistics retrieved successfully',
    type: ProjectStatsDto,
  })
  async getProjectStats(@Query('path') projectPath?: string) {
    return this.projectService.getProjectStats(projectPath);
  }

  @Get('files/recent')
  @ApiOperation({ summary: 'Get recently modified files' })
  @ApiQuery({ name: 'path', required: false, description: 'Specific project path to analyze' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of files to return',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Recent files retrieved successfully' })
  async getRecentFiles(@Query('path') projectPath?: string, @Query('limit') limit?: number) {
    return this.projectService.getRecentFiles(projectPath, limit);
  }

  @Get('microservices')
  @ApiOperation({ summary: 'Get all microservices information' })
  @ApiResponse({ status: 200, description: 'Microservices information retrieved successfully' })
  async getMicroservices() {
    const projects = await this.projectService.scanProjects();
    const microservices = projects.filter(p => p.type === 'microservice');

    return {
      microservices,
      totalMicroservices: microservices.length,
      runningMicroservices: microservices.filter(m => m.status === 'running').length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('frontend')
  @ApiOperation({ summary: 'Get frontend projects information' })
  @ApiResponse({ status: 200, description: 'Frontend projects information retrieved successfully' })
  async getFrontendProjects() {
    const projects = await this.projectService.scanProjects();
    const frontendProjects = projects.filter(p => p.type === 'frontend');

    return {
      frontendProjects,
      totalFrontendProjects: frontendProjects.length,
      runningFrontendProjects: frontendProjects.filter(f => f.status === 'running').length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('backend')
  @ApiOperation({ summary: 'Get backend projects information' })
  @ApiResponse({ status: 200, description: 'Backend projects information retrieved successfully' })
  async getBackendProjects() {
    const projects = await this.projectService.scanProjects();
    const backendProjects = projects.filter(p => p.type === 'backend');

    return {
      backendProjects,
      totalBackendProjects: backendProjects.length,
      runningBackendProjects: backendProjects.filter(b => b.status === 'running').length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ports')
  @ApiOperation({ summary: 'Get all used ports in the project' })
  @ApiResponse({ status: 200, description: 'Port usage information retrieved successfully' })
  async getPortUsage() {
    const projects = await this.projectService.scanProjects();
    const portsInUse = projects
      .filter(p => p.port && p.status === 'running')
      .map(p => ({
        port: p.port,
        service: p.name,
        type: p.type,
        status: p.status,
      }));

    return {
      portsInUse,
      totalPorts: portsInUse.length,
      availablePorts: Array.from({ length: 100 }, (_, i) => 3000 + i)
        .filter(port => !portsInUse.some(p => p.port === port))
        .slice(0, 10),
      timestamp: new Date().toISOString(),
    };
  }
}
