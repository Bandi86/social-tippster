import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AnalyticsModule } from '../../backend/src/modules/admin/analytics-dashboard/analytics.module';
import { UserLogin } from '../../backend/src/modules/admin/analytics-dashboard/entities/user-login.entity';
import { UserSession } from '../../backend/src/modules/admin/analytics-dashboard/entities/user-session.entity';
import { AuthModule } from '../../backend/src/modules/auth/auth.module';
import { RefreshToken } from '../../backend/src/modules/auth/entities/refresh-token.entity';
import { User } from '../../backend/src/modules/users/entities/user.entity';
import { UsersModule } from '../../backend/src/modules/users/users.module';

describe('Authentication System Integration Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let userSessionRepository: Repository<UserSession>;
  let userLoginRepository: Repository<UserLogin>;

  // Test data
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
  };

  const secondTestUser = {
    username: 'testuser456',
    email: 'test2@example.com',
    password: 'TestPassword456!',
    first_name: 'Test2',
    last_name: 'User2',
  };

  let registeredUserId: string;
  let accessToken: string;
  let refreshTokenCookie: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: () => ({
            type: 'sqlite', // Use SQLite for in-memory tests
            database: ':memory:',
            entities: [User, RefreshToken, UserSession, UserLogin],
            synchronize: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: () => ({
            secret: 'test-jwt-secret',
            signOptions: { expiresIn: '15m' },
          }),
          inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        AnalyticsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = moduleRef.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    userSessionRepository = moduleRef.get<Repository<UserSession>>(getRepositoryToken(UserSession));
    userLoginRepository = moduleRef.get<Repository<UserLogin>>(getRepositoryToken(UserLogin));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Type assertion to avoid unsafe any access
      const body = response.body as { user: any };

      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('user_id');
      expect(body.user.email).toBe(testUser.email);
      expect(body.user.username).toBe(testUser.username);
      expect(body.user.first_name).toBe(testUser.first_name);
      expect(body.user.last_name).toBe(testUser.last_name);
      expect(body.user.is_active).toBe(true);
      expect(body.user.is_verified).toBe(false);
      expect(body.user.is_banned).toBe(false);
      expect(body.user.is_premium).toBe(false);
      expect(body.user).not.toHaveProperty('password_hash');

      registeredUserId = body.user.user_id;

      // Verify user exists in database
      const dbUser = await userRepository.findOne({ where: { user_id: registeredUserId } });
      expect(dbUser).toBeDefined();
      expect(dbUser && dbUser.email).toBe(testUser.email);
      expect(dbUser && dbUser.password_hash).toBeDefined();
      expect(dbUser && dbUser.password_hash).not.toBe(testUser.password);
    });

    it('should reject registration with duplicate email', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(409);
    });

    it('should reject registration with duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...secondTestUser,
          username: testUser.username,
        })
        .expect(409);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
        })
        .expect(400);

      expect(response.body.message).toContain('validation failed');
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email-format',
        })
        .expect(400);
    });

    it('should validate password minimum length', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          password: '123',
        })
        .expect(400);
    });
  });

  describe('User Login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.user_id).toBe(registeredUserId);
      expect(response.body.user.email).toBe(testUser.email);

      // Check for refresh token cookie
      const cookies = response.headers['set-cookie'];
      const cookiesArr = typeof cookies === 'string' ? [cookies] : cookies;
      expect(Array.isArray(cookiesArr)).toBe(true);
      const refreshCookie = getCookie(cookiesArr, 'refresh_token');
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('Secure');

      accessToken = response.body.access_token;
      refreshTokenCookie = refreshCookie!;

      // Verify refresh token is stored in database (hashed)
      const dbRefreshTokens = await refreshTokenRepository.find({
        where: { user_id: registeredUserId },
      });
      expect(Array.isArray(dbRefreshTokens)).toBe(true);
      expect(dbRefreshTokens).toHaveLength(1);
      expect(dbRefreshTokens[0]?.token_hash).toBeDefined();
      expect(dbRefreshTokens[0]?.expires_at).toBeDefined();

      // Verify user session is created
      const userSessions = await userSessionRepository.find({
        where: { user_id: registeredUserId },
      });
      expect(Array.isArray(userSessions)).toBe(true);
      expect(userSessions).toHaveLength(1);
      expect(userSessions[0]?.is_active).toBe(true);
      expect(userSessions[0]?.session_start).toBeDefined();

      // Verify login is tracked
      const userLogins = await userLoginRepository.find({ where: { user_id: registeredUserId } });
      expect(Array.isArray(userLogins)).toBe(true);
      expect(userLogins).toHaveLength(1);
      expect(userLogins[0]?.is_successful).toBe(true);
      expect(userLogins[0]?.login_date).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Hibás email vagy jelszó');

      // Verify failed login is tracked
      const userLogins = await userLoginRepository.find({
        where: {
          user_id: registeredUserId,
          is_successful: false,
        },
      });
      expect(userLogins).toHaveLength(1);
      expect(userLogins[0].failure_reason).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should implement brute force protection', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: secondTestUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      }

      // 6th attempt should be blocked
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: secondTestUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Túl sok sikertelen bejelentkezési kísérlet');
    });

    it('should validate login input', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user_id).toBe(registeredUserId);
      expect(response.body.email).toBe(testUser.email);
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject access with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token with valid refresh token cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshTokenCookie)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.access_token).not.toBe(accessToken);

      // Check for new refresh token cookie
      const cookies = response.headers['set-cookie'];
      const cookiesArr = typeof cookies === 'string' ? [cookies] : cookies;
      expect(Array.isArray(cookiesArr)).toBe(true);
      const newRefreshCookie = getCookie(cookiesArr, 'refresh_token');
      expect(newRefreshCookie).toBeDefined();
      expect(newRefreshCookie).not.toBe(refreshTokenCookie);

      // Update tokens for subsequent tests
      accessToken = response.body.access_token;
      refreshTokenCookie = newRefreshCookie!;

      // Verify old refresh token is revoked and new one is created
      const activeTokens = await refreshTokenRepository.find({
        where: { user_id: registeredUserId, is_revoked: false },
      });
      expect(Array.isArray(activeTokens)).toBe(true);
      expect(activeTokens).toHaveLength(1);
    });

    it('should reject refresh without cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should reject refresh with invalid cookie', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refresh_token=invalid-token')
        .expect(401);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toContain('Sikeres kijelentkezés');

      // Check that refresh token cookie is cleared
      const cookies = response.headers['set-cookie'];
      const cookiesArr = typeof cookies === 'string' ? [cookies] : cookies;
      if (Array.isArray(cookiesArr)) {
        const refreshCookie = getCookie(cookiesArr, 'refresh_token');
        if (refreshCookie) {
          expect(refreshCookie).toContain('Max-Age=0');
        }
      }

      // Verify refresh token is revoked in database
      const activeTokens = await refreshTokenRepository.find({
        where: { user_id: registeredUserId, is_revoked: false },
      });
      expect(Array.isArray(activeTokens)).toBe(true);
      expect(activeTokens).toHaveLength(0);

      // Verify user session is ended
      const activeSessions = await userSessionRepository.find({
        where: { user_id: registeredUserId, is_active: true },
      });
      expect(Array.isArray(activeSessions)).toBe(true);
      expect(activeSessions).toHaveLength(0);
    });

    it('should reject logout without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('Logout All Devices', () => {
    let newAccessToken: string;
    let newRefreshTokenCookie: string;

    beforeAll(async () => {
      // Login again to create new session
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      newAccessToken = loginResponse.body.access_token;
      const cookies = loginResponse.headers['set-cookie'];
      const cookiesArr = typeof cookies === 'string' ? [cookies] : cookies;
      newRefreshTokenCookie = getCookie(cookiesArr, 'refresh_token')!;
    });

    it('should logout from all devices', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      expect(response.body.message).toContain('Sikeres kijelentkezés minden eszközről');
      expect(response.body.devicesLoggedOut).toBe(1);

      // Verify all refresh tokens are revoked
      const activeTokens = await refreshTokenRepository.find({
        where: { user_id: registeredUserId, is_revoked: false },
      });
      expect(activeTokens).toHaveLength(0);

      // Verify all sessions are ended
      const activeSessions = await userSessionRepository.find({
        where: { user_id: registeredUserId, is_active: true },
      });
      expect(activeSessions).toHaveLength(0);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between users and refresh tokens', async () => {
      const user = await userRepository.findOne({ where: { user_id: registeredUserId } });
      expect(user).toBeDefined();

      const refreshTokens = await refreshTokenRepository.find({
        where: { user_id: registeredUserId },
      });
      expect(Array.isArray(refreshTokens)).toBe(true);

      // All refresh tokens should reference the correct user
      refreshTokens.forEach((token: RefreshToken) => {
        expect(token.user_id).toBe(registeredUserId);
      });
    });

    it('should store password hashes securely', async () => {
      const user = await userRepository.findOne({ where: { user_id: registeredUserId } });
      expect(user).toBeDefined();
      expect(user!.password_hash).toBeDefined();
      expect(user!.password_hash).not.toBe(testUser.password);
      expect(user!.password_hash.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 characters
      expect(user!.password_hash).toMatch(/^[$]2[ayb]\$.{56}$/); // bcrypt format
    });

    it('should store refresh token hashes securely', async () => {
      // Login to create a refresh token
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const refreshToken = await refreshTokenRepository.findOne({
        where: { user_id: registeredUserId, is_revoked: false },
      });

      expect(refreshToken).toBeDefined();
      expect(refreshToken!.token_hash).toBeDefined();
      expect(refreshToken!.token_hash.length).toBeGreaterThan(50); // bcrypt hashes
      expect(refreshToken!.token_hash).toMatch(/^[$]2[ayb]\$.{56}$/); // bcrypt format
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate JWT structure and claims', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      const token = response.body.access_token;
      expect(token).toBeDefined();

      // JWT should have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      // Decode payload (without verification for testing)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.sub).toBe(registeredUserId);
      expect(payload.email).toBe(testUser.email);
      expect(payload.type).toBe('access');
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(payload.exp > payload.iat).toBe(true);
    });

    it('should reject expired tokens', async () => {
      // Generate a token that expired 10 seconds ago using the test secret
      const expiredToken = jwt.sign(
        { sub: '123', name: 'John Doe' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: -10 },
      );

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('User State Management', () => {
    it('should handle inactive user login attempts', async () => {
      // First, deactivate the user (this would normally be done by an admin)
      await userRepository.update({ user_id: registeredUserId }, { is_active: false });

      // Try to login
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);

      // Reactivate user for other tests
      await userRepository.update({ user_id: registeredUserId }, { is_active: true });
    });

    it('should handle banned user login attempts', async () => {
      // Ban the user
      await userRepository.update({ user_id: registeredUserId }, { is_banned: true });

      // Try to login
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);

      // Unban user for other tests
      await userRepository.update({ user_id: registeredUserId }, { is_banned: false });
    });
  });

  describe('Analytics and Tracking', () => {
    it('should track successful logins with metadata', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .expect(200);

      // Verify login tracking
      const loginRecords = await userLoginRepository.find({
        where: { user_id: registeredUserId, is_successful: true },
        order: { login_date: 'DESC' },
        take: 1,
      });

      expect(loginRecords).toHaveLength(1);
      const loginRecord = loginRecords[0];
      expect(loginRecord.user_agent).toContain('Mozilla');
      expect(loginRecord.ip_address).toBeDefined();
      expect(loginRecord.login_date).toBeDefined();
      expect(loginRecord.session_start).toBeDefined();
    });

    it('should track failed logins with failure reasons', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      // Verify failed login tracking
      const failedLogins = await userLoginRepository.find({
        where: { user_id: registeredUserId, is_successful: false },
        order: { login_date: 'DESC' },
        take: 1,
      });

      expect(failedLogins).toHaveLength(1);
      const failedLogin = failedLogins[0];
      expect(failedLogin.failure_reason).toBe('Invalid credentials');
    });

    it('should track session information', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
        .expect(200);

      // Verify session tracking
      const sessions = await userSessionRepository.find({
        where: { user_id: registeredUserId, is_active: true },
        order: { session_start: 'DESC' },
        take: 1,
      });

      expect(sessions).toHaveLength(1);
      const session = sessions[0];
      expect(session.device_type).toBeDefined();
      expect(session.browser).toBeDefined();
      expect(session.session_start).toBeDefined();
      expect(session.is_active).toBe(true);
    });
  });
});

// --- Type-safe cookie extraction helper ---
function getCookie(cookies: string[] | undefined, cookieName: string): string | undefined {
  if (!Array.isArray(cookies)) return undefined;
  return cookies.find(cookie => cookie.startsWith(`${cookieName}=`));
}
