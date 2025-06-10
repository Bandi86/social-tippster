import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DockerService } from '../docker/docker.service';
import { HealthService } from '../health/health.service';
import { ProjectService } from '../project/project.service';

interface ClientSubscription {
  projectUpdates: boolean;
  healthUpdates: boolean;
  dockerUpdates: boolean;
  logUpdates: boolean;
}

interface ClientInfo {
  id: string;
  connectedAt: Date;
  rooms: Set<string>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/devtools',
})
export class DevToolsWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DevToolsWebSocketGateway.name);
  private clients: Map<string, ClientSubscription> = new Map();
  private clientInfo: Map<string, ClientInfo> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private serverStartTime: Date = new Date();

  constructor(
    private readonly projectService: ProjectService,
    private readonly healthService: HealthService,
    private readonly dockerService: DockerService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Initialize client subscription preferences
    this.clients.set(client.id, {
      projectUpdates: false,
      healthUpdates: false,
      dockerUpdates: false,
      logUpdates: false,
    });

    // Store client info
    this.clientInfo.set(client.id, {
      id: client.id,
      connectedAt: new Date(),
      rooms: new Set(),
    });

    // Send initial connection confirmation
    client.emit('connected', {
      message: 'Connected to DevTools MCP Server',
      timestamp: new Date().toISOString(),
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove client from all rooms
    const clientData = this.clientInfo.get(client.id);
    if (clientData) {
      clientData.rooms.forEach(room => {
        this.removeClientFromRoom(client.id, room);
      });
    }

    // Clean up client data
    this.clients.delete(client.id);
    this.clientInfo.delete(client.id);

    // Clear any active intervals for this client
    const intervalKey = `${client.id}-updates`;
    if (this.updateIntervals.has(intervalKey)) {
      clearInterval(this.updateIntervals.get(intervalKey));
      this.updateIntervals.delete(intervalKey);
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() data: { events: string[] }, @ConnectedSocket() client: Socket) {
    const subscription = this.clients.get(client.id);
    if (!subscription) return;

    // Update subscription preferences
    subscription.projectUpdates = data.events.includes('project');
    subscription.healthUpdates = data.events.includes('health');
    subscription.dockerUpdates = data.events.includes('docker');
    subscription.logUpdates = data.events.includes('logs');

    this.clients.set(client.id, subscription);

    this.logger.log(`Client ${client.id} subscribed to: ${data.events.join(', ')}`);

    // Start sending updates if any subscriptions are active
    this.startUpdates(client);

    client.emit('subscribed', {
      events: data.events,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@MessageBody() data: { events: string[] }, @ConnectedSocket() client: Socket) {
    const subscription = this.clients.get(client.id);
    if (!subscription) return;

    // Update subscription preferences
    if (data.events.includes('project')) subscription.projectUpdates = false;
    if (data.events.includes('health')) subscription.healthUpdates = false;
    if (data.events.includes('docker')) subscription.dockerUpdates = false;
    if (data.events.includes('logs')) subscription.logUpdates = false;

    this.clients.set(client.id, subscription);

    this.logger.log(`Client ${client.id} unsubscribed from: ${data.events.join(', ')}`);

    // Stop updates if no subscriptions are active
    const hasActiveSubscriptions = Object.values(subscription).some(Boolean);
    if (!hasActiveSubscriptions) {
      this.stopUpdates(client);
    }

    client.emit('unsubscribed', {
      events: data.events,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('getProjectOverview')
  async handleGetProjectOverview(@ConnectedSocket() client: Socket) {
    try {
      const overview = await this.projectService.getProjectOverview();
      client.emit('projectOverview', overview);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to get project overview',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('getHealthStatus')
  async handleGetHealthStatus(@ConnectedSocket() client: Socket) {
    try {
      const healthStatus = await this.healthService.getServiceHealth('devtools');
      client.emit('healthStatus', healthStatus);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to get health status',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('getDockerContainers')
  async handleGetDockerContainers(@ConnectedSocket() client: Socket) {
    try {
      const containers = await this.dockerService.listContainers();
      client.emit('dockerContainers', containers);
    } catch (error) {
      client.emit('error', {
        message: 'Failed to get Docker containers',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // New methods for WebSocket controller integration
  getActiveConnections() {
    const connections = Array.from(this.clientInfo.values()).map(client => ({
      id: client.id,
      connectedAt: client.connectedAt.toISOString(),
      rooms: Array.from(client.rooms),
    }));

    return {
      totalConnections: connections.length,
      connections,
    };
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, {
      data,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, {
      data,
      room,
      timestamp: new Date().toISOString(),
    });
  }

  addClientToRoom(clientId: string, room: string) {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.join(room);

      // Update client info
      const clientData = this.clientInfo.get(clientId);
      if (clientData) {
        clientData.rooms.add(room);
      }

      // Update rooms map
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      this.rooms.get(room)!.add(clientId);

      this.logger.log(`Client ${clientId} joined room ${room}`);
    }
  }

  removeClientFromRoom(clientId: string, room: string) {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.leave(room);

      // Update client info
      const clientData = this.clientInfo.get(clientId);
      if (clientData) {
        clientData.rooms.delete(room);
      }

      // Update rooms map
      if (this.rooms.has(room)) {
        this.rooms.get(room)!.delete(clientId);
        if (this.rooms.get(room)!.size === 0) {
          this.rooms.delete(room);
        }
      }

      this.logger.log(`Client ${clientId} left room ${room}`);
    }
  }

  getRooms() {
    const rooms = Array.from(this.rooms.entries()).map(([name, clients]) => ({
      name,
      clientCount: clients.size,
      clients: Array.from(clients),
    }));

    return { rooms };
  }

  startMonitoring(interval: number, metrics: string[]): string {
    const monitoringId = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const monitoringInterval = setInterval(async () => {
      try {
        const monitoringData: any = {
          timestamp: new Date().toISOString(),
          metrics: {},
        };

        // Collect requested metrics
        if (metrics.includes('health')) {
          monitoringData.metrics.health = await this.healthService.checkAllServices();
        }

        if (metrics.includes('docker')) {
          monitoringData.metrics.docker = await this.dockerService.listContainers();
        }

        if (metrics.includes('project')) {
          monitoringData.metrics.project = await this.projectService.getProjectOverview();
        }

        // Broadcast monitoring data
        this.broadcast('monitoring', monitoringData);
      } catch (error) {
        this.logger.error(`Monitoring error: ${error.message}`);
        this.broadcast('monitoringError', {
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }, interval);

    this.monitoringIntervals.set(monitoringId, monitoringInterval);
    this.logger.log(`Started monitoring with ID: ${monitoringId}, interval: ${interval}ms`);

    return monitoringId;
  }

  stopMonitoring(): number {
    const stoppedCount = this.monitoringIntervals.size;

    this.monitoringIntervals.forEach((interval, id) => {
      clearInterval(interval);
      this.logger.log(`Stopped monitoring with ID: ${id}`);
    });

    this.monitoringIntervals.clear();

    return stoppedCount;
  }

  getHealth() {
    const uptime = Date.now() - this.serverStartTime.getTime();
    const activeMonitors = this.monitoringIntervals.size;
    const totalConnections = this.clientInfo.size;

    return {
      status: 'healthy',
      uptime,
      totalConnections,
      activeMonitors,
      serverStartTime: this.serverStartTime.toISOString(),
    };
  }

  private startUpdates(client: Socket) {
    const intervalKey = `${client.id}-updates`;

    // Clear existing interval if any
    if (this.updateIntervals.has(intervalKey)) {
      clearInterval(this.updateIntervals.get(intervalKey));
    }

    // Start new interval for updates
    const interval = setInterval(async () => {
      const subscription = this.clients.get(client.id);
      if (!subscription) {
        clearInterval(interval);
        this.updateIntervals.delete(intervalKey);
        return;
      }

      try {
        // Send project updates
        if (subscription.projectUpdates) {
          const projectStats = await this.projectService.getProjectStats();
          client.emit('projectUpdate', {
            type: 'stats',
            data: projectStats,
            timestamp: new Date().toISOString(),
          });
        }

        // Send health updates
        if (subscription.healthUpdates) {
          const healthStatus = await this.healthService.getServiceHealth('devtools');
          client.emit('healthUpdate', {
            type: 'service',
            data: healthStatus,
            timestamp: new Date().toISOString(),
          });
        }

        // Send Docker updates
        if (subscription.dockerUpdates) {
          const containers = await this.dockerService.listContainers();
          client.emit('dockerUpdate', {
            type: 'containers',
            data: containers,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        this.logger.error(`Error sending updates to client ${client.id}:`, error.message);
      }
    }, 5000); // Update every 5 seconds

    this.updateIntervals.set(intervalKey, interval);
  }

  private stopUpdates(client: Socket) {
    const intervalKey = `${client.id}-updates`;
    if (this.updateIntervals.has(intervalKey)) {
      clearInterval(this.updateIntervals.get(intervalKey));
      this.updateIntervals.delete(intervalKey);
      this.logger.log(`Stopped updates for client ${client.id}`);
    }
  }

  // Broadcast methods for external use
  broadcastProjectUpdate(data: any) {
    this.server.emit('projectUpdate', {
      type: 'broadcast',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastHealthUpdate(data: any) {
    this.server.emit('healthUpdate', {
      type: 'broadcast',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastDockerUpdate(data: any) {
    this.server.emit('dockerUpdate', {
      type: 'broadcast',
      data,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastLog(level: string, message: string, metadata?: any) {
    this.server.emit('logUpdate', {
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }
}
