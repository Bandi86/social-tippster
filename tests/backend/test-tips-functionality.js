const axios = require('axios');

// Simple test script to verify tips functionality
async function testTipsFunctionality() {
  const baseURL = 'http://localhost:3001';

  try {
    console.log('🔍 Testing tips functionality...');

    // Test 1: Check if tips endpoints are accessible (this will likely fail without auth)
    console.log('1. Testing tips endpoints...');
    try {
      const tipsResponse = await axios.get(`${baseURL}/tips`);
      console.log('✅ Tips endpoints are accessible');
      console.log('📊 Response:', JSON.stringify(tipsResponse.data, null, 2));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Tips endpoints require authentication (expected)');
      } else if (error.response && error.response.status === 200) {
        console.log('✅ Tips endpoints are working');
      } else {
        console.log('ℹ️  Response status:', error.response?.status);
        console.log('ℹ️  Response data:', error.response?.data);
      }
    }

    // Test 2: Check Swagger API documentation
    console.log('2. Testing API documentation...');
    try {
      const swaggerResponse = await axios.get(`${baseURL}/api-json`);
      console.log('✅ Swagger API documentation is accessible');

      // Check if tips endpoints are documented
      const hasTripsEndpoints = JSON.stringify(swaggerResponse.data).includes('/tips');
      if (hasTripsEndpoints) {
        console.log('✅ Tips endpoints are documented in Swagger');
      } else {
        console.log('❌ Tips endpoints not found in Swagger documentation');
      }
    } catch (error) {
      console.log('⚠️  Could not access Swagger documentation:', error.message);
    }

    // Test 3: Check public leaderboard endpoint
    console.log('3. Testing public leaderboard endpoint...');
    try {
      const leaderboardResponse = await axios.get(`${baseURL}/tips/leaderboard`);
      console.log('✅ Leaderboard endpoint is accessible');
      console.log('📊 Leaderboard data:', JSON.stringify(leaderboardResponse.data, null, 2));
    } catch (error) {
      console.log(
        'ℹ️  Leaderboard endpoint response:',
        error.response?.status,
        error.response?.data,
      );
    }

    console.log('🎉 Basic tips functionality test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3001');
      console.log('💡 Try running: npm run dev');
    }
  }
}

// Run the test
testTipsFunctionality();
