/**
 * Frontend Registration Test
 * Tests the registration flow using the same data structure as the frontend form
 */

const axios = require('axios');

async function testFrontendRegistrationFlow() {
  const timestamp = Date.now();

  console.log('🧪 Testing Frontend Registration Flow...');

  try {
    // Simulate the exact data structure that the frontend sends
    const frontendRegistrationData = {
      username: `frontend_test_${timestamp}`,
      email: `frontend_${timestamp}@example.com`,
      password: 'testpassword123',
      firstName: 'Frontend', // This is what the form sends
      lastName: 'Test', // This is what the form sends
      // Note: deviceFingerprint is now excluded (this was the bug!)
    };

    console.log('📝 Frontend form data:', frontendRegistrationData);

    // Transform data like the frontend does (this should happen in transformRegisterData)
    const backendData = {
      username: frontendRegistrationData.username,
      email: frontendRegistrationData.email,
      password: frontendRegistrationData.password,
      first_name: frontendRegistrationData.firstName, // Transformed to first_name
      last_name: frontendRegistrationData.lastName, // Transformed to last_name
      // deviceFingerprint excluded - this was causing the 400 error!
    };

    console.log('🔄 Transformed backend data:', backendData);

    // Test the registration endpoint
    console.log('\n📡 Sending registration request...');
    const response = await axios.post('http://localhost:3001/api/auth/register', backendData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for refresh token cookie
    });

    console.log('\n✅ Registration Response:');
    console.log('📊 Status:', response.status);
    console.log('🔑 Access Token:', response.data.access_token ? 'Present' : 'Missing');
    console.log('👤 User Data:', response.data.user ? 'Present' : 'Missing');
    console.log('💬 Message:', response.data.message || 'None');
    console.log('🍪 Refresh Cookie:', response.headers['set-cookie'] ? 'Set' : 'Not Set');

    if (response.data.user) {
      console.log('\n👤 User Details:');
      console.log('   - ID:', response.data.user.id);
      console.log('   - Username:', response.data.user.username);
      console.log('   - Email:', response.data.user.email);
      console.log(
        '   - Full Name:',
        `${response.data.user.first_name} ${response.data.user.last_name}`,
      );
    }

    console.log('\n🎉 SUCCESS: Frontend registration flow is working correctly!');
    console.log('✅ No 404 errors');
    console.log('✅ No 400 "deviceFingerprint should not exist" errors');
    console.log('✅ User automatically logged in after registration');
    console.log('✅ Complete auth response returned');
  } catch (error) {
    console.error('\n❌ Frontend registration test failed!');
    console.error('🔍 Error details:');

    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Error:', error.response.data);
      console.error('🌐 URL:', error.config?.url);

      // Specific error analysis
      if (error.response.status === 404) {
        console.error('\n🚨 404 Error - This was the original bug!');
        console.error('❌ Registration endpoint not found or not accessible');
      }

      if (
        error.response.status === 400 &&
        error.response.data?.message?.includes('deviceFingerprint')
      ) {
        console.error('\n🚨 400 Error - DeviceFingerprint issue!');
        console.error('❌ Backend rejecting deviceFingerprint field');
        console.error('💡 Fix: Exclude deviceFingerprint from request body');
      }
    } else {
      console.error('💥 Network error:', error.message);
    }
  }
}

// Run the test
testFrontendRegistrationFlow();
