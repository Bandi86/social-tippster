const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { INestApplication } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { JwtModule } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { ConfigModule, ConfigService } = require('@nestjs/config');

const { AppModule } = require('../../backend/src/app.module');
const { UsersModule } = require('../../backend/src/modules/users/users.module');
const { AuthModule } = require('../../backend/src/modules/auth/auth.module');

describe('Notification Preferences Integration Tests', () => {
  let app;
  let server;
  let adminToken;
  let regularUserToken;
  let testUserId;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // Create test users and get tokens
    await setupTestUsers();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function setupTestUsers() {
    // Register a test user
    const registerResponse = await request(server).post('/auth/register').send({
      email: 'testuser@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    });

    if (registerResponse.status === 201 || registerResponse.status === 409) {
      // Login to get token
      const loginResponse = await request(server).post('/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      if (loginResponse.status === 200 || loginResponse.status === 201) {
        regularUserToken = loginResponse.body.access_token;
        testUserId = loginResponse.body.user.user_id;
      }
    }

    // Get admin token (assuming admin user exists)
    const adminLoginResponse = await request(server).post('/auth/login').send({
      email: 'admin@socialtippster.com',
      password: 'admin123',
    });

    if (adminLoginResponse.status === 200 || adminLoginResponse.status === 201) {
      adminToken = adminLoginResponse.body.access_token;
    }
  }

  describe('GET /users/me/notification-preferences', () => {
    it('should return default notification preferences for new user', async () => {
      const response = await request(server)
        .get('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('notification_preferences');
      const prefs = response.body.notification_preferences;

      // Check default preferences structure
      expect(prefs).toHaveProperty('comment');
      expect(prefs).toHaveProperty('mention');
      expect(prefs).toHaveProperty('follow');

      // Check default values (in_app enabled, email for mentions only, push disabled)
      expect(prefs.comment).toEqual({ in_app: true, email: false, push: false });
      expect(prefs.mention).toEqual({ in_app: true, email: true, push: false });
      expect(prefs.follow).toEqual({ in_app: true, email: false, push: false });
    });

    it('should require authentication', async () => {
      await request(server).get('/users/me/notification-preferences').expect(401);
    });

    it('should reject invalid token', async () => {
      await request(server)
        .get('/users/me/notification-preferences')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /users/me/notification-preferences', () => {
    it('should update notification preferences partially', async () => {
      const updateData = {
        notification_preferences: {
          comment: { email: true },
          mention: { push: true },
        },
      };

      const response = await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateData)
        .expect(200);

      const prefs = response.body.notification_preferences;

      // Check that partial updates were applied
      expect(prefs.comment).toEqual({ in_app: true, email: true, push: false });
      expect(prefs.mention).toEqual({ in_app: true, email: true, push: true });
      expect(prefs.follow).toEqual({ in_app: true, email: false, push: false }); // unchanged
    });

    it('should update all notification preferences', async () => {
      const updateData = {
        notification_preferences: {
          comment: { in_app: false, email: true, push: true },
          mention: { in_app: true, email: false, push: true },
          follow: { in_app: false, email: true, push: false },
        },
      };

      const response = await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateData)
        .expect(200);

      const prefs = response.body.notification_preferences;

      expect(prefs.comment).toEqual({ in_app: false, email: true, push: true });
      expect(prefs.mention).toEqual({ in_app: true, email: false, push: true });
      expect(prefs.follow).toEqual({ in_app: false, email: true, push: false });
    });

    it('should require authentication', async () => {
      await request(server)
        .put('/users/me/notification-preferences')
        .send({ notification_preferences: {} })
        .expect(401);
    });

    it('should validate request body', async () => {
      // Invalid data type
      await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ notification_preferences: 'invalid' })
        .expect(400);
    });

    it('should handle empty updates gracefully', async () => {
      const response = await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ notification_preferences: {} })
        .expect(200);

      // Should return current preferences unchanged
      expect(response.body).toHaveProperty('notification_preferences');
    });
  });

  describe('POST /users/me/notification-preferences/reset', () => {
    it('should reset notification preferences to defaults', async () => {
      // First, update preferences to non-default values
      await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          notification_preferences: {
            comment: { in_app: false, email: true, push: true },
            mention: { in_app: false, email: false, push: true },
            follow: { in_app: false, email: true, push: true },
          },
        });

      // Then reset to defaults
      const response = await request(server)
        .post('/users/me/notification-preferences/reset')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(201);

      const prefs = response.body.notification_preferences;

      // Should match default preferences
      expect(prefs.comment).toEqual({ in_app: true, email: false, push: false });
      expect(prefs.mention).toEqual({ in_app: true, email: true, push: false });
      expect(prefs.follow).toEqual({ in_app: true, email: false, push: false });
    });

    it('should require authentication', async () => {
      await request(server).post('/users/me/notification-preferences/reset').expect(401);
    });
  });

  describe('Persistence Tests', () => {
    it('should persist preferences across requests', async () => {
      const updateData = {
        notification_preferences: {
          comment: { in_app: false, email: true, push: false },
          mention: { in_app: true, email: false, push: true },
          follow: { in_app: false, email: false, push: false },
        },
      };

      // Update preferences
      await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateData)
        .expect(200);

      // Fetch preferences in a separate request
      const response = await request(server)
        .get('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      const prefs = response.body.notification_preferences;
      expect(prefs.comment).toEqual({ in_app: false, email: true, push: false });
      expect(prefs.mention).toEqual({ in_app: true, email: false, push: true });
      expect(prefs.follow).toEqual({ in_app: false, email: false, push: false });
    });

    it('should handle incremental updates correctly', async () => {
      // Start with defaults
      await request(server)
        .post('/users/me/notification-preferences/reset')
        .set('Authorization', `Bearer ${regularUserToken}`);

      // Update only comment notifications
      await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          notification_preferences: {
            comment: { email: true, push: true },
          },
        });

      // Update only mention notifications
      await request(server)
        .put('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          notification_preferences: {
            mention: { in_app: false, push: true },
          },
        });

      // Verify final state
      const response = await request(server)
        .get('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(200);

      const prefs = response.body.notification_preferences;
      expect(prefs.comment).toEqual({ in_app: true, email: true, push: true });
      expect(prefs.mention).toEqual({ in_app: false, email: true, push: true });
      expect(prefs.follow).toEqual({ in_app: true, email: false, push: false }); // unchanged
    });
  });
});
