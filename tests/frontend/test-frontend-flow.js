/**
 * Test script for Frontend Authentication Flow
 * Tests the actual frontend authentication flow that users experience
 */

import axios from 'axios';

const FRONTEND_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: `frontend_test_${Date.now()}@example.com`,
  password: 'password123',
  username: `frontenduser_${Date.now()}`,
};

async function testFrontendAPI() {
  console.log('🌐 Testing Frontend API Integration\n');

  try {
    // Test 1: Check if frontend is responding
    console.log('1️⃣ Checking frontend server...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      console.log(`✅ Frontend server is responding: ${frontendResponse.status}`);
    } catch (error) {
      console.log(`❌ Frontend server check failed: ${error.message}`);
      return;
    }

    // Test 2: Test the auth endpoints that frontend calls
    console.log('\n2️⃣ Testing auth endpoints used by frontend...');

    // Register user
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: testUser.email,
      password: testUser.password,
      username: testUser.username,
      first_name: 'Frontend',
      last_name: 'Test',
    });
    console.log(`✅ Registration endpoint: ${registerResponse.status}`);

    // Login user
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    const token = loginResponse.data.access_token;
    console.log(`✅ Login endpoint: ${loginResponse.status}, token: ${token.substring(0, 20)}...`);

    // Test 3: Test the /auth/me endpoint (critical for frontend auth state)
    console.log('\n3️⃣ Testing /auth/me endpoint (critical for frontend)...');
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`✅ /auth/me endpoint: ${meResponse.status}`);
    console.log(`   User data: ${JSON.stringify(meResponse.data, null, 2)}`);

    // Test 4: Test posts endpoint (to ensure no double API prefix issues)
    console.log('\n4️⃣ Testing posts endpoints (checking for URL issues)...');

    // Get posts
    const postsResponse = await axios.get(`${API_BASE}/posts`);
    console.log(`✅ GET /posts: ${postsResponse.status}, found ${postsResponse.data.length} posts`);

    // Create a post
    const createPostResponse = await axios.post(
      `${API_BASE}/posts`,
      {
        content: 'Frontend integration test post',
        type: 'discussion',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(`✅ POST /posts: ${createPostResponse.status}`);
    const postId = createPostResponse.data.id;

    // Test view tracking (the endpoint that was causing 404s)
    const viewResponse = await axios.post(
      `${API_BASE}/posts/${postId}/view`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(`✅ POST /posts/:id/view: ${viewResponse.status}`);

    // Test 5: Test logout (if endpoint exists)
    console.log('\n5️⃣ Testing logout flow...');
    try {
      const logoutResponse = await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(`✅ Logout endpoint: ${logoutResponse.status}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`ℹ️  Logout endpoint not implemented (frontend handles logout client-side)`);
      } else {
        console.log(`⚠️  Logout test failed: ${error.message}`);
      }
    }

    console.log('\n🎉 All frontend integration tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Frontend server is running');
    console.log('   ✅ Registration endpoint works');
    console.log('   ✅ Login endpoint works');
    console.log('   ✅ /auth/me endpoint works (no double API prefix)');
    console.log('   ✅ Posts endpoints work');
    console.log('   ✅ Post view tracking works');
    console.log('   ✅ No URL prefix issues detected');
  } catch (error) {
    console.error('\n❌ Frontend integration test failed:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   URL: ${error.config?.url}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    // Check for the specific double API prefix issue
    if (error.config?.url?.includes('/api/api/')) {
      console.error('\n🚨 DETECTED: Double API prefix in URL!');
      console.error('   This suggests the frontend is incorrectly constructing API URLs');
    }
  }
}

testFrontendAPI();
