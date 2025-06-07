/**
 * End-to-End Registration Test
 * Tests the complete registration flow from frontend to backend
 */

const axios = require('axios');

async function testRegistration() {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  console.log('🧪 Testing registration flow...');
  console.log('📧 Test user:', testUser.email);

  try {
    // Test 1: Verify backend is running
    console.log('\n1️⃣ Checking backend health...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend is healthy:', healthResponse.data);

    // Test 2: Test registration with correct field mapping
    console.log('\n2️⃣ Testing registration endpoint...');
    const registrationData = {
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      first_name: testUser.firstName, // Backend expects first_name
      last_name: testUser.lastName, // Backend expects last_name
    };

    const registerResponse = await axios.post(
      'http://localhost:3001/api/auth/register',
      registrationData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    );

    console.log('✅ Registration successful!');
    console.log('📊 Response status:', registerResponse.status);
    console.log('🔑 Has access_token:', !!registerResponse.data.access_token);
    console.log('👤 User created:', registerResponse.data.user?.username);
    console.log('🍪 Set-Cookie header:', !!registerResponse.headers['set-cookie']);

    // Test 3: Verify the user can use the token
    if (registerResponse.data.access_token) {
      console.log('\n3️⃣ Testing token authentication...');
      const profileResponse = await axios.get('http://localhost:3001/api/users/profile', {
        headers: {
          Authorization: `Bearer ${registerResponse.data.access_token}`,
        },
      });
      console.log('✅ Token authentication successful!');
      console.log('👤 Profile data:', profileResponse.data.username);
    }

    console.log('\n🎉 All tests passed! Registration flow is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('🔍 Error details:');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Message:', error.response.data);
      console.error('🌐 URL:', error.config?.url);
    } else {
      console.error('💥 Network/other error:', error.message);
    }

    // Additional debugging
    if (error.response?.status === 404) {
      console.error('\n🔍 404 Error Analysis:');
      console.error('- Backend server running on http://localhost:3001?');
      console.error('- Registration endpoint available at /api/auth/register?');
      console.error('- Check CORS configuration');
    }

    if (error.response?.status === 400) {
      console.error('\n🔍 400 Error Analysis:');
      console.error('- Field mapping issue? (firstName/lastName vs first_name/last_name)');
      console.error('- Unexpected fields in request body?');
      console.error('- Validation errors?');
    }
  }
}

// Run the test
testRegistration();
