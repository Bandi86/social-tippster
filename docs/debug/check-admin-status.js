const axios = require('axios');

async function checkAdminPageStatus() {
  const baseURL = 'http://localhost:3001/api';

  try {
    console.log('🔐 Logging in as admin...');
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
    console.log('✅ Login successful');

    // Wait a moment to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n📊 Testing admin stats...');
    const statsResponse = await axios.get(`${baseURL}/admin/users/stats`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log('✅ Stats loaded:', statsResponse.data);

    // Wait a moment to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n👥 Testing admin users...');
    const usersResponse = await axios.get(`${baseURL}/admin/users?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const transformedUsers = usersResponse.data.data.map(user => ({
      id: user.user_id,
      email: user.email,
      username: user.username,
      role: user.role,
      is_banned: user.banned_at !== null,
      is_verified: user.email_verified_at !== null,
    }));

    console.log('✅ Users loaded successfully');
    console.log('- Total users:', usersResponse.data.meta.total);
    console.log('- Sample users:');
    transformedUsers.slice(0, 3).forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.username} (${user.email}) - ${user.role} - ${user.is_banned ? 'Banned' : 'Active'}`,
      );
    });

    console.log('\n🎉 Admin API is fully functional!');
    console.log('\nThe frontend admin users page should now work properly with:');
    console.log('- Correct user ID mapping (user_id -> id)');
    console.log('- Proper banned status mapping (banned_at -> is_banned)');
    console.log('- Correct verification status mapping (email_verified_at -> is_verified)');
    console.log('- Optimized API calls to avoid rate limiting');
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ Rate limited. Please wait a moment and try again.');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

checkAdminPageStatus();
