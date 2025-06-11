import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from './session/session.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './utils/jwt.util';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username?: string;
    role: string;
    isActive: boolean;
  };
}

export interface RefreshResponse {
  accessToken: string;
}

@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);
  private readonly failedLoginAttempts: Map<string, number> = new Map();
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {
    // Set up periodic cleanup of failed login attempts
    this.cleanupInterval = setInterval(() => this.cleanupFailedAttempts(), 60 * 60 * 1000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const { email, password, username } = data;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          role: 'USER',
          isActive: true,
        },
      });

      this.logger.log(`User registered successfully: ${user.id}`);
      return { message: 'User registered successfully' };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Login user and create session
   */
  async login(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ response: LoginResponse; refreshToken: string }> {
    const { email, password } = data;

    // Check failed login attempts
    if (this.isAccountLocked(email)) {
      throw new UnauthorizedException('Account temporarily locked due to failed login attempts');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive || user.isDeleted || user.isBanned) {
      this.recordFailedLogin(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.recordFailedLogin(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clear failed login attempts on successful login
    this.clearFailedLogin(email);

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Create session using new Redis-based service
    const sessionResult = await this.sessionService.createSession(user.id, refreshToken);

    // Update user online status
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastOnlineAt: new Date(),
      },
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    return {
      response: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
        },
      },
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(
    oldRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ response: RefreshResponse; refreshToken: string }> {
    // Verify refresh token
    const payload = verifyRefreshToken(oldRefreshToken);
    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find valid session
    const session = await this.sessionService.findValidSession(oldRefreshToken);
    if (!session) {
      throw new UnauthorizedException('Session not found or expired');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
        isActive: true,
        isDeleted: false,
        isBanned: false,
      },
    });

    if (!user) {
      // Invalidate session if user is not valid
      await this.sessionService.invalidateSession(oldRefreshToken);
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Rotate session for security
    const rotated = await this.sessionService.rotateSession(oldRefreshToken);
    if (!rotated) {
      throw new UnauthorizedException('Failed to rotate session');
    }

    this.logger.log(`Tokens refreshed for user: ${user.id}`);

    return {
      response: {
        accessToken: newAccessToken,
      },
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user and invalidate session
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const invalidated = await this.sessionService.invalidateSession(refreshToken);

    if (invalidated) {
      // Try to find user and update online status
      const payload = verifyRefreshToken(refreshToken);
      if (payload?.userId) {
        try {
          await this.prisma.user.update({
            where: { id: payload.userId },
            data: {
              isOnline: false,
              lastOnlineAt: new Date(),
            },
          });
        } catch (error) {
          // Don't fail logout if user update fails
          this.logger.warn(`Failed to update user online status: ${error.message}`);
        }
      }
    }

    this.logger.log('User logged out successfully');
    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices (invalidate all sessions)
   */
  async logoutAll(userId: string): Promise<{ message: string }> {
    const count = await this.sessionService.invalidateAllUserSessions(userId);

    // Update user online status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false,
        lastOnlineAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} logged out from all devices (${count} sessions)`);
    return { message: `Logged out from ${count} devices` };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        isOnline: true,
        lastOnlineAt: true,
        createdAt: true,
        updatedAt: true,
        userProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Get active sessions for user
   */
  async getActiveSessions(userId: string) {
    return this.sessionService.getUserActiveSessions(userId);
  }

  // Private helper methods for failed login tracking
  private recordFailedLogin(email: string): void {
    const attempts = this.failedLoginAttempts.get(email) || 0;
    this.failedLoginAttempts.set(email, attempts + 1);
  }

  private clearFailedLogin(email: string): void {
    this.failedLoginAttempts.delete(email);
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.failedLoginAttempts.get(email) || 0;
    return attempts >= this.maxFailedAttempts;
  }

  private cleanupFailedAttempts(): void {
    // In a production environment, you might want to implement
    // time-based expiration instead of periodic cleanup
    this.failedLoginAttempts.clear();
  }
}
