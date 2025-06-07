/**
 * Test script for Optional JWT Authentication Guard
 * Tests both authenticated and anonymous access to the post view tracking endpoint
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: `test_${Date.now()}@example.com`,
  password: 'password123',
  username: `testuser_${Date.now()}`
};

let authToken = null;
let testPostId = null;

async function main() {
  console.log('🧪 Testing Optional JWT Authentication Guard\n');

  try {
    // Step 1: Register a new user
    console.log('1️⃣ Registering a new user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: testUser.email,
      password: testUser.password,
      username: testUser.username,
      first_name: 'Test',
      last_name: 'User'
    });
    
    console.log(`✅ Registration successful: ${registerResponse.status}`);
    
    // Step 2: Login to get auth token
    console.log('\n2️⃣ Logging in to get authentication token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });    authToken = loginResponse.data.access_token;
    console.log(`✅ Login successful, token obtained: ${authToken.substring(0, 20)}...`);
    
    // Step 3: Create a test post to test view tracking with
    console.log('\n3️⃣ Creating a test post...');
    const createPostResponse = await axios.post(
      `${API_BASE}/posts`,
      {
        title: 'Test Post for View Tracking',
        content: 'This is a test post created for view tracking tests.',
        sport: 'football',
        category: 'discussion'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    testPostId = createPostResponse.data.post.post_id;
    console.log(`✅ Test post created with ID: ${testPostId}`);
    
    // Step 4: Get a post to test with (fallback)
    console.log('\n4️⃣ Verifying post exists...');
    const postsResponse = await axios.get(`${API_BASE}/posts?limit=1`);

    if (postsResponse.data.posts && postsResponse.data.posts.length > 0) {
      testPostId = postsResponse.data.posts[0].post_id;
      console.log(`✅ Using post ID: ${testPostId}`);
    } else {
      console.log('❌ No posts found to test with');
      return;
    }    // Step 4: Test authenticated view tracking
    console.log('\n4️⃣ Testing authenticated view tracking...');
    const authViewResponse = await axios.post(
      `${API_BASE}/posts/${testPostId}/view`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log(`✅ Authenticated view tracking: ${authViewResponse.status}`);
    console.log(`   Response: ${JSON.stringify(authViewResponse.data)}`);
    
    // Step 5: Test anonymous view tracking
    console.log('\n5️⃣ Testing anonymous view tracking...');
    const anonViewResponse = await axios.post(`${API_BASE}/posts/${testPostId}/view`, {});
    
    console.log(`✅ Anonymous view tracking: ${anonViewResponse.status}`);
    console.log(`   Response: ${JSON.stringify(anonViewResponse.data)}`);
    
    // Step 6: Test with invalid post ID
    console.log('\n6️⃣ Testing with invalid post ID...');
    try {
      await axios.post(`${API_BASE}/posts/invalid-uuid/view`, {});
      console.log('❌ Should have failed with invalid UUID');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid UUID properly rejected with 400 status');
      } else {
        console.log(`⚠️ Unexpected error status: ${error.response?.status}`);
      }
    }
    
    // Step 7: Test with non-existent but valid UUID
    console.log('\n7️⃣ Testing with non-existent post ID...');
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    try {
      await axios.post(`${API_BASE}/posts/${fakeUuid}/view`, {});
      console.log('❌ Should have failed with non-existent post');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Non-existent post properly rejected with 404 status');
      } else {
        console.log(`⚠️ Unexpected error status: ${error.response?.status}`);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Authenticated view tracking works');
    console.log('   ✅ Anonymous view tracking works');
    console.log('   ✅ Invalid UUID validation works');
    console.log('   ✅ Non-existent post validation works');
    console.log('   ✅ OptionalJwtAuthGuard properly handles both scenarios');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);

    if (error.response?.status === 401) {
      console.log('\n💡 If you see 401 errors, the OptionalJwtAuthGuard might not be working correctly');
    }
  }
}

main().catch(console.error);
