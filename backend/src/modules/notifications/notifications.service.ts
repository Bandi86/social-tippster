import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway, WebSocketNotificationPayload } from './notifications.gateway';

// --- Interfaces for method signatures ---
export interface INotificationsService {
  create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
  findAll(userId: string): Promise<Notification[]>;
  findOne(id: string, userId?: string): Promise<Notification | null>;
  update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId?: string,
  ): Promise<Notification | null>;
  markAsRead(id: string, userId?: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<number>;
  remove(id: string, userId?: string): Promise<void>;
  removeAll(userId: string): Promise<number>;
}

@Injectable()
export class NotificationsService implements INotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // Új értesítés létrehozása és real-time küldése websocketen
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification: Notification = this.notificationRepository.create(createNotificationDto);
    const saved: Notification = await this.notificationRepository.save(notification);
    // Valós idejű push websocketen keresztül
    if (this.notificationsGateway && typeof this.notificationsGateway.notifyUser === 'function') {
      const payload: WebSocketNotificationPayload = {
        type: 'new_notification',
        notification: saved,
        timestamp: new Date().toISOString(),
      };
      this.notificationsGateway.notifyUser(saved.user_id, payload);
    }
    return saved;
  }

  // Felhasználó összes értesítésének lekérdezése
  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // Egy értesítés lekérdezése ID alapján (csak saját értesítés)
  async findOne(id: string, userId?: string): Promise<Notification | null> {
    const notification: Notification | null = await this.notificationRepository.findOne({
      where: { notification_id: id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Ha userId megvan adva, ellenőrizzük, hogy saját értesítés-e
    if (userId && notification.user_id !== userId) {
      throw new ForbiddenException('You can only access your own notifications');
    }

    return notification;
  }

  // Értesítés frissítése (csak saját értesítés)
  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId?: string,
  ): Promise<Notification | null> {
    // Először ellenőrizzük, hogy létezik és saját értesítés-e
    const existing: Notification | null = await this.findOne(id, userId);
    if (!existing) {
      return null;
    }

    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  // Egy értesítés olvasottra állítása és websocket értesítés küldése (csak saját értesítés)
  async markAsRead(id: string, userId?: string): Promise<Notification | null> {
    // Először ellenőrizzük, hogy létezik és saját értesítés-e
    const existing: Notification | null = await this.findOne(id, userId);
    if (!existing) {
      return null;
    }

    await this.notificationRepository.update(id, { read_status: true, read_at: new Date() });
    const notif: Notification | null = await this.findOne(id);
    if (
      notif &&
      this.notificationsGateway &&
      typeof this.notificationsGateway.notifyUser === 'function'
    ) {
      const payload: WebSocketNotificationPayload = {
        type: 'notification_read',
        notification: notif,
        timestamp: new Date().toISOString(),
      };
      this.notificationsGateway.notifyUser(notif.user_id, payload);
    }
    return notif;
  }

  // Összes nem olvasott értesítés olvasottra állítása és websocket értesítés küldése
  async markAllAsRead(userId: string): Promise<number> {
    const result: { affected?: number } = await this.notificationRepository.update(
      { user_id: userId, read_status: false },
      { read_status: true, read_at: new Date() },
    );
    if (this.notificationsGateway && typeof this.notificationsGateway.notifyUser === 'function') {
      const payload: WebSocketNotificationPayload = {
        type: 'all_read',
        notification: null,
        timestamp: new Date().toISOString(),
      };
      this.notificationsGateway.notifyUser(userId, payload);
    }
    return result.affected || 0;
  }

  // Értesítés törlése (csak saját értesítés)
  async remove(id: string, userId?: string): Promise<void> {
    // Először ellenőrizzük, hogy létezik és saját értesítés-e
    const existing: Notification | null = await this.findOne(id, userId);
    if (!existing) {
      return;
    }

    await this.notificationRepository.delete(id);
  }

  // Összes értesítés törlése (csak saját értesítések)
  async removeAll(userId: string): Promise<number> {
    const result: DeleteResult = await this.notificationRepository.delete({
      user_id: userId,
    });
    // Opcionális: websocket értesítés küldése törlésről
    if (this.notificationsGateway && typeof this.notificationsGateway.notifyUser === 'function') {
      const payload: WebSocketNotificationPayload = {
        type: 'all_deleted',
        notification: null,
        timestamp: new Date().toISOString(),
      };
      this.notificationsGateway.notifyUser(userId, payload);
    }
    return result.affected ?? 0;
  }
}
