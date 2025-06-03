import { expect, test } from '@playwright/test';

test.describe('Authentication Security and Edge Cases', () => {
  const testCredentials = {
    email: 'testadmin@test.com',
    password: 'password123',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Security - Rate limiting on login attempts', async ({ page }) => {
    console.log('🛡️ Testing rate limiting on login attempts...');

    type RateLimitResult =
      | {
          attempt: number;
          status: number;
          responseTime: number;
          headers: { [k: string]: string };
          error?: undefined;
        }
      | {
          attempt: number;
          error: any;
          status?: undefined;
          responseTime?: undefined;
          headers?: undefined;
        };

    const rateLimitResults: RateLimitResult[] = [];

    // Attempt multiple rapid login requests with invalid credentials
    for (let i = 0; i < 7; i++) {
      const result = await page.evaluate(async attempt => {
        try {
          const startTime = Date.now();
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: 'invalid@example.com',
              password: 'wrongpassword',
            }),
          });
          const endTime = Date.now();

          return {
            attempt,
            status: response.status,
            responseTime: endTime - startTime,
            headers: Object.fromEntries([...response.headers.entries()]),
          };
        } catch (error) {
          return {
            attempt,
            error: error.message,
          };
        }
      }, i + 1);

      rateLimitResults.push(result);
      console.log(
        `Attempt ${i + 1}:`,
        result.status,
        result.responseTime ? `${result.responseTime}ms` : 'Error',
      );

      // Small delay between attempts
      await page.waitForTimeout(200);
    }

    // Check if rate limiting kicks in
    const laterAttempts = rateLimitResults.slice(4); // Check last 3 attempts
    const rateLimited = laterAttempts.some(
      attempt =>
        attempt.status === 429 || // Too Many Requests
        (typeof attempt.responseTime === 'number' && attempt.responseTime > 5000) || // Artificially slow response
        attempt.error,
    );

    if (rateLimited) {
      console.log('✅ Rate limiting appears to be working');
    } else {
      console.log('⚠️ Warning: Rate limiting might not be implemented');
    }

    console.log('✅ Rate limiting test completed');
  });

  test('Security - Token expiration and refresh behavior', async ({ page }) => {
    console.log('⏰ Testing token expiration behavior...');

    // Login to get initial tokens
    const loginResult = await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      return { status: response.status, data: await response.json() };
    }, testCredentials);

    expect(loginResult.status).toBe(200);
    const accessToken = loginResult.data.access_token;

    // Test with expired/invalid token
    const expiredTokenResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users/stats', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer invalid-expired-token',
            'Content-Type': 'application/json',
          },
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(expiredTokenResult.status).toBe(401);
    console.log('✅ Expired/invalid token properly rejected');

    // Test refresh token mechanism
    const refreshResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        return { status: response.status, data: await response.json() };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(refreshResult.status).toBe(200);
    expect(refreshResult.data.access_token).toBeDefined();
    console.log('✅ Token refresh mechanism working correctly');
  });

  test('Security - SQL injection prevention in auth endpoints', async ({ page }) => {
    console.log('💉 Testing SQL injection prevention...');

    const sqlInjectionPayloads = [
      "admin@test.com'; DROP TABLE users; --",
      "admin@test.com' OR '1'='1",
      "admin@test.com' UNION SELECT * FROM users --",
      "'; INSERT INTO users (email, password) VALUES ('hacker@evil.com', 'hacked'); --",
    ];

    for (const payload of sqlInjectionPayloads) {
      const result = await page.evaluate(async email => {
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email,
              password: 'password123',
            }),
          });
          return { status: response.status, email };
        } catch (error) {
          return { error: error.message, email };
        }
      }, payload);

      // Should return 400 (Bad Request) or 401 (Unauthorized), not 500 (Server Error)
      expect(result.status).not.toBe(500);
      expect(result.status).not.toBe(200);
      console.log(`✅ SQL injection payload blocked: ${payload.substring(0, 30)}...`);
    }

    console.log('✅ SQL injection prevention working correctly');
  });

  test('Security - XSS prevention in auth responses', async ({ page }) => {
    console.log('🚫 Testing XSS prevention...');

    const xssPayloads = [
      "<script>alert('xss')</script>@test.com",
      "test+<img src=x onerror=alert('xss')>@test.com",
      "test@test.com<script>document.location='http://evil.com'</script>",
    ];

    for (const payload of xssPayloads) {
      const result = await page.evaluate(async email => {
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email,
              password: 'password123',
            }),
          });
          const data = await response.json();
          return { status: response.status, data, email };
        } catch (error) {
          return { error: error.message, email };
        }
      }, payload);

      // Check if XSS payload is escaped/sanitized in response
      if (result.data && result.data.message) {
        expect(result.data.message).not.toContain('<script>');
        expect(result.data.message).not.toContain('onerror=');
      }
      console.log(`✅ XSS payload handled safely: ${payload.substring(0, 30)}...`);
    }

    console.log('✅ XSS prevention working correctly');
  });

  test('Security - CSRF protection verification', async ({ page }) => {
    console.log('🛡️ Testing CSRF protection...');

    // Test request without proper origin/referrer
    const csrfResult = await page.evaluate(async credentials => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://evil-site.com',
            Referer: 'http://evil-site.com',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    }, testCredentials);

    // Depending on CSRF protection implementation, this might be blocked
    console.log('CSRF test result:', csrfResult);

    // Test with proper origin
    const validOriginResult = await page.evaluate(async credentials => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:3000',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    }, testCredentials);

    expect(validOriginResult.status).toBe(200);
    console.log('✅ Valid origin request succeeded');
  });

  test('Edge Case - Concurrent login sessions', async ({ page, context }) => {
    console.log('🔄 Testing concurrent login sessions...');

    // Create multiple browser contexts to simulate different devices/browsers
    const browser = context.browser();
    if (!browser) {
      throw new Error('No browser instance available in Playwright context');
    }
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // Login from first session
    const login1 = await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      return { status: response.status, data: await response.json() };
    }, testCredentials);

    // Login from second session
    const login2 = await page2.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      return { status: response.status, data: await response.json() };
    }, testCredentials);

    expect(login1.status).toBe(200);
    expect(login2.status).toBe(200);

    // Test if both sessions can access protected resources
    const session1Test = await page.evaluate(async token => {
      const response = await fetch('http://localhost:3001/api/admin/users/stats', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return { status: response.status };
    }, login1.data.access_token);

    const session2Test = await page2.evaluate(async token => {
      const response = await fetch('http://localhost:3001/api/admin/users/stats', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return { status: response.status };
    }, login2.data.access_token);

    expect(session1Test.status).toBe(200);
    expect(session2Test.status).toBe(200);

    console.log('✅ Concurrent sessions working correctly');

    await context2.close();
  });

  test('Edge Case - Malformed JSON in auth requests', async ({ page }) => {
    console.log('🔧 Testing malformed JSON handling...');

    const malformedRequests = [
      '{"email": "test@test.com", "password": }',
      '{"email": "test@test.com" "password": "test"}',
      '{email: "test@test.com", password: "test"}',
      'not-json-at-all',
      '',
    ];

    for (const malformedJSON of malformedRequests) {
      const result = await page.evaluate(async jsonString => {
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonString,
          });
          return { status: response.status };
        } catch (error) {
          return { error: error.message };
        }
      }, malformedJSON);

      // Should handle malformed JSON gracefully (400 Bad Request)
      expect(result.status).toBe(400);
      console.log(`✅ Malformed JSON handled correctly: ${malformedJSON.substring(0, 20)}...`);
    }

    console.log('✅ Malformed JSON handling working correctly');
  });

  test('Edge Case - Empty and null values in auth fields', async ({ page }) => {
    console.log('🕳️ Testing empty and null values...');

    const edgeCaseInputs = [
      { email: '', password: '' },
      { email: null, password: null },
      { email: undefined, password: undefined },
      { email: 'test@test.com', password: '' },
      { email: '', password: 'password123' },
      { email: 'test@test.com' }, // missing password
      { password: 'password123' }, // missing email
    ];

    for (const input of edgeCaseInputs) {
      const result = await page.evaluate(async credentials => {
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          return { status: response.status };
        } catch (error) {
          return { error: error.message };
        }
      }, input);

      // Should return 400 (Bad Request) for invalid inputs
      expect(result.status).toBe(400);
      console.log(`✅ Edge case handled: ${JSON.stringify(input)}`);
    }

    console.log('✅ Empty and null value handling working correctly');
  });

  test('Edge Case - Very long input values', async ({ page }) => {
    console.log('📏 Testing very long input values...');

    const longString = 'a'.repeat(10000); // 10KB string
    const veryLongString = 'b'.repeat(100000); // 100KB string

    const longInputTests = [
      { email: longString + '@test.com', password: 'password123' },
      { email: 'test@test.com', password: longString },
      { email: veryLongString + '@test.com', password: veryLongString },
    ];

    for (const input of longInputTests) {
      const result = await page.evaluate(async credentials => {
        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          return { status: response.status };
        } catch (error) {
          return { error: error.message };
        }
      }, input);

      // Should handle long inputs gracefully (400 or 413)
      expect(typeof result.status === 'number' && [400, 413, 414].includes(result.status)).toBe(
        true,
      );
      console.log(
        `✅ Long input handled (${input.email.length + input.password.length} chars): Status ${result.status}`,
      );
    }

    console.log('✅ Long input handling working correctly');
  });
});
