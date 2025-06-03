import { expect, test } from '@playwright/test';

test.describe('Authentication Performance Tests', () => {
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

  test('Performance - Login response time benchmark', async ({ page }) => {
    console.log('⏱️ Testing login response time...');

    type LoginResult =
      | { success: true; responseTime: number; status: number; hasToken: boolean }
      | { success: false; responseTime: number; error: any };

    const loginTimes: LoginResult[] = [];

    // Perform multiple login attempts to get average response time
    for (let i = 0; i < 5; i++) {
      const result = await page.evaluate(async credentials => {
        const startTime = performance.now();

        try {
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials),
          });

          const endTime = performance.now();
          const responseTime = endTime - startTime;

          const data = await response.json();

          if (response.ok) {
            return {
              success: true as const,
              responseTime,
              status: response.status,
              hasToken: !!data.access_token,
            };
          } else {
            return {
              success: false as const,
              responseTime,
              error: data?.message || `HTTP ${response.status}`,
            };
          }
        } catch (error) {
          const endTime = performance.now();
          return {
            success: false as const,
            responseTime: endTime - startTime,
            error: error.message,
          };
        }
      }, testCredentials);

      loginTimes.push(result);
      console.log(`Login attempt ${i + 1}: ${result.responseTime.toFixed(2)}ms`);

      // Small delay between attempts
      await page.waitForTimeout(500);

      // Logout for next iteration
      if (result.success) {
        await page.evaluate(async () => {
          const token = localStorage.getItem('accessToken');
          if (token) {
            await fetch('http://localhost:3001/api/auth/logout', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
          }
          localStorage.clear();
        });
      }
    }

    // Calculate statistics
    const successfulLogins = loginTimes.filter(t => t.success);
    const responseTimes = successfulLogins.map(t => t.responseTime);
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);

    console.log(`📊 Login Performance Statistics:`);
    console.log(`  Average: ${averageTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${successfulLogins.length}/${loginTimes.length}`);

    // Performance assertions
    expect(successfulLogins.length).toBeGreaterThan(0);
    expect(averageTime).toBeLessThan(2000); // Should be under 2 seconds
    expect(maxTime).toBeLessThan(5000); // No single request should take more than 5 seconds

    console.log('✅ Login performance test completed');
  });

  test('Performance - Token refresh response time', async ({ page }) => {
    console.log('🔄 Testing token refresh performance...');

    // Login first
    await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
    }, testCredentials);

    type RefreshResult =
      | { success: true; responseTime: number; status: number; hasNewToken: boolean }
      | { success: false; responseTime: number; error: any };

    const refreshTimes: RefreshResult[] = [];

    // Perform multiple refresh attempts
    for (let i = 0; i < 5; i++) {
      const result = await page.evaluate(async () => {
        const startTime = performance.now();

        try {
          const response = await fetch('http://localhost:3001/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          const endTime = performance.now();
          const responseTime = endTime - startTime;

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('accessToken', data.access_token);
            return {
              success: true as const,
              responseTime,
              status: response.status,
              hasNewToken: !!data.access_token,
            };
          } else {
            return {
              success: false as const,
              responseTime,
              error: data?.message || `HTTP ${response.status}`,
            };
          }
        } catch (error) {
          const endTime = performance.now();
          return {
            success: false as const,
            responseTime: endTime - startTime,
            error: error.message,
          };
        }
      });

      refreshTimes.push(result);
      console.log(`Refresh attempt ${i + 1}: ${result.responseTime.toFixed(2)}ms`);

      await page.waitForTimeout(200);
    }

    // Calculate refresh statistics
    const successfulRefreshes = refreshTimes.filter(t => t.success);
    const refreshResponseTimes = successfulRefreshes.map(t => t.responseTime);
    const avgRefreshTime =
      refreshResponseTimes.reduce((a, b) => a + b, 0) / refreshResponseTimes.length;

    console.log(`📊 Token Refresh Performance:`);
    console.log(`  Average: ${avgRefreshTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${successfulRefreshes.length}/${refreshTimes.length}`);

    expect(successfulRefreshes.length).toBeGreaterThan(0);
    expect(avgRefreshTime).toBeLessThan(1000); // Refresh should be faster than login

    console.log('✅ Token refresh performance test completed');
  });

  test('Performance - Concurrent authentication requests', async ({ page }) => {
    console.log('🔀 Testing concurrent authentication performance...');

    const concurrentLogin = async (credentials, requestId) => {
      return await page.evaluate(
        async ({ creds, id }) => {
          const startTime = performance.now();

          try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(creds),
            });

            const endTime = performance.now();
            const data = await response.json();

            return {
              requestId: id,
              success: response.ok,
              responseTime: endTime - startTime,
              status: response.status,
            };
          } catch (error) {
            const endTime = performance.now();
            return {
              requestId: id,
              success: false,
              responseTime: endTime - startTime,
              error: error.message,
            };
          }
        },
        { creds: credentials, id: requestId },
      );
    };

    // Launch 5 concurrent login requests
    const concurrentPromises: Promise<{
      requestId: any;
      success: boolean;
      responseTime: number;
      status?: number;
      error?: any;
    }>[] = [];
    for (let i = 0; i < 5; i++) {
      concurrentPromises.push(concurrentLogin(testCredentials, i + 1));
    }

    const concurrentResults = await Promise.all(concurrentPromises);

    console.log('📊 Concurrent Login Results:');
    concurrentResults.forEach(result => {
      console.log(
        `  Request ${result.requestId}: ${result.responseTime.toFixed(2)}ms - ${result.success ? 'Success' : 'Failed'}`,
      );
    });

    const successfulConcurrent = concurrentResults.filter(r => r.success);
    const concurrentTimes = successfulConcurrent.map(r => r.responseTime);
    const avgConcurrentTime = concurrentTimes.reduce((a, b) => a + b, 0) / concurrentTimes.length;

    console.log(`  Average Response Time: ${avgConcurrentTime.toFixed(2)}ms`);
    console.log(`  Success Rate: ${successfulConcurrent.length}/${concurrentResults.length}`);

    // At least some concurrent requests should succeed
    expect(successfulConcurrent.length).toBeGreaterThan(0);
    // Concurrent requests shouldn't take significantly longer
    expect(avgConcurrentTime).toBeLessThan(3000);

    console.log('✅ Concurrent authentication test completed');
  });

  test('Performance - API endpoint response time with authentication', async ({ page }) => {
    console.log('🚀 Testing API endpoint performance with authentication...');

    // Login first
    const loginResult = await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      return { token: data.access_token, success: response.ok };
    }, testCredentials);

    expect(loginResult.success).toBe(true);

    // Test multiple API endpoints with authentication
    const apiEndpoints = [
      { name: 'User Stats', endpoint: '/api/admin/users/stats' },
      { name: 'User List', endpoint: '/api/admin/users' },
      // Add more endpoints as needed
    ];

    // Define the result type for API calls
    type ApiResult =
      | { success: true; responseTime: number; status: number }
      | { success: false; responseTime: number; error: any };

    for (const endpoint of apiEndpoints) {
      const apiTimes: ApiResult[] = [];

      for (let i = 0; i < 3; i++) {
        const result = await page.evaluate(
          async ({ token, url }) => {
            const startTime = performance.now();

            try {
              const response = await fetch(`http://localhost:3001${url}`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const endTime = performance.now();
              const responseTime = endTime - startTime;

              if (response.ok) {
                return {
                  success: true as const,
                  responseTime,
                  status: response.status,
                };
              } else {
                return {
                  success: false as const,
                  responseTime,
                  error: `HTTP ${response.status}`,
                };
              }
            } catch (error) {
              const endTime = performance.now();
              return {
                success: false as const,
                responseTime: endTime - startTime,
                error: error.message,
              };
            }
          },
          { token: loginResult.token, url: endpoint.endpoint },
        );

        apiTimes.push(result);
        await page.waitForTimeout(100);
      }

      const successfulRequests = apiTimes.filter(t => t.success);
      if (successfulRequests.length > 0) {
        const avgTime =
          successfulRequests.reduce((sum, t) => sum + t.responseTime, 0) /
          successfulRequests.length;
        console.log(
          `📊 ${endpoint.name}: ${avgTime.toFixed(2)}ms avg (${successfulRequests.length}/${apiTimes.length} successful)`,
        );

        // API calls should be reasonably fast
        expect(avgTime).toBeLessThan(3000);
      } else {
        console.log(
          `⚠️ ${endpoint.name}: No successful requests (might require different permissions)`,
        );
      }
    }

    console.log('✅ API endpoint performance test completed');
  });

  test('Performance - Memory usage during authentication flow', async ({ page }) => {
    console.log('💾 Testing memory usage during authentication...');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      const perf = performance as Performance & { memory?: any };
      if (perf.memory) {
        return {
          usedJSHeapSize: perf.memory.usedJSHeapSize,
          totalJSHeapSize: perf.memory.totalJSHeapSize,
          jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (initialMemory) {
      console.log(
        `Initial memory usage: ${(initialMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      );
    }

    // Perform authentication flow multiple times
    for (let i = 0; i < 10; i++) {
      await page.evaluate(async credentials => {
        // Login
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });
        const loginData = await loginResponse.json();
        localStorage.setItem('accessToken', loginData.access_token);

        // Make some API calls
        for (let j = 0; j < 3; j++) {
          await fetch('http://localhost:3001/api/admin/users/stats', {
            headers: {
              Authorization: `Bearer ${loginData.access_token}`,
              'Content-Type': 'application/json',
            },
          }).catch(() => {}); // Ignore errors for memory test
        }

        // Refresh token
        const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('accessToken', refreshData.access_token);
        }

        // Logout
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        localStorage.clear();
      }, testCredentials);

      // Check memory periodically
      if (i % 3 === 0) {
        const currentMemory = await page.evaluate(() => {
          const perf = performance as Performance & { memory?: any };
          if (perf.memory) {
            return perf.memory.usedJSHeapSize;
          }
          return 0;
        });

        if (currentMemory && initialMemory) {
          const memoryIncrease = (currentMemory - initialMemory.usedJSHeapSize) / 1024 / 1024;
          console.log(`Memory after ${i + 1} cycles: +${memoryIncrease.toFixed(2)} MB`);
        }
      }
    }

    // Final memory check
    const finalMemory = await page.evaluate(() => {
      const perf = performance as Performance & { memory?: any };
      if (perf.memory) {
        return perf.memory.usedJSHeapSize;
      }
      return 0;
    });

    if (finalMemory && initialMemory) {
      const totalIncrease = (finalMemory - initialMemory.usedJSHeapSize) / 1024 / 1024;
      console.log(`Total memory increase: ${totalIncrease.toFixed(2)} MB`);

      // Memory increase should be reasonable (less than 50MB for this test)
      expect(totalIncrease).toBeLessThan(50);
    }

    console.log('✅ Memory usage test completed');
  });

  test('Performance - Database connection impact during auth', async ({ page }) => {
    console.log('🗄️ Testing database performance during authentication...');

    const batchSize = 5;
    const batches = 3;

    for (let batch = 0; batch < batches; batch++) {
      console.log(`Running batch ${batch + 1}/${batches}...`);

      const batchPromises: Promise<{
        success: boolean;
        times?: { login: number; refresh: number; logout: number; total: number };
        error?: any;
      }>[] = [];

      for (let i = 0; i < batchSize; i++) {
        const promise = page.evaluate(async credentials => {
          const startTime = performance.now();

          try {
            // Login
            const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(credentials),
            });

            const loginEnd = performance.now();
            const loginData = await loginResponse.json();

            // Token refresh (tests DB lookup for refresh token)
            const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });

            const refreshEnd = performance.now();

            // Logout (cleans up DB)
            const logoutResponse = await fetch('http://localhost:3001/api/auth/logout', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${loginData.access_token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            const logoutEnd = performance.now();

            return {
              success: true,
              times: {
                login: loginEnd - startTime,
                refresh: refreshEnd - loginEnd,
                logout: logoutEnd - refreshEnd,
                total: logoutEnd - startTime,
              },
            };
          } catch (error) {
            return {
              success: false,
              error: error.message,
            };
          }
        }, testCredentials);

        batchPromises.push(promise);
      }

      const batchResults = await Promise.all(batchPromises);
      const successfulResults = batchResults.filter(r => r.success);

      if (successfulResults.length > 0) {
        // Filter out any results where r.times is undefined
        const validResults = successfulResults.filter(r => r.times !== undefined);

        const avgTimes = {
          login:
            validResults.reduce((sum, r) => (r.times ? sum + r.times.login : sum), 0) /
            validResults.length,
          refresh:
            validResults.reduce((sum, r) => (r.times ? sum + r.times.refresh : sum), 0) /
            validResults.length,
          logout:
            validResults.reduce((sum, r) => (r.times ? sum + r.times.logout : sum), 0) /
            validResults.length,
          total:
            validResults.reduce((sum, r) => (r.times ? sum + r.times.total : sum), 0) /
            validResults.length,
        };

        console.log(
          `Batch ${batch + 1} averages: Login(${avgTimes.login.toFixed(0)}ms) Refresh(${avgTimes.refresh.toFixed(0)}ms) Logout(${avgTimes.logout.toFixed(0)}ms)`,
        );

        // Database operations should remain performant under load
        expect(avgTimes.total).toBeLessThan(5000);
      }

      // Wait between batches to prevent overwhelming the system
      await page.waitForTimeout(1000);
    }

    console.log('✅ Database performance test completed');
  });
});
