#!/usr/bin/env node

/**
 * Test script for refresh token functionality
 * Tests refresh token cookie name consistency and token refresh flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRefreshTokenFlow() {
  console.log('🔄 Testing Refresh Token Flow...\n');

  try {
    // Step 1: Login to get initial tokens
    console.log('1. 🔐 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'alice@example.com',
      password: 'password123',
    });

    console.log('✅ Login successful');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Access Token: ${loginResponse.data.access_token ? 'Present' : 'Missing'}`);

    // Extract cookies from Set-Cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    let refreshTokenCookie = null;

    if (setCookieHeader) {
      const refreshCookie = setCookieHeader.find(cookie => cookie.startsWith('refresh_token='));
      if (refreshCookie) {
        refreshTokenCookie = refreshCookie.split(';')[0]; // Get just the cookie value part
        console.log(`   Refresh Token Cookie: ${refreshTokenCookie ? 'Present' : 'Missing'}`);
      }
    }

    if (!refreshTokenCookie) {
      throw new Error('No refresh_token cookie found in login response');
    }

    // Step 2: Wait a moment to ensure different timestamps
    console.log('\n2. ⏱️  Waiting 2 seconds before refresh...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test refresh token endpoint
    console.log('\n3. 🔄 Testing refresh token...');
    const refreshResponse = await axios.post(
      `${BASE_URL}/api/auth/refresh`,
      {},
      {
        headers: {
          Cookie: refreshTokenCookie,
        },
      },
    );

    console.log('✅ Refresh token successful');
    console.log(`   Status: ${refreshResponse.status}`);
    console.log(
      `   New Access Token: ${refreshResponse.data.access_token ? 'Present' : 'Missing'}`,
    );

    // Check for new refresh token cookie
    const newSetCookieHeader = refreshResponse.headers['set-cookie'];
    let newRefreshTokenCookie = null;

    if (newSetCookieHeader) {
      const newRefreshCookie = newSetCookieHeader.find(cookie =>
        cookie.startsWith('refresh_token='),
      );
      if (newRefreshCookie) {
        newRefreshTokenCookie = newRefreshCookie.split(';')[0];
        console.log(
          `   New Refresh Token Cookie: ${newRefreshTokenCookie ? 'Present' : 'Missing'}`,
        );
      }
    }

    // Step 4: Test accessing protected endpoint with new access token
    console.log('\n4. 🔒 Testing protected endpoint with new access token...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${refreshResponse.data.access_token}`,
      },
    });

    console.log('✅ Protected endpoint access successful');
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   User Email: ${profileResponse.data.email}`);
    console.log(`   User ID: ${profileResponse.data.user_id}`);

    // Step 5: Test using old refresh token (should fail if rotation is implemented)
    console.log('\n5. 🚫 Testing old refresh token (should fail with rotation)...');
    try {
      await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        {
          headers: {
            Cookie: refreshTokenCookie, // Using old refresh token
          },
        },
      );
      console.log('⚠️  Old refresh token still works (rotation not implemented)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Old refresh token correctly rejected (rotation working)');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }

    console.log('\n🎉 Refresh Token Flow Test Completed Successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log(`✅ Backend server is running (${response.status})\n`);
  } catch (error) {
    console.error('❌ Backend server is not running on localhost:3001');
    console.error('   Please run: npm run dev');
    process.exit(1);
  }
}

async function main() {
  console.log('🧪 Refresh Token Flow Test');
  console.log('==========================\n');

  await checkServer();
  await testRefreshTokenFlow();
}

main().catch(console.error);
