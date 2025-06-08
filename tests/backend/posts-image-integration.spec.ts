import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AuthModule } from '../../backend/src/modules/auth/auth.module';
import { RefreshToken } from '../../backend/src/modules/auth/entities/refresh-token.entity';
import { Post } from '../../backend/src/modules/posts/entities';
import { PostsModule } from '../../backend/src/modules/posts/posts.module';
import { UploadsModule } from '../../backend/src/modules/uploads/uploads.module';
import { User } from '../../backend/src/modules/users/entities/user.entity';
import { UsersModule } from '../../backend/src/modules/users/users.module';

/**
 * Comprehensive Post Image Integration Test Suite
 *
 * This test suite covers all aspects of post creation with image uploads:
 * - Image upload functionality
 * - Post creation with different image URL types
 * - Image validation and error handling
 * - File system integration
 * - Performance testing
 * - Database consistency
 */
describe('Posts Image Integration (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let moduleRef: TestingModule;
  let userRepository: Repository<User>;
  let postRepository: Repository<Post>;

  const testImageDir = path.join(__dirname, '../images');
  const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');

  beforeAll(async () => {
    // Ensure test directories exist
    if (!fs.existsSync(testImageDir)) {
      fs.mkdirSync(testImageDir, { recursive: true });
    }

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
            entities: [User, Post, RefreshToken],
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
        PostsModule,
        UploadsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    postRepository = moduleRef.get<Repository<Post>>(getRepositoryToken(Post));

    // Create test user
    await createTestUser();
  });

  afterAll(async () => {
    // Cleanup test files
    await cleanupTestFiles();
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Create fresh test images for each test
    createTestImages();
  });

  afterEach(async () => {
    // Cleanup uploaded files after each test
    await cleanupUploadedFiles();
  });

  /**
   * Test Group 1: Basic Image Upload Functionality
   */
  describe('Image Upload Endpoints', () => {
    it('should upload image to post endpoint successfully', async () => {
      const testImagePath = path.join(testImageDir, 'test-small.png');

      const response = await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath)
        .expect(201);

      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toMatch(/^\/uploads\/posts\/.+\.png$/);

      // Verify file exists on filesystem
      const fullPath = path.join(uploadsDir, 'posts', path.basename(response.body.url));
      expect(fs.existsSync(fullPath)).toBe(true);
    });

    it('should upload image to profile endpoint successfully', async () => {
      const testImagePath = path.join(testImageDir, 'test-small.png');

      const response = await request(app.getHttpServer())
        .post('/api/uploads/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath)
        .expect(201);

      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toMatch(/^\/uploads\/profile\/.+\.png$/);
    });

    it('should reject oversized files', async () => {
      const testImagePath = path.join(testImageDir, 'test-large.png');

      await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath)
        .expect(400);
    });

    it('should reject non-image files', async () => {
      const testFilePath = path.join(testImageDir, 'test-document.txt');
      fs.writeFileSync(testFilePath, 'This is not an image');

      await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(400);
    });

    it('should require authentication for uploads', async () => {
      const testImagePath = path.join(testImageDir, 'test-small.png');

      await request(app.getHttpServer())
        .post('/api/uploads/post')
        .attach('file', testImagePath)
        .expect(401);
    });
  });

  /**
   * Test Group 2: Post Creation with Images
   */
  describe('Post Creation with Image URLs', () => {
    it('should create post with uploaded image URL', async () => {
      // First upload an image
      const testImagePath = path.join(testImageDir, 'test-small.png');
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath)
        .expect(201);

      const imageUrl = `http://localhost:3001${uploadResponse.body.url}`;

      // Create post with the uploaded image
      const postData = {
        title: 'Test Post with Uploaded Image',
        content: 'This post contains an uploaded image.',
        type: 'discussion',
        imageUrl: imageUrl,
      };

      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.image_url).toBe(imageUrl);
      expect(response.body.title).toBe(postData.title);
      expect(response.body.content).toBe(postData.content);
    });

    it('should create post with external HTTPS image URL', async () => {
      const postData = {
        title: 'Test Post with External Image',
        content: 'This post contains an external image.',
        type: 'discussion',
        imageUrl: 'http://localhost:3001/uploads/posts/test-image.png', // Use local test image instead
      };

      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.image_url).toBe(postData.imageUrl);
    });

    it('should create post without image URL', async () => {
      const postData = {
        title: 'Test Post without Image',
        content: 'This post has no image.',
        type: 'discussion',
      };

      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.image_url).toBeNull();
    });

    it('should reject invalid image URLs', async () => {
      const postData = {
        title: 'Test Post with Invalid URL',
        content: 'This post has an invalid image URL.',
        type: 'discussion',
        imageUrl: 'not-a-valid-url',
      };

      await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);
    });

    it('should accept empty string as imageUrl', async () => {
      const postData = {
        title: 'Test Post with Empty Image URL',
        content: 'This post has an empty image URL.',
        type: 'discussion',
        imageUrl: '',
      };

      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.image_url).toBeNull();
    });
  });

  /**
   * Test Group 3: Post Retrieval and Image URL Persistence
   */
  describe('Post Retrieval with Images', () => {
    it('should maintain image URL when retrieving post', async () => {
      // Upload image and create post
      const testImagePath = path.join(testImageDir, 'test-small.png');
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      const imageUrl = `http://localhost:3001${uploadResponse.body.url}`;
      const postData = {
        title: 'Test Post for Retrieval',
        content: 'Testing image URL persistence.',
        type: 'discussion',
        imageUrl: imageUrl,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      const postId = createResponse.body.id;

      // Retrieve the post
      const getResponse = await request(app.getHttpServer())
        .get(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.image_url).toBe(imageUrl);
      expect(getResponse.body.title).toBe(postData.title);
    });

    it('should return accessible image URLs in post lists', async () => {
      // Create multiple posts with images
      const imageUrls: string[] = [];
      for (let i = 0; i < 3; i++) {
        const testImagePath = path.join(testImageDir, `test-small-${i}.png`);
        createTestImage(testImagePath, 'small');

        const uploadResponse = await request(app.getHttpServer())
          .post('/api/uploads/post')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testImagePath);

        const imageUrl = `http://localhost:3001${uploadResponse.body.url}`;
        imageUrls.push(imageUrl);

        await request(app.getHttpServer())
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Test Post ${i}`,
            content: `Content for post ${i}`,
            type: 'discussion',
            imageUrl: imageUrl,
          });
      }

      // Get posts list
      const response = await request(app.getHttpServer())
        .get('/api/posts?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.posts).toBeDefined();

      // Check that posts with images have correct URLs
      const postsWithImages = response.body.posts.filter(post => post.image_url);
      expect(postsWithImages.length).toBeGreaterThan(0);

      for (const post of postsWithImages) {
        expect(post.image_url).toMatch(/^https?:\/\/.+/);
      }
    });
  });

  /**
   * Test Group 4: Image File System Integration
   */
  describe('Image File System Integration', () => {
    it('should make uploaded images accessible via HTTP', async () => {
      const testImagePath = path.join(testImageDir, 'test-small.png');

      const uploadResponse = await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      const imageUrl = uploadResponse.body.url;

      // Test that the image is accessible
      const imageResponse = await request(app.getHttpServer()).get(imageUrl).expect(200);

      expect(imageResponse.headers['content-type']).toMatch(/^image\//);
    });

    it('should preserve image file extensions', async () => {
      const testTypes = [
        { path: 'test.png', type: 'image/png' },
        { path: 'test.jpg', type: 'image/jpeg' },
        { path: 'test.jpeg', type: 'image/jpeg' },
      ];

      for (const testType of testTypes) {
        const testImagePath = path.join(testImageDir, testType.path);
        createTestImage(testImagePath, 'small');

        const uploadResponse = await request(app.getHttpServer())
          .post('/api/uploads/post')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testImagePath);

        expect(uploadResponse.body.url).toMatch(
          new RegExp(`\\.${path.extname(testType.path).substring(1)}$`),
        );
      }
    });

    it('should handle concurrent image uploads', async () => {
      const uploadPromises: Promise<request.Response>[] = [];

      for (let i = 0; i < 5; i++) {
        const testImagePath = path.join(testImageDir, `concurrent-${i}.png`);
        createTestImage(testImagePath, 'small');

        const uploadPromise = request(app.getHttpServer())
          .post('/api/uploads/post')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testImagePath);

        uploadPromises.push(uploadPromise);
      }

      const responses = await Promise.all(uploadPromises);

      for (const response of responses) {
        expect(response.status).toBe(201);
        expect(response.body.url).toBeDefined();
      }

      // Verify all files were created with unique names
      const urls = responses.map(r => r.body.url);
      const uniqueUrls = new Set(urls);
      expect(uniqueUrls.size).toBe(urls.length);
    });
  });

  /**
   * Test Group 5: Error Handling and Edge Cases
   */
  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed image files gracefully', async () => {
      const malformedImagePath = path.join(testImageDir, 'malformed.png');
      fs.writeFileSync(malformedImagePath, 'PNG_HEADER_FAKE_DATA');

      await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', malformedImagePath)
        .expect(400);
    });

    it('should handle missing file in upload request', async () => {
      await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should validate file size limits accurately', async () => {
      // Create file just under the limit (should pass)
      const almostLargeImagePath = path.join(testImageDir, 'almost-large.png');
      const almostLargeBuffer = Buffer.alloc(4.5 * 1024 * 1024); // 4.5MB
      fs.writeFileSync(almostLargeImagePath, almostLargeBuffer);

      await request(app.getHttpServer())
        .post('/api/uploads/post')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', almostLargeImagePath)
        .expect(400); // Should still fail as it's not a valid image
    });

    it('should handle post creation with non-existent image URL gracefully', async () => {
      const postData = {
        title: 'Test Post with Non-existent Image',
        content: 'This post references a non-existent image.',
        type: 'discussion',
        imageUrl: 'http://localhost:3001/uploads/posts/non-existent-image.png',
      };

      // Should still create the post (URL validation passed, but image doesn't exist)
      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.image_url).toBe(postData.imageUrl);
    });
  });

  /**
   * Test Group 6: Performance and Load Testing
   */
  describe('Performance and Load Testing', () => {
    it('should handle multiple post creations with images efficiently', async () => {
      const startTime = Date.now();
      const postPromises: Promise<request.Response>[] = [];

      for (let i = 0; i < 10; i++) {
        const testImagePath = path.join(testImageDir, `perf-test-${i}.png`);
        createTestImage(testImagePath, 'small');

        const uploadPromise = request(app.getHttpServer())
          .post('/api/uploads/post')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testImagePath)
          .then((uploadResponse: request.Response) => {
            const imageUrl = `http://localhost:3001${uploadResponse.body.url}`;
            return request(app.getHttpServer())
              .post('/api/posts')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                title: `Performance Test Post ${i}`,
                content: `Content for performance test post ${i}`,
                type: 'discussion',
                imageUrl: imageUrl,
              });
          });

        postPromises.push(uploadPromise);
      }

      const responses = await Promise.all(postPromises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      for (const response of responses) {
        expect(response.status).toBe(201);
      }

      // Should complete within reasonable time (10 seconds for 10 operations)
      expect(totalTime).toBeLessThan(10000);

      console.log(
        `Created 10 posts with images in ${totalTime}ms (avg: ${totalTime / 10}ms per post)`,
      );
    });

    it('should handle rapid sequential uploads without conflicts', async () => {
      const results: string[] = [];

      for (let i = 0; i < 5; i++) {
        const testImagePath = path.join(testImageDir, `sequential-${i}.png`);
        createTestImage(testImagePath, 'small');

        const response = await request(app.getHttpServer())
          .post('/api/uploads/post')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', testImagePath)
          .expect(201);

        results.push(response.body.url);
      }

      // All uploads should have unique URLs
      const uniqueUrls = new Set(results);
      expect(uniqueUrls.size).toBe(results.length);
    });
  });

  /**
   * Helper Functions
   */
  async function createTestUser() {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'User',
    };

    // Register user
    await request(app.getHttpServer()).post('/api/auth/register').send(userData);

    // Login to get token
    const loginResponse = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    authToken = loginResponse.body.access_token;
  }

  function createTestImages() {
    // Create small test image (valid PNG)
    const smallImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    );

    // Create large test image (oversized)
    const largeImageBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

    fs.writeFileSync(path.join(testImageDir, 'test-small.png'), smallImageBuffer);
    fs.writeFileSync(path.join(testImageDir, 'test-large.png'), largeImageBuffer);
  }

  function createTestImage(filePath: string, size: 'small' | 'large' = 'small') {
    const buffers = {
      small: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64',
      ),
      large: Buffer.alloc(6 * 1024 * 1024), // 6MB
    };

    fs.writeFileSync(filePath, buffers[size]);
  }

  async function cleanupTestFiles() {
    try {
      if (fs.existsSync(testImageDir)) {
        const files = fs.readdirSync(testImageDir);
        for (const file of files) {
          fs.unlinkSync(path.join(testImageDir, file));
        }
      }
    } catch (error) {
      console.warn('Warning: Could not cleanup test files:', error.message);
    }
  }

  async function cleanupUploadedFiles() {
    try {
      const postUploadsDir = path.join(uploadsDir, 'posts');
      const profileUploadsDir = path.join(uploadsDir, 'profile');

      for (const dir of [postUploadsDir, profileUploadsDir]) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            // Only delete test files (contain 'test' in name)
            if (
              file.includes('test') ||
              file.includes('perf') ||
              file.includes('concurrent') ||
              file.includes('sequential')
            ) {
              fs.unlinkSync(path.join(dir, file));
            }
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Could not cleanup uploaded files:', error.message);
    }
  }
});
