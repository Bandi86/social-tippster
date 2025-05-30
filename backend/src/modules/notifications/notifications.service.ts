import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway, WebSocketNotificationPayload } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // Új értesítés létrehozása és real-time küldése websocketen
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const saved = await this.notificationRepository.save(notification);
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

  // Egy értesítés lekérdezése ID alapján
  async findOne(id: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { notification_id: id } });
  }

  // Értesítés frissítése
  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification | null> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  // Egy értesítés olvasottra állítása és websocket értesítés küldése
  async markAsRead(id: string): Promise<Notification | null> {
    await this.notificationRepository.update(id, { read_status: true, read_at: new Date() });
    const notif = await this.findOne(id);
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
    const result = await this.notificationRepository.update(
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

  // Értesítés törlése
  async remove(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
