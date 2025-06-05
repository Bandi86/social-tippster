const axios = require('axios');

async function quickTest() {
  console.log('Testing backend connection...');

  try {
    // Test simple GET first
    const getRes = await axios.get('http://localhost:3001/api/posts');
    console.log('✅ GET /api/posts works:', getRes.data.posts.length, 'posts found');

    // Test login
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testuser123@test.com',
      password: 'password123',
    });
    console.log('✅ Login works, token length:', loginRes.data.access_token.length);

    // Test simple post creation
    const token = loginRes.data.access_token;
    const postData = {
      title: 'Quick Test',
      content: 'Quick test content',
      type: 'general',
    };

    console.log('Attempting post creation...');
    const postRes = await axios.post('http://localhost:3001/api/posts', postData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });

    console.log('✅ Post creation SUCCESS!');
    console.log('Response:', postRes.data);
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
      console.log('Connection issue:', error.code);
    } else if (error.response) {
      console.log('HTTP Error:', error.response.status, error.response.data);
    } else {
      console.log('Other error:', error.message);
    }
  }
}

quickTest();
