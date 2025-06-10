export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  responseTime: number;
  version: string;
  timestamp: string;
  error?: string;
  details?: any;
}

export interface ProjectInfo {
  name: string;
  path: string;
  type: 'frontend' | 'backend' | 'microservice' | 'shared';
  port?: number;
  status: 'running' | 'stopped' | 'error';
  gitBranch: string;
  lastCommit: string;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
}

export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: any[];
  created: Date;
}
