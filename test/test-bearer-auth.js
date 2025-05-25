// Test script to verify Bearer token authentication for admin endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

async function testBearerAuth() {
  try {
    console.log('🔐 Testing Bearer Token Authentication for Admin Endpoints\n');

    // Step 1: Register or Login as admin user
    console.log('1. Attempting to login/register with admin credentials...');

    // First, try to register an admin user (this might fail if user already exists)
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admintest',
        email: 'admintest@test.com',
        password: 'Admin123!',
        role: 'admin', // This might not be allowed in registration
      }),
    });

    let accessToken;
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      accessToken = registerData.data.accessToken;
      console.log('✅ Admin user registered successfully');
    } else {
      // Try to login instead
      console.log('   Registration failed, attempting login...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admintest@test.com',
          password: 'Admin123!',
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        accessToken = loginData.data.accessToken;
        console.log('✅ Admin user logged in successfully');
      } else {
        console.log('❌ Failed to login existing admin user');
        const loginError = await loginResponse.json();
        console.log('   Login error:', loginError.message);

        // Let's try with a different approach - create a regular user and then test
        console.log('   Trying to create a regular user instead...');
        const regularUserResponse = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            email: 'testuser@test.com',
            password: 'Test123!',
          }),
        });

        if (regularUserResponse.ok) {
          const userData = await regularUserResponse.json();
          accessToken = userData.data.accessToken;
          console.log('✅ Regular user created successfully (will test with this token)');
        } else {
          // Try login with regular user
          const regularLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'testuser@test.com',
              password: 'Test123!',
            }),
          });

          if (regularLoginResponse.ok) {
            const userData = await regularLoginResponse.json();
            accessToken = userData.data.accessToken;
            console.log('✅ Regular user logged in successfully');
          } else {
            console.log('❌ Failed to create or login any user');
            return;
          }
        }
      }
    }

    console.log('   Access Token received:', accessToken ? '✅ Yes' : '❌ No');
    if (!accessToken) {
      console.log('❌ No access token received, cannot test admin endpoints');
      return;
    }

    // Step 2: Test admin endpoint with Bearer token
    console.log('\n2. Testing admin endpoint with Bearer token...');
    const adminResponse = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('   Admin endpoint response status:', adminResponse.status);

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin endpoint accessible with Bearer token');
      console.log('   Response data:', JSON.stringify(adminData, null, 2));
    } else {
      const errorData = await adminResponse.json();
      console.log('❌ Admin endpoint failed');
      console.log('   Error:', errorData.message);
      console.log('   This might be expected if the user is not an admin');
    }

    // Step 3: Test without Bearer token (should fail)
    console.log('\n3. Testing admin endpoint without Bearer token (should fail)...');
    const noTokenResponse = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('   Response status:', noTokenResponse.status);
    if (!noTokenResponse.ok) {
      console.log('✅ Admin endpoint correctly rejected request without Bearer token');
    } else {
      console.log('❌ Admin endpoint should have rejected request without Bearer token');
    }

    // Step 4: Test with invalid Bearer token (should fail)
    console.log('\n4. Testing admin endpoint with invalid Bearer token (should fail)...');
    const invalidTokenResponse = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid_token_123',
        'Content-Type': 'application/json',
      },
    });

    console.log('   Response status:', invalidTokenResponse.status);
    if (!invalidTokenResponse.ok) {
      console.log('✅ Admin endpoint correctly rejected invalid Bearer token');
    } else {
      console.log('❌ Admin endpoint should have rejected invalid Bearer token');
    }

    console.log('\n🎉 Bearer token authentication test completed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testBearerAuth();
