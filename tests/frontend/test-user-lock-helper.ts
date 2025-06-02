// Helper to unlock and relock test user for E2E tests
// Usage: await unlockTestUser('testadmin@test.com');
//        ...run test...
//        await relockTestUser('testadmin@test.com');

import { request } from '@playwright/test';

export async function unlockTestUser(email: string) {
  // This endpoint should be implemented in backend for test/dev only!
  // Example: PATCH /api/test/unlock-user { email }
  const api = await request.newContext();
  await api.patch('http://localhost:3001/api/test/unlock-user', {
    data: { email },
  });
  await api.dispose();
}

export async function relockTestUser(email: string) {
  // Optionally re-lock or reset failed attempts
  const api = await request.newContext();
  await api.patch('http://localhost:3001/api/test/relock-user', {
    data: { email },
  });
  await api.dispose();
}
