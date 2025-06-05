const axios = require('axios');

async function testPostCreation() {
  try {
    console.log('🔍 Testing post creation with minimal data...');

    // Try different user accounts
    const credentials = [
      { email: 'bob@example.com', password: 'password123' },
      { email: 'alice@example.com', password: 'password123' },
      { email: 'testadmin@test.com', password: 'password123' },
    ];

    let token = null;
    let activeUser = null;

    for (const cred of credentials) {
      try {
        console.log(`🔐 Trying login with: ${cred.email}`);
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', cred);
        token = loginResponse.data.access_token;
        activeUser = cred.email;
        console.log(`✅ Login successful with: ${activeUser}`);
        break;
      } catch (loginError) {
        console.log(
          `❌ Login failed for ${cred.email}:`,
          loginError.response?.data?.message || loginError.message,
        );
      }
    }

    if (!token) {
      console.error('❌ No valid credentials found');
      return;
    }

    // Test with minimal valid data for discussion type
    const minimalPost = {
      title: 'Test Discussion',
      content: 'This is a test discussion post content.',
      type: 'discussion',
    };

    console.log('📝 Creating post with data:', JSON.stringify(minimalPost, null, 2));
    console.log(`👤 Using account: ${activeUser}`);

    const response = await axios.post('http://localhost:3001/api/posts', minimalPost, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Post created successfully:', response.data);
  } catch (error) {
    console.log('❌ Error creating post:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('Request error:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testPostCreation();
