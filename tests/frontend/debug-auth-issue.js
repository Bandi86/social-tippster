/**
 * Debug script to test authentication flow and capture double /api prefix issue
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function debugAuthFlow() {
  console.log('🔍 Starting authentication debug session...\n');

  try {
    // Step 1: Test direct login to get tokens
    console.log('1️⃣ Testing direct login API call...');
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: 'testadmin@test.com',
        password: 'password123',
      },
      {
        withCredentials: true,
        timeout: 5000,
      },
    );

    console.log('✅ Login successful!');
    console.log('   - Status:', loginResponse.status);
    console.log('   - Access token:', !!loginResponse.data.access_token);
    console.log('   - User:', loginResponse.data.user?.email);

    const accessToken = loginResponse.data.access_token;

    // Step 2: Test /api/auth/me endpoint directly
    console.log('\n2️⃣ Testing /api/auth/me endpoint directly...');
    try {
      const authMeResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      });
      console.log('✅ /api/auth/me successful!');
      console.log('   - Status:', authMeResponse.status);
      console.log('   - User ID:', authMeResponse.data.user_id);
    } catch (authMeError) {
      console.log(
        '❌ /api/auth/me failed:',
        authMeError.response?.status,
        authMeError.response?.data?.message || authMeError.message,
      );
    }

    // Step 3: Test /api/users/me endpoint directly
    console.log('\n3️⃣ Testing /api/users/me endpoint directly...');
    try {
      const usersMeResponse = await axios.get(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      });
      console.log('✅ /api/users/me successful!');
      console.log('   - Status:', usersMeResponse.status);
      console.log('   - User ID:', usersMeResponse.data.user_id);
    } catch (usersMeError) {
      console.log(
        '❌ /api/users/me failed:',
        usersMeError.response?.status,
        usersMeError.response?.data?.message || usersMeError.message,
      );
    }

    // Step 4: Test potential double API prefix issue
    console.log('\n4️⃣ Testing potential double /api prefix endpoints...');

    const doubleApiEndpoints = ['/api/api/auth/me', '/api/api/users/me'];

    for (const endpoint of doubleApiEndpoints) {
      try {
        const testUrl = `http://localhost:3001${endpoint}`;
        console.log(`   Testing: ${testUrl}`);
        const response = await axios.get(testUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 3000,
        });
        console.log(`   ⚠️ Unexpected success for ${endpoint}:`, response.status);
      } catch (error) {
        console.log(`   ✅ Expected 404 for ${endpoint}:`, error.response?.status || error.code);
      }
    }

    // Step 5: Test frontend auth initialization flow simulation
    console.log('\n5️⃣ Simulating frontend auth store initialization...');

    // Simulate what the auth store does
    try {
      const authStoreValidation = await axios.get(`http://localhost:3001/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      });
      console.log('✅ Auth store validation successful!');
      console.log('   - Status:', authStoreValidation.status);
    } catch (authStoreError) {
      console.log(
        '❌ Auth store validation failed:',
        authStoreError.response?.status,
        authStoreError.response?.data?.message || authStoreError.message,
      );
    }
  } catch (error) {
    console.error('❌ Debug flow failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the debug session
debugAuthFlow()
  .then(() => {
    console.log('\n🏁 Debug session completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Debug session crashed:', error);
    process.exit(1);
  });
