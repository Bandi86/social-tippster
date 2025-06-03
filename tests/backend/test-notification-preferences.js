#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test configuration
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'password123',
  first_name: 'Test',
  last_name: 'User',
  username: `testuser_${Date.now()}`,
};

let userToken = null;

async function registerUser() {
  try {
    console.log('🔄 Registering test user...');
    const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    console.log('✅ User registered successfully');
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  User already exists');
      return true;
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function loginUser() {
  try {
    console.log('🔄 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    userToken = response.data.access_token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetNotificationPreferences() {
  try {
    console.log('\n🔄 Testing GET /api/users/me/notification-preferences...');
    const response = await axios.get(`${BASE_URL}/api/users/me/notification-preferences`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    console.log('✅ GET notification preferences successful');
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ GET notification preferences failed:', error.response?.data || error.message);
    return null;
  }
}

async function testUpdateNotificationPreferences() {
  try {
    console.log('\n🔄 Testing PUT /api/users/me/notification-preferences...');

    const updateData = {
      notification_preferences: {
        comment: { email: true },
        mention: { push: true },
      },
    };

    const response = await axios.put(
      `${BASE_URL}/api/users/me/notification-preferences`,
      updateData,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    console.log('✅ PUT notification preferences successful');
    console.log('📋 Updated preferences:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ PUT notification preferences failed:', error.response?.data || error.message);
    return null;
  }
}

async function testResetNotificationPreferences() {
  try {
    console.log('\n🔄 Testing POST /users/me/notification-preferences/reset...');

    const response = await axios.post(
      `${BASE_URL}/api/users/me/notification-preferences/reset`,
      {},
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    console.log('✅ POST reset notification preferences successful');
    console.log('📋 Reset preferences:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(
      '❌ POST reset notification preferences failed:',
      error.response?.data || error.message,
    );
    return null;
  }
}

async function testFullUpdate() {
  try {
    console.log('\n🔄 Testing full notification preferences update...');

    const fullUpdateData = {
      notification_preferences: {
        comment: { in_app: false, email: true, push: true },
        mention: { in_app: true, email: false, push: true },
        follow: { in_app: false, email: true, push: false },
      },
    };

    const response = await axios.put(
      `${BASE_URL}/api/users/me/notification-preferences`,
      fullUpdateData,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );

    console.log('✅ Full update successful');
    console.log('📋 Full update result:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Full update failed:', error.response?.data || error.message);
    return null;
  }
}

async function testInvalidRequests() {
  console.log('\n🔄 Testing invalid requests...');

  // Test without authentication
  try {
    await axios.get(`${BASE_URL}/api/users/me/notification-preferences`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request without authentication');
    } else {
      console.log('⚠️  Unexpected error:', error.response?.status);
    }
  }

  // Test with invalid token
  try {
    await axios.get(`${BASE_URL}/api/users/me/notification-preferences`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    console.log('❌ Should have failed with invalid token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request with invalid token');
    } else {
      console.log('⚠️  Unexpected error:', error.response?.status);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Notification Preferences API Tests');
  console.log('='.repeat(50));

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server is not running. Please start the backend server first.');
    console.error('   Run: npm run dev');
    process.exit(1);
  }

  // Setup user
  const registered = await registerUser();
  if (!registered) {
    console.error('❌ Failed to register user. Exiting.');
    process.exit(1);
  }

  const loggedIn = await loginUser();
  if (!loggedIn) {
    console.error('❌ Failed to login user. Exiting.');
    process.exit(1);
  }

  // Run notification preferences tests
  const initialPrefs = await testGetNotificationPreferences();
  if (!initialPrefs) {
    console.error('❌ Failed to get initial preferences. Exiting.');
    process.exit(1);
  }

  await testUpdateNotificationPreferences();
  await testFullUpdate();
  await testResetNotificationPreferences();
  await testInvalidRequests();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All notification preferences tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
});
