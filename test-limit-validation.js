// Test script for testing limit parameter validation on live matches endpoint
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testLimitValidation() {
  console.log('=== Testing Live Matches Limit Parameter Validation ===\n');

  try {
    // First login to get a valid token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testuser123@test.com',
      password: 'password123'
    }, {
      withCredentials: true,
      timeout: 10000
    });

    const accessToken = loginResponse.data.access_token;
    console.log('Login successful!\n');

    // Test cases for limit parameter
    const testCases = [
      { limit: 1, description: 'Minimum valid limit (1)' },
      { limit: 5, description: 'Normal limit (5)' },
      { limit: 50, description: 'Maximum valid limit (50)' },
      { limit: 0, description: 'Invalid limit (0) - should fail' },
      { limit: 51, description: 'Invalid limit (51) - should fail' },
      { limit: -1, description: 'Invalid limit (-1) - should fail' },
      { limit: 'abc', description: 'Invalid limit (string) - should fail' },
      { limit: null, description: 'No limit parameter - should use default' }
    ];

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.description}`);

      try {
        const url = testCase.limit !== null
          ? `${API_BASE}/matches/live?limit=${testCase.limit}`
          : `${API_BASE}/matches/live`;

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          withCredentials: true,
          timeout: 10000
        });

        console.log(`✅ Success: Returned ${response.data.length} matches`);
        if (response.data.length > 0) {
          console.log(`   First match: ${response.data[0].home_team} vs ${response.data[0].away_team}`);
        }
      } catch (error) {
        if (error.response) {
          console.log(`❌ Failed (${error.response.status}): ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
        } else {
          console.log(`❌ Network error: ${error.message}`);
        }
      }
      console.log('');
    }

  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
  }
}

testLimitValidation();
