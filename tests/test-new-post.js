/**
 * Test New Post Creation
 * Verifies that new posts can be created after deletion
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testNewPost() {
  console.log('🧪 Testing new post creation after deletion...\n');

  try {
    // Login as Bob (admin)
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'bob@example.com',
      password: 'password123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Logged in successfully\n');

    // Create a test post (note: no title field - backend generates it from content)
    console.log('2. Creating test post...');
    const response = await axios.post(
      `${API_BASE}/posts`,
      {
        content:
          'This is a test post created after deleting all posts. The application works correctly with fresh data!',
        type: 'general',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log('✅ New post created successfully!');
    console.log(`📝 Post ID: ${response.data.id}`);
    console.log(`📄 Post title: ${response.data.title}\n`);

    // Verify by fetching posts
    console.log('3. Verifying posts count...');
    const postsResponse = await axios.get(`${API_BASE}/posts?page=1&limit=10`);
    console.log(`📊 Total posts now: ${postsResponse.data.total}`);

    if (postsResponse.data.total === 1) {
      console.log('\n🎉 SUCCESS: New post creation works perfectly!');
      console.log('📝 The application is ready for testing with fresh data.');
    } else {
      console.log('\n⚠️ Unexpected post count.');
    }
  } catch (error) {
    console.error('❌ Error during post creation test:', error.response?.data || error.message);
  }
}

testNewPost();
