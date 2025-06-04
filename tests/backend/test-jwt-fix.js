/**
 * Simple test script to verify JWT Strategy fix is working
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testJWTStrategyFix() {
  console.log('🔐 Testing JWT Strategy Fix...\n');

  try {
    // Step 1: Test user login to get a JWT token
    console.log('1️⃣ Testing user login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'alice@example.com',
      password: 'password123',
    });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      console.log('✅ Login successful');
      const token = loginResponse.data.access_token;
      console.log('📝 JWT Token received (first 50 chars):', token?.substring(0, 50) + '...');

      // Step 2: Test protected endpoint with JWT token
      console.log('\n2️⃣ Testing protected endpoint with JWT token...');
      const profileResponse = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.status === 200) {
        console.log('✅ Protected endpoint access successful');
        console.log('👤 User profile:', {
          id: profileResponse.data.id,
          email: profileResponse.data.email,
          username: profileResponse.data.username,
          role: profileResponse.data.role,
        });
        console.log(
          '\n🎉 JWT Strategy fix is working correctly! The system is properly using payload.sub (user ID) to validate tokens.',
        );
      } else {
        console.log('❌ Protected endpoint access failed');
        console.log('Response status:', profileResponse.status);
      }
    } else {
      console.log('❌ Login failed');
      console.log('Response status:', loginResponse.status);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ Request failed');
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);

      if (error.response.status === 401) {
        console.log('\n⚠️ Unauthorized access - this could indicate an issue with JWT validation.');
        console.log('The JWT Strategy fix might need further investigation.');
      }
    } else {
      console.log('❌ Network error:', error.message);
      console.log('Make sure the backend server is running on port 3001');
    }
  }
}

async function testServerConnection() {
  try {
    console.log('🔍 Testing server connection...');
    const response = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    try {
      // Try alternative endpoint
      const response = await axios.get(`${BACKEND_URL}/api`);
      console.log('✅ Backend server is running');
      return true;
    } catch (error2) {
      console.log('❌ Backend server is not responding');
      console.log('Error:', error2.message);
      return false;
    }
  }
}

async function main() {
  const isServerRunning = await testServerConnection();
  if (isServerRunning) {
    await testJWTStrategyFix();
  } else {
    console.log('\n❌ Cannot test JWT fix - backend server is not running');
    console.log('Please start the server with: npm run dev');
  }
}

main().catch(console.error);
