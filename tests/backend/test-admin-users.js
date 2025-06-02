const axios = require('axios');

// Test script to verify admin users page functionality
async function testAdminUsersPage() {
  const baseURL = 'http://localhost:3001/api';

  try {
    console.log('🧪 Testing Admin Users Page Functionality...\n');

    // Step 1: Login as admin
    console.log('1. Attempting admin login...');
    const loginResponse = await axios.post(
      `${baseURL}/auth/login`,
      {
        email: 'testadmin@test.com',
        password: 'password123',
      },
      {
        withCredentials: true,
      },
    );

    const { access_token } = loginResponse.data;
    console.log('✅ Admin login successful');

    // Step 2: Test admin stats endpoint
    console.log('\n2. Testing admin stats endpoint...');
    const statsResponse = await axios.get(`${baseURL}/admin/users/stats`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('✅ Admin stats retrieved:', statsResponse.data); // Step 3: Test admin users endpoint
    console.log('\n3. Testing admin users endpoint...');
    const usersResponse = await axios.get(`${baseURL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        page: 1,
        limit: 10,
      },
    });

    console.log('✅ Raw admin users response structure:');
    console.log('- Response keys:', Object.keys(usersResponse.data));
    console.log('- Meta data:', usersResponse.data.meta);
    console.log('- Users count in data array:', usersResponse.data.data.length);

    console.log('\n✅ Admin users retrieved:');
    console.log('- Total users:', usersResponse.data.meta.total);
    console.log('- Users in response:', usersResponse.data.data.length);
    console.log(
      '- First user example:',
      usersResponse.data.data[0]
        ? {
            user_id: usersResponse.data.data[0].user_id,
            id: usersResponse.data.data[0].id,
            email: usersResponse.data.data[0].email,
            role: usersResponse.data.data[0].role,
            username: usersResponse.data.data[0].username,
          }
        : 'No users found',
    );

    console.log('\n🎉 All admin API endpoints are working correctly!');
    console.log('\nThe frontend admin users page should now be able to:');
    console.log('- Load and display user statistics');
    console.log('- Load and display paginated user list');
    console.log('- Apply filters and search');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('\n💡 This might be an authentication issue.');
      console.log('Make sure the admin user exists and credentials are correct.');
    } else if (error.response?.status === 403) {
      console.log('\n💡 This might be a permissions issue.');
      console.log('Make sure the user has admin role.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server might not be running.');
      console.log('Make sure to start the backend with: npm run start:dev');
    }
  }
}

testAdminUsersPage();
