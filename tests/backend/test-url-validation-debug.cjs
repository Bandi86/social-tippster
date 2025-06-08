// Debug script to test URL validation specifically
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function getTestUser() {
  try {
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      { email: 'alice@example.com', password: 'password123' },
      { withCredentials: true, timeout: 10000 },
    );
    return loginResponse.data.access_token;
  } catch (error) {
    throw new Error('Login failed');
  }
}

async function testUrlValidation() {
  console.log('=== Testing URL Validation in Post Creation ===\n');

  try {
    const accessToken = await getTestUser();
    console.log('✅ Authentication successful\n');

    const testUrls = [
      'http://localhost:3001/uploads/posts/test.png',
      'https://example.com/image.png',
      'https://via.placeholder.com/150',
      'http://localhost:3001/uploads/posts/1749367347065-365292054.png',
      '/uploads/posts/test.png',
      'uploads/posts/test.png',
      'not-a-url',
      '',
    ];

    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      console.log(`${i + 1}. Testing URL: "${url}"`);

      const postData = {
        content: `Test post ${i + 1} with URL validation`,
        type: 'discussion',
        imageUrl: url,
        tags: ['test'],
      };

      try {
        const response = await axios.post(`${API_BASE}/posts`, postData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
        console.log(`   ✅ Accepted - Post created: ${response.data.id}`);
        console.log(`   Image URL stored: ${response.data.image_url}`);
      } catch (error) {
        console.log(`   ❌ Rejected - ${error.response?.data?.message || error.message}`);
      }
      console.log('');
    }

    console.log('🎯 URL validation testing complete!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUrlValidation();
