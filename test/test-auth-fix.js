// Test the authentication fix
const fetch = require('node-fetch');

async function testAuthenticationFlow() {
  console.log('🔄 Testing authentication flow...\n');

  try {
    // Step 1: Login
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    console.log('✅ Login successful');
    console.log(`   - Access token: ${loginData.access_token ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - User role: ${loginData.user.role}`);

    // Step 2: Test admin endpoint with token
    console.log('\n2. Testing admin endpoint with Bearer token...');
    const adminResponse = await fetch('http://localhost:3001/api/admin/users', {
      headers: {
        Authorization: `Bearer ${loginData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      throw new Error(
        `Admin endpoint failed: ${errorData.message} (Status: ${adminResponse.status})`,
      );
    }

    const adminData = await adminResponse.json();
    console.log('✅ Admin endpoint successful');
    console.log(
      `   - Found ${adminData.users ? adminData.users.length : adminData.length || 0} users`,
    );

    console.log('\n🎉 Authentication flow test PASSED!');
    console.log('\nThe fix appears to be working. The frontend should now be able to:');
    console.log('1. Login and receive the access_token from backend');
    console.log('2. Map it to accessToken in the auth store');
    console.log('3. Use it in Bearer token authentication for admin endpoints');
  } catch (error) {
    console.error('\n❌ Authentication flow test FAILED:');
    console.error(`   Error: ${error.message}`);
  }
}

testAuthenticationFlow();
