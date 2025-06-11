import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface FreshUserData {
  id: string;
  email: string;
  username?: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  isOnline: boolean;
  lastOnlineAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fresh User Data Service
 *
 * Follows the principle: "SSR API minden fetch-nél lekérdezi a DB-t"
 * - Minden user adat frissen a DB-ből
 * - Soha nincs cache-elés
 * - Mindig aktuális user státusz (ban, delete, active)
 */
@Injectable()
export class FreshUserDataService {
  private readonly logger = new Logger(FreshUserDataService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get fresh user data from database
   * MINDIG a DB-ből kérdezi le, soha cache-ből!
   */
  async getFreshUserData(userId: string): Promise<FreshUserData | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          isBanned: true,
          isDeleted: true,
          isOnline: true,
          lastOnlineAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to get fresh user data for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Validate user and return fresh data
   * Ha nincs user vagy inaktív, null-t ad vissza
   */
  async validateAndGetFreshUser(userId: string): Promise<FreshUserData> {
    const user = await this.getFreshUserData(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is banned
    if (user.isBanned) {
      this.logger.warn(`Banned user attempted access: ${userId}`);
      throw new UnauthorizedException('User is banned');
    }

    // Check if user is deleted
    if (user.isDeleted) {
      this.logger.warn(`Deleted user attempted access: ${userId}`);
      throw new UnauthorizedException('User is deleted');
    }

    // Check if user is active
    if (!user.isActive) {
      this.logger.warn(`Inactive user attempted access: ${userId}`);
      throw new UnauthorizedException('User is inactive');
    }

    return user;
  }

  /**
   * Update user online status
   */
  async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastOnlineAt: new Date(),
        },
      });

      this.logger.log(`Updated online status for user ${userId}: ${isOnline}`);
    } catch (error) {
      this.logger.error(`Failed to update online status for user ${userId}:`, error);
      // Don't throw error - online status update is not critical
    }
  }

  /**
   * Check if user exists and is valid (for session validation)
   */
  async isUserValid(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          isActive: true,
          isBanned: true,
          isDeleted: true,
        },
      });

      if (!user) {
        return false;
      }

      return user.isActive && !user.isBanned && !user.isDeleted;
    } catch (error) {
      this.logger.error(`Failed to validate user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user profile data (safe for public use)
   */
  async getUserProfile(userId: string): Promise<Partial<FreshUserData> | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          // Include profile relation if needed
          userProfile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              bio: true,
              website: true,
              location: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to get user profile for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Bulk validate users (for admin operations)
   */
  async validateMultipleUsers(userIds: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    try {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          isActive: true,
          isBanned: true,
          isDeleted: true,
        },
      });

      // Mark all requested users as invalid first
      userIds.forEach(id => results.set(id, false));

      // Update with actual results
      users.forEach(user => {
        const isValid = user.isActive && !user.isBanned && !user.isDeleted;
        results.set(user.id, isValid);
      });

      return results;
    } catch (error) {
      this.logger.error('Failed to validate multiple users:', error);
      // Return all as invalid on error
      userIds.forEach(id => results.set(id, false));
      return results;
    }
  }
}
