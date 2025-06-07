// Test Registration Flow End-to-End
// This script tests the registration API from frontend perspective

const axios = require('axios');

async function testRegistration() {
  console.log('🧪 Testing registration flow...\n');

  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    first_name: 'Test',
    last_name: 'User',
    password: 'TestPassword123!',
  };

  try {
    console.log('📤 Sending registration request...');
    console.log('Data:', JSON.stringify(testUser, null, 2));

    const response = await axios.post('http://localhost:3001/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for refresh token cookie
    });

    console.log('\n✅ Registration successful!');
    console.log('Status:', response.status);
    console.log('Response structure:');
    console.log('- access_token:', response.data.access_token ? '✅ Present' : '❌ Missing');
    console.log('- user:', response.data.user ? '✅ Present' : '❌ Missing');
    console.log('- message:', response.data.message || 'Not provided');

    if (response.data.user) {
      console.log('\n👤 User details:');
      console.log('- ID:', response.data.user.user_id);
      console.log('- Username:', response.data.user.username);
      console.log('- Email:', response.data.user.email);
      console.log('- Name:', `${response.data.user.first_name} ${response.data.user.last_name}`);
      console.log('- Created:', response.data.user.created_at);
    }

    // Check for refresh token cookie
    const cookies = response.headers['set-cookie'];
    const hasRefreshToken = cookies && cookies.some(cookie => cookie.includes('refresh_token'));
    console.log('- Refresh token cookie:', hasRefreshToken ? '✅ Set' : '❌ Not set');

    console.log('\n🎉 Registration flow test completed successfully!');
  } catch (error) {
    console.error('\n❌ Registration failed:');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('Network error - no response received');
      console.error('Is the backend server running on localhost:3001?');
    } else {
      console.error('Request setup error:', error.message);
    }

    process.exit(1);
  }
}

testRegistration();
