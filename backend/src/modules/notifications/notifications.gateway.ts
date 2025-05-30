import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'http';
import type { WebSocket as WSWebSocket } from 'ws';
import { Server } from 'ws';
import { Notification } from './entities/notification.entity';

/**
 * Standardized payload for notification WebSocket events.
 */
export type WebSocketNotificationPayload = {
  type: string;
  notification?: Notification | null;
  meta?: Record<string, any> | null;
  timestamp: string;
};

@WebSocketGateway({
  path: '/ws/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Set<WSWebSocket>> = new Map();

  handleConnection(client: WSWebSocket, req: IncomingMessage & { url?: string }) {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = url.searchParams.get('user_id');
      if (!userId) {
        if (
          client &&
          Object.prototype.hasOwnProperty.call(client, 'close') &&
          typeof (client as { close?: () => void }).close === 'function'
        ) {
          (client as { close: () => void }).close();
        }
        return;
      }
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId)!.add(client);
      if (
        client &&
        Object.prototype.hasOwnProperty.call(client, 'on') &&
        typeof (client as { on?: (event: string, cb: () => void) => void }).on === 'function'
      ) {
        (client as { on: (event: string, cb: () => void) => void }).on('close', () =>
          this._handleDisconnect(client, req),
        );
      }
    } catch {
      // ignore error
    }
  }

  // Belső, mert az interface miatt a handleDisconnect csak 1 paramétert kap
  private _handleDisconnect(client: WSWebSocket, req: IncomingMessage & { url?: string }) {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = url.searchParams.get('user_id');
      if (userId && this.clients.has(userId)) {
        this.clients.get(userId)!.delete(client);
        if (this.clients.get(userId)!.size === 0) {
          this.clients.delete(userId);
        }
      }
    } catch {
      // ignore error
    }
  }

  handleDisconnect(client: WSWebSocket) {
    // Nem tudjuk a req-et, végigmegyünk a map-en
    for (const [userId, set] of this.clients.entries()) {
      if (set.has(client)) {
        set.delete(client);
        if (set.size === 0) this.clients.delete(userId);
        break;
      }
    }
  }

  /**
   * Notify a user via WebSocket with a standardized payload structure.
   * @param userId - The user to notify
   * @param payload - The notification payload (type, notification, meta, timestamp)
   */
  notifyUser(userId: string, payload: WebSocketNotificationPayload) {
    const sockets = this.clients.get(userId);
    if (sockets) {
      for (const ws of sockets) {
        if (
          ws &&
          Object.prototype.hasOwnProperty.call(ws, 'readyState') &&
          Object.prototype.hasOwnProperty.call(ws, 'send') &&
          typeof (ws as { send?: (data: string) => void }).send === 'function' &&
          (ws as { readyState: number; OPEN: number }).readyState === (ws as { OPEN: number }).OPEN
        ) {
          (ws as { send: (data: string) => void }).send(
            JSON.stringify({
              type: payload.type,
              notification: payload.notification ?? null,
              meta: payload.meta ?? null,
              timestamp: payload.timestamp || new Date().toISOString(),
            }),
          );
        }
      }
    }
  }
}
