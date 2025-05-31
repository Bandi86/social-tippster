// Test script for testing posts validation specifically for empty content
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPostValidation() {
  console.log('=== Testing Posts Validation for Empty Content ===\n');

  try {
    // First login to get a valid token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: 'testuser123@test.com',
        password: 'password123',
      },
      {
        withCredentials: true,
        timeout: 10000,
      },
    );

    const accessToken = loginResponse.data.access_token;
    console.log('✓ Login successful!\n');

    // Test cases for validation
    const validationTests = [
      {
        name: 'Empty title validation',
        data: {
          title: '',
          content: 'Valid content',
          type: 'discussion',
        },
        expectedStatus: 400,
      },
      {
        name: 'Missing title validation',
        data: {
          content: 'Valid content',
          type: 'discussion',
        },
        expectedStatus: 400,
      },
      {
        name: 'Empty content validation',
        data: {
          title: 'Valid title',
          content: '',
          type: 'discussion',
        },
        expectedStatus: 400,
      },
      {
        name: 'Missing content validation',
        data: {
          title: 'Valid title',
          type: 'discussion',
        },
        expectedStatus: 400,
      },
      {
        name: 'Invalid type validation',
        data: {
          title: 'Valid title',
          content: 'Valid content',
          type: 'invalid_type',
        },
        expectedStatus: 400,
      },
      {
        name: 'Tip with invalid odds (too low)',
        data: {
          title: 'Valid title',
          content: 'Valid content',
          type: 'tip',
          odds: 0.5,
          stake: 5,
          confidence: 4,
        },
        expectedStatus: 400,
      },
      {
        name: 'Tip with invalid stake (too high)',
        data: {
          title: 'Valid title',
          content: 'Valid content',
          type: 'tip',
          odds: 2.5,
          stake: 15,
          confidence: 4,
        },
        expectedStatus: 400,
      },
      {
        name: 'Tip with invalid confidence (too low)',
        data: {
          title: 'Valid title',
          content: 'Valid content',
          type: 'tip',
          odds: 2.5,
          stake: 5,
          confidence: 0,
        },
        expectedStatus: 400,
      },
      {
        name: 'Valid post should pass',
        data: {
          title: 'Valid title',
          content: 'Valid content',
          type: 'discussion',
        },
        expectedStatus: 201,
      },
    ];

    console.log('2. Running validation tests...\n');

    for (const test of validationTests) {
      try {
        const response = await axios.post(`${API_BASE}/posts`, test.data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        });

        if (response.status === test.expectedStatus) {
          console.log(`✓ ${test.name}: Expected ${test.expectedStatus}, got ${response.status}`);
          if (test.expectedStatus === 201) {
            console.log(`  Created post ID: ${response.data.id}`);
          }
        } else {
          console.log(`✗ ${test.name}: Expected ${test.expectedStatus}, got ${response.status}`);
        }
      } catch (error) {
        const actualStatus = error.response?.status || 0;
        if (actualStatus === test.expectedStatus) {
          console.log(`✓ ${test.name}: Expected ${test.expectedStatus}, got ${actualStatus}`);
          if (error.response?.data?.message) {
            console.log(`  Validation message: ${JSON.stringify(error.response.data.message)}`);
          }
        } else {
          console.log(`✗ ${test.name}: Expected ${test.expectedStatus}, got ${actualStatus}`);
          console.log(`  Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    console.log('\n=== Validation Test Summary ===');
    console.log('Validation tests completed! Check above for any issues with validation.');
  } catch (error) {
    console.error('Test setup failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPostValidation().catch(console.error);
