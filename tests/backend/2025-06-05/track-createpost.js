const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testPostCreationFlow() {
  console.log('Starting comprehensive post creation tracking...\n');

  // Step 1: Login
  console.log('1. Logging in...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bob@example.com',
      password: 'password123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token received');

    // Step 2: Try to create a post
    console.log('\n2. Attempting to create post...');
    console.log('POST URL:', `${BASE_URL}/posts`);
    console.log('Headers:', {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const postData = {
      title: 'Debug Test Post',
      content: 'This is a test post to debug the createPost issue',
      type: 'discussion',
    };

    console.log('POST Body:', JSON.stringify(postData, null, 2));

    try {
      const postResponse = await axios.post(`${BASE_URL}/posts`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('✅ Post created successfully!');
      console.log('Response:', postResponse.data);
    } catch (postError) {
      console.log('❌ Post creation failed');
      console.log('Error status:', postError.response?.status);
      console.log('Error data:', postError.response?.data);
      console.log('Full error config:', {
        url: postError.config?.url,
        method: postError.config?.method,
        headers: postError.config?.headers,
        data: postError.config?.data,
      });

      // Check if this is a timeout
      if (postError.code === 'ECONNABORTED') {
        console.log('❌ Request timed out - server may be hanging');
      }
    }
  } catch (loginError) {
    console.log('❌ Login failed:', loginError.response?.data || loginError.message);
  }
}

testPostCreationFlow().catch(console.error);
