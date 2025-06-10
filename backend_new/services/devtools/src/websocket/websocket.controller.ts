import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevToolsWebSocketGateway } from './websocket.gateway';

@ApiTags('WebSocket')
@Controller('api/websocket')
export class WebSocketController {
  constructor(private readonly webSocketGateway: DevToolsWebSocketGateway) {}

  @Get('connections')
  @ApiOperation({ summary: 'Get active WebSocket connections' })
  @ApiResponse({
    status: 200,
    description: 'List of active WebSocket connections',
    schema: {
      type: 'object',
      properties: {
        totalConnections: { type: 'number' },
        connections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              connectedAt: { type: 'string', format: 'date-time' },
              rooms: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  getActiveConnections() {
    return this.webSocketGateway.getActiveConnections();
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast message to all connected clients' })
  @ApiBody({
    description: 'Message to broadcast',
    schema: {
      type: 'object',
      properties: {
        event: { type: 'string', description: 'Event name' },
        data: { type: 'object', description: 'Message data' },
        room: { type: 'string', description: 'Optional room to broadcast to' },
      },
      required: ['event', 'data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message broadcasted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        messageId: { type: 'string' },
        sentTo: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  broadcastMessage(@Body() { event, data, room }: { event: string; data: any; room?: string }) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    if (room) {
      this.webSocketGateway.broadcastToRoom(room, event, data);
    } else {
      this.webSocketGateway.broadcast(event, data);
    }

    const connections = this.webSocketGateway.getActiveConnections();
    const sentTo = room
      ? connections.connections.filter(conn => conn.rooms.includes(room)).length
      : connections.totalConnections;

    return {
      success: true,
      messageId,
      sentTo,
      timestamp,
    };
  }

  @Post('rooms/:room/join/:clientId')
  @ApiOperation({ summary: 'Add client to a specific room' })
  @ApiParam({ name: 'room', description: 'Room name', example: 'monitoring' })
  @ApiParam({ name: 'clientId', description: 'Client ID', example: 'client-123' })
  @ApiResponse({
    status: 200,
    description: 'Client added to room successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        room: { type: 'string' },
        clientId: { type: 'string' },
      },
    },
  })
  joinRoom(@Param('room') room: string, @Param('clientId') clientId: string) {
    this.webSocketGateway.addClientToRoom(clientId, room);
    return {
      success: true,
      room,
      clientId,
    };
  }

  @Post('rooms/:room/leave/:clientId')
  @ApiOperation({ summary: 'Remove client from a specific room' })
  @ApiParam({ name: 'room', description: 'Room name', example: 'monitoring' })
  @ApiParam({ name: 'clientId', description: 'Client ID', example: 'client-123' })
  @ApiResponse({
    status: 200,
    description: 'Client removed from room successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        room: { type: 'string' },
        clientId: { type: 'string' },
      },
    },
  })
  leaveRoom(@Param('room') room: string, @Param('clientId') clientId: string) {
    this.webSocketGateway.removeClientFromRoom(clientId, room);
    return {
      success: true,
      room,
      clientId,
    };
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get all available rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of all rooms',
    schema: {
      type: 'object',
      properties: {
        rooms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              clientCount: { type: 'number' },
              clients: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  getRooms() {
    return this.webSocketGateway.getRooms();
  }

  @Post('monitoring/start')
  @ApiOperation({ summary: 'Start real-time monitoring' })
  @ApiBody({
    description: 'Monitoring configuration',
    schema: {
      type: 'object',
      properties: {
        interval: { type: 'number', description: 'Update interval in milliseconds', default: 5000 },
        metrics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Metrics to monitor',
          default: ['health', 'docker', 'project'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Monitoring started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        monitoringId: { type: 'string' },
        interval: { type: 'number' },
        metrics: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  startMonitoring(@Body() config: { interval?: number; metrics?: string[] }) {
    const monitoringId = this.webSocketGateway.startMonitoring(
      config.interval || 5000,
      config.metrics || ['health', 'docker', 'project'],
    );

    return {
      success: true,
      monitoringId,
      interval: config.interval || 5000,
      metrics: config.metrics || ['health', 'docker', 'project'],
    };
  }

  @Post('monitoring/stop')
  @ApiOperation({ summary: 'Stop real-time monitoring' })
  @ApiResponse({
    status: 200,
    description: 'Monitoring stopped successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        stoppedMonitors: { type: 'number' },
      },
    },
  })
  stopMonitoring() {
    const stoppedMonitors = this.webSocketGateway.stopMonitoring();
    return {
      success: true,
      stoppedMonitors,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get WebSocket server health status' })
  @ApiResponse({
    status: 200,
    description: 'WebSocket server health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        uptime: { type: 'number' },
        totalConnections: { type: 'number' },
        activeMonitors: { type: 'number' },
        serverStartTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  getHealth() {
    return this.webSocketGateway.getHealth();
  }
}
