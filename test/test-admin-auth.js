#!/usr/bin/env node

const axios = require('axios');

async function testAdminAuth() {
  try {
    console.log('Testing admin authentication flow...\n');

    // Step 1: Login with admin credentials
    console.log('1. Logging in with admin credentials...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com',
      password: 'TestPassword123!',
    });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      console.log('✅ Login successful!');
      console.log('User role:', loginResponse.data.user.role);

      const token = loginResponse.data.access_token;
      console.log('Access token received:', token ? 'Yes' : 'No');

      // Step 2: Test admin endpoint access
      console.log('\n2. Testing admin endpoint access...');
      const adminResponse = await axios.get('http://localhost:3001/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (adminResponse.status === 200) {
        console.log('✅ Admin endpoint access successful!');
        console.log('Users data received:', adminResponse.data.data?.length || 0, 'users');
        console.log('\n🎉 ADMIN AUTHENTICATION FIXED! 🎉');
        console.log('The user can now access admin functionality.');
      } else {
        console.log('❌ Admin endpoint access failed');
      }
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testAdminAuth();
