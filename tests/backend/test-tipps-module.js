// This test verifies that the tipps module is working correctly
const axios = require('axios');
const baseUrl = 'http://localhost:3001';

async function testTippsEndpoints() {
  console.log('Testing tipps module endpoints...');
  try {
    // Test GET /tipps endpoint
    const tipsResponse = await axios.get(`${baseUrl}/tipps`);
    console.log('GET /tipps status:', tipsResponse.status);
    console.log('Response contains data:', !!tipsResponse.data);

    // Test GET /tipps/leaderboard endpoint
    const leaderboardResponse = await axios.get(`${baseUrl}/tipps/leaderboard`);
    console.log('GET /tipps/leaderboard status:', leaderboardResponse.status);
    console.log('Response contains data:', !!leaderboardResponse.data);

    console.log('Tipps module endpoints are working correctly!');
    return true;
  } catch (error) {
    console.error('Error testing tipps module:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Execute the test if this file is run directly
if (require.main === module) {
  testTippsEndpoints().then(success => {
    console.log('Test completed with ' + (success ? 'success' : 'failure'));
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testTippsEndpoints };
