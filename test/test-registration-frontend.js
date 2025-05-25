// Test script to verify frontend registration flow
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testRegistration() {
  console.log('🧪 Testing frontend registration flow...\n');

  try {
    // Test data
    const testUser = {
      name: 'Test User Frontend',
      email: `testfrontend${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
    };

    console.log('📝 Registering new user:', testUser.email);

    // Register user
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });

    console.log('✅ Registration successful!');
    console.log('📄 Response status:', registerResponse.status);
    console.log('📄 Response data:', JSON.stringify(registerResponse.data, null, 2));

    // Check if accessToken is included in response
    if (registerResponse.data.accessToken) {
      console.log('✅ Access token returned in response');

      // Test if we can access protected endpoint with the token
      console.log('\n🔐 Testing protected endpoint with token...');
      const meResponse = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${registerResponse.data.accessToken}`,
        },
      });

      console.log('✅ Protected endpoint accessible!');
      console.log('📄 User data:', JSON.stringify(meResponse.data, null, 2));
    } else {
      console.log('❌ No access token in response!');
    }
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
