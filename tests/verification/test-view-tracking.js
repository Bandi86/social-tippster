/**
 * Test script to verify post view tracking endpoint is working
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testViewTracking() {
  console.log('🔍 Testing post view tracking endpoint...\n');

  try {
    // Step 1: Login to get access token
    console.log('1️⃣ Logging in to get access token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testadmin@test.com',
      password: 'password123'
    });

    const accessToken = loginResponse.data.access_token;
    console.log('✅ Login successful!');

    // Step 2: Get a list of posts to find a valid post ID
    console.log('\n2️⃣ Fetching posts to get a valid post ID...');
    const postsResponse = await axios.get(`${API_BASE}/posts?limit=1`);

    if (postsResponse.data.posts.length === 0) {
      console.log('❌ No posts found. Creating a test post first...');

      // Create a test post
      const createPostResponse = await axios.post(`${API_BASE}/posts`, {
        title: 'Test Post for View Tracking',
        content: 'This is a test post to verify view tracking functionality.',
        type: 'general'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const postId = createPostResponse.data.id;
      console.log('✅ Test post created with ID:', postId);

      // Now test view tracking
      await testViewTrackingForPost(postId, accessToken);

    } else {
      const postId = postsResponse.data.posts[0].id;
      console.log('✅ Found post with ID:', postId);

      // Test view tracking
      await testViewTrackingForPost(postId, accessToken);
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
}

async function testViewTrackingForPost(postId, accessToken) {
  console.log('\n3️⃣ Testing POST /posts/:id/view endpoint...');

  try {
    // Test authenticated view tracking
    const viewResponse = await axios.post(`${API_BASE}/posts/${postId}/view`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: 5000
    });

    console.log('✅ View tracking successful!');
    console.log('   - Status:', viewResponse.status);
    console.log('   - Response:', viewResponse.data);

  } catch (error) {
    console.log('❌ View tracking failed:');
    console.log('   - Status:', error.response?.status);
    console.log('   - Message:', error.response?.data?.message || error.message);
    console.log('   - Full error:', error.response?.data);
  }

  console.log('\n4️⃣ Testing anonymous view tracking...');

  try {
    // Test anonymous view tracking (no auth header)
    const anonViewResponse = await axios.post(`${API_BASE}/posts/${postId}/view`, {}, {
      timeout: 5000
    });

    console.log('✅ Anonymous view tracking successful!');
    console.log('   - Status:', anonViewResponse.status);
    console.log('   - Response:', anonViewResponse.data);

  } catch (error) {
    console.log('❌ Anonymous view tracking failed:');
    console.log('   - Status:', error.response?.status);
    console.log('   - Message:', error.response?.data?.message || error.message);
  }

  console.log('\n5️⃣ Testing with invalid post ID...');

  try {
    // Test with invalid post ID
    const invalidResponse = await axios.post(`${API_BASE}/posts/invalid-id/view`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: 5000
    });

    console.log('❌ This should have failed but didnt:', invalidResponse.data);

  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log('✅ Correctly rejected invalid post ID');
      console.log('   - Status:', error.response?.status);
      console.log('   - Message:', error.response?.data?.message);
    } else {
      console.log('❌ Unexpected error for invalid post ID:', error.response?.data || error.message);
    }
  }
}

// Run the test
testViewTracking().then(() => {
  console.log('\n🎉 View tracking test completed!');
}).catch(error => {
  console.error('💥 Test failed:', error);
});
