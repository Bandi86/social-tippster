// Simple posts API test
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPosts() {
  console.log('=== Simple Posts API Test ===\n');

  try {
    // Test login first
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser123@test.com',
      password: 'password123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Test getting posts
    console.log('2. Testing get posts...');
    const postsResponse = await axios.get(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(
      `✅ Posts retrieved: ${postsResponse.data.posts?.length || 0} posts found (Total: ${postsResponse.data.total})\n`,
    );

    // Test creating a post
    console.log('3. Testing create post...');
    const newPost = {
      title: 'Test Post Title',
      content: 'Test post content from validation script',
      type: 'discussion',
      visibility: 'public',
    };

    const createResponse = await axios.post(`${API_BASE}/posts`, newPost, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Post created successfully with ID: ${createResponse.data.id}\n`);

    // Test getting single post
    console.log('4. Testing get single post...');
    const singlePostResponse = await axios.get(`${API_BASE}/posts/${createResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Single post retrieved: ${singlePostResponse.data.content}\n`);

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

// Run the test
testPosts().catch(console.error);
