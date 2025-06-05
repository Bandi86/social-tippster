const axios = require('axios');

async function testPostCreationWithSeedUser() {
  try {
    console.log('🔍 Testing post creation with seeded admin user...');

    // Login with Bob (admin user from seed data)
    console.log('🔐 Logging in with seeded admin user...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'bob@example.com',
      password: 'password123',
    });

    const token = loginResponse.data.access_token || loginResponse.data.token;
    console.log('✅ Login successful, token length:', token?.length);

    // Test with minimal valid data for discussion type
    const minimalPost = {
      title: 'Test Discussion Post',
      content: 'This is a test discussion post content for debugging.',
      type: 'discussion',
    };

    console.log('📝 Creating post with minimal data:', JSON.stringify(minimalPost, null, 2));

    const response = await axios.post('http://localhost:3001/api/posts', minimalPost, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Post created successfully!');
    console.log('📄 Created post data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Request error:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testPostCreationWithSeedUser();
