import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as path from 'path';
import { ProjectInfo, ServiceHealth } from '../common/interfaces';
import { FileUtils, GitUtils, ProcessUtils } from '../common/utils';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private readonly projectRoot: string;
  private projectsCache: Map<string, ProjectInfo> = new Map();

  constructor(private configService: ConfigService) {
    this.projectRoot = this.configService.get(
      'PROJECT_ROOT',
      'c:\\Users\\bandi\\Documents\\code\\social-tippster\\social-tippster',
    );
  }

  async getProjectOverview() {
    const projects = await this.scanProjects();
    const services = await this.getServiceStatuses();

    return {
      projectRoot: this.projectRoot,
      totalProjects: projects.length,
      runningServices: services.filter(s => s.status === 'healthy').length,
      totalServices: services.length,
      projects,
      services,
      timestamp: new Date().toISOString(),
    };
  }

  async scanProjects(): Promise<ProjectInfo[]> {
    try {
      const projects: ProjectInfo[] = [];

      // Frontend projects
      const frontendPath = path.join(this.projectRoot, 'frontend_new');
      const frontendNewPath = path.join(this.projectRoot, 'frontend_new', 'new');
      // Dont use frontend just frontend_new only

      // Backend projects
      const backendPath = path.join(this.projectRoot, 'backend_new');

      // Microservices
      const servicesPath = path.join(this.projectRoot, 'backend_new', 'services');

      // Scan frontend projects
      if (await this.directoryExists(frontendPath)) {
        projects.push(await this.analyzeProject(frontendPath, 'frontend', 3002));
      }

      if (await this.directoryExists(frontendNewPath)) {
        projects.push(await this.analyzeProject(frontendNewPath, 'frontend', 3002));
      }

      // Scan backend projects
      if (await this.directoryExists(backendPath)) {
        projects.push(await this.analyzeProject(backendPath, 'backend', 3001));
      }

      // Scan microservices
      if (await this.directoryExists(servicesPath)) {
        const services = await this.scanMicroservices(servicesPath);
        projects.push(...services);
      }

      this.projectsCache.clear();
      projects.forEach(project => {
        this.projectsCache.set(project.name, project);
      });

      return projects;
    } catch (error) {
      this.logger.error(`Failed to scan projects: ${error.message}`);
      return [];
    }
  }

  async analyzeProject(
    projectPath: string,
    type: 'frontend' | 'backend' | 'microservice',
    defaultPort?: number,
  ): Promise<ProjectInfo> {
    const name = path.basename(projectPath);

    try {
      const gitBranch = await GitUtils.getCurrentBranch(projectPath);
      const lastCommit = await GitUtils.getLastCommit(projectPath);

      let port = defaultPort;
      let status: 'running' | 'stopped' | 'error' = 'stopped';

      // Try to detect port from package.json or config files
      if (!port) {
        port = await this.detectPort(projectPath);
      }

      // Check if service is running
      if (port && (await ProcessUtils.checkPortInUse(port))) {
        status = 'running';
      }

      return {
        name,
        path: projectPath,
        type,
        port,
        status,
        gitBranch,
        lastCommit,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze project ${name}: ${error.message}`);
      return {
        name,
        path: projectPath,
        type,
        status: 'error',
        gitBranch: 'unknown',
        lastCommit: 'unknown',
      };
    }
  }

  async scanMicroservices(servicesPath: string): Promise<ProjectInfo[]> {
    try {
      const services: ProjectInfo[] = [];
      const serviceDirs = await FileUtils.listDirectory(servicesPath);

      const servicePorts = {
        'api-gateway': 3000,
        auth: 3001,
        user: 3003,
        post: 3004,
        bet: 3005,
        tipp: 3006,
        chat: 3008,
        notifications: 3007,
        data: 3009,
        image: 3010,
        live: 3011,
        log: 3012,
        admin: 3013,
        devtools: 3014,
        stats: 3005,
      };

      for (const dir of serviceDirs) {
        if (dir.type === 'directory' && dir.name !== 'libs') {
          const servicePath = dir.path;
          const port = servicePorts[dir.name] || undefined;

          const project = await this.analyzeProject(servicePath, 'microservice', port);
          services.push(project);
        }
      }

      return services;
    } catch (error) {
      this.logger.error(`Failed to scan microservices: ${error.message}`);
      return [];
    }
  }

  async getServiceStatuses(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];
    const projects = Array.from(this.projectsCache.values()).filter(p => p.port);

    for (const project of projects) {
      try {
        const startTime = Date.now();
        const isRunning = await ProcessUtils.checkPortInUse(project.port!);
        const responseTime = Date.now() - startTime;

        services.push({
          serviceName: project.name,
          status: isRunning ? 'healthy' : 'unhealthy',
          responseTime,
          version: '1.0.0', // TODO: Get from package.json
          timestamp: new Date().toISOString(),
          details: {
            port: project.port,
            type: project.type,
            path: project.path,
          },
        });
      } catch (error) {
        services.push({
          serviceName: project.name,
          status: 'unknown',
          responseTime: -1,
          version: 'unknown',
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
    }

    return services;
  }

  async getProjectStats(projectPath?: string) {
    const targetPath = projectPath || this.projectRoot;

    try {
      const files = await this.listDirectoryWithExclusions(targetPath, true);
      const codeFiles = files.filter(
        f => f.type === 'file' && /\.(ts|js|tsx|jsx|vue|py|java|cs|php|rb|go|rs)$/.test(f.name),
      );

      const fileTypes: Record<string, number> = {};
      let totalLines = 0;

      for (const file of codeFiles) {
        try {
          const ext = path.extname(file.name);
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          totalLines += await FileUtils.countLines(file.path);
        } catch (error) {
          // Skip files that can't be read (permissions, etc.)
          this.logger.debug(`Skipping file ${file.path}: ${error.message}`);
        }
      }

      const packageSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

      return {
        totalFiles: files.length,
        codeFiles: codeFiles.length,
        totalLines,
        fileTypes,
        packageSize,
        packageSizeMB: Math.round(packageSize / 1024 / 1024),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get project stats: ${error.message}`);
      throw error;
    }
  }

  async getRecentFiles(projectPath?: string, limit = 10) {
    const targetPath = projectPath || this.projectRoot;

    try {
      const files = await this.listDirectoryWithExclusions(targetPath, true);
      const sortedFiles = files
        .filter(f => f.type === 'file')
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, limit);

      return {
        files: sortedFiles,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get recent files: ${error.message}`);
      throw error;
    }
  }

  /**
   * List directory contents with proper exclusions for restricted/unwanted directories
   */
  private async listDirectoryWithExclusions(dirPath: string, recursive = false) {
    const excludedDirectories = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.nyc_output',
      'logs',
      '*.log',
      '.env*',
      '.DS_Store',
      'Thumbs.db',
      '.vscode',
      '.idea',
      'temp',
      'tmp',
      '__pycache__',
      '.pytest_cache',
      'bin',
      '.bin',
    ];

    try {
      const items = await require('fs').promises.readdir(dirPath, { withFileTypes: true });
      const result = [];

      for (const item of items) {
        // Skip excluded directories and files
        if (
          excludedDirectories.includes(item.name) ||
          excludedDirectories.some(pattern => item.name.includes(pattern))
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, item.name);

        try {
          const stats = await FileUtils.getFileStats(fullPath);

          result.push({
            name: item.name,
            path: fullPath,
            type: item.isDirectory() ? 'directory' : 'file',
            ...stats,
          });

          if (recursive && item.isDirectory()) {
            const subItems = await this.listDirectoryWithExclusions(fullPath, true);
            result.push(...subItems);
          }
        } catch (error) {
          // Skip files/directories that can't be accessed
          this.logger.debug(`Skipping ${fullPath}: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      this.logger.warn(`Failed to list directory ${dirPath}: ${error.message}`);
      return [];
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async refreshProjectCache() {
    try {
      await this.scanProjects();
      this.logger.debug('Project cache refreshed');
    } catch (error) {
      this.logger.error(`Failed to refresh project cache: ${error.message}`);
    }
  }

  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await FileUtils.getFileStats(dirPath);
      return stats.isDirectory;
    } catch {
      return false;
    }
  }

  private async detectPort(projectPath: string): Promise<number | undefined> {
    try {
      // Try to read package.json for port configuration
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(
        await require('fs').promises.readFile(packageJsonPath, 'utf-8'),
      );

      // Look for port in scripts or config
      const scripts = packageJson.scripts || {};
      for (const script of Object.values(scripts)) {
        const portMatch = (script as string).match(/--port[=\s]+(\d+)/);
        if (portMatch) {
          return parseInt(portMatch[1]);
        }
      }

      // Check common config files
      const configFiles = ['.env', '.env.local', 'next.config.js', 'vite.config.js'];
      for (const configFile of configFiles) {
        try {
          const configPath = path.join(projectPath, configFile);
          const content = await require('fs').promises.readFile(configPath, 'utf-8');
          const portMatch = content.match(/PORT[=\s]*(\d+)/);
          if (portMatch) {
            return parseInt(portMatch[1]);
          }
        } catch {
          // File doesn't exist, continue
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to detect port for ${projectPath}: ${error.message}`);
    }

    return undefined;
  }
}
