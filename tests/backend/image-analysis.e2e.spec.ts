import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as path from 'path';
import * as request from 'supertest';
import { AppModule } from '../../backend/src/app.module';

describe('ImageAnalysisController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // TODO: Replace with real login or test user JWT
    jwtToken = process.env.TEST_JWT_TOKEN || 'test-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    await request(app.getHttpServer()).post('/image-analysis/analyze-tip-image').expect(401);
  });

  it('should analyze a valid tip image (happy path)', async () => {
    const testImagePath = path.join(__dirname, '../images/test-tip-slip.png');
    // You must provide a valid JWT and a test image in tests/images/
    if (!jwtToken || jwtToken === 'test-jwt-token') {
      return;
    }
    const res = await request(app.getHttpServer())
      .post('/image-analysis/analyze-tip-image')
      .set('Authorization', `Bearer ${jwtToken}`)
      .attach('image', testImagePath)
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('extractedText');
    expect(res.body.data).toHaveProperty('parsedData');
    expect(res.body.data).toHaveProperty('validation');
    expect(res.body.data).toHaveProperty('confidence');
    expect(res.body.data).toHaveProperty('suggestedPostData');
  });

  it('should return 400 for missing image', async () => {
    if (!jwtToken || jwtToken === 'test-jwt-token') {
      return;
    }
    await request(app.getHttpServer())
      .post('/image-analysis/analyze-tip-image')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(400);
  });
});
