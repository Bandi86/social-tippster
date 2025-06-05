const axios = require('axios');

async function testPostCreation() {
  try {
    console.log('Testing post creation...');

    // Login first
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testuser123@test.com',
      password: 'password123',
    });
    const token = loginRes.data.access_token;
    console.log('✅ Login successful');

    // Try to create post
    const postRes = await axios.post(
      'http://localhost:3001/api/posts',
      {
        title: 'Test Post',
        content: 'Test content',
        type: 'discussion',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('✅ Post created:', postRes.data);
    return postRes.data;
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Request Data:', JSON.stringify(error.config?.data, null, 2));
    throw error;
  }
}

testPostCreation().catch(console.error);
