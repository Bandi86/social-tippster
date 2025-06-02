// Test script for API authentication and live matches endpoint
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('=== Testing API Authentication and Live Matches ===\n');

  try {
    // Step 1: Register a test user first
    console.log('1. Registering test user...');
    try {
      const registerResponse = await axios.post(
        `${API_BASE}/auth/register`,
        {
          username: 'testuser123',
          email: 'testuser123@test.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
        },
        {
          withCredentials: true,
          timeout: 10000,
        },
      );
      console.log('Registration successful!');
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('User already exists, proceeding with login...');
      } else {
        console.log('Registration error:', regError.response?.data?.message || regError.message);
      }
    }

    // Step 2: Login
    console.log('\n2. Attempting login...');
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
    console.log('Login successful!');
    console.log('Full login response:', JSON.stringify(loginResponse.data, null, 2));
    console.log('Access token:', loginResponse.data.accessToken ? 'Present' : 'Missing');
    console.log('User ID:', loginResponse.data.user?.id);
    console.log('User email:', loginResponse.data.user?.email);

    const accessToken = loginResponse.data.accessToken || loginResponse.data.access_token;
    const cookies = loginResponse.headers['set-cookie'];

    // Step 3: Test live matches endpoint
    console.log('\n3. Testing live matches endpoint...');

    const matchesResponse = await axios.get(`${API_BASE}/matches/live?limit=3`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: cookies ? cookies.join('; ') : '',
      },
      withCredentials: true,
      timeout: 10000,
    });

    console.log('Live matches request successful!');
    console.log('Number of matches returned:', matchesResponse.data.length);
    console.log('Matches:', JSON.stringify(matchesResponse.data, null, 2));
  } catch (error) {
    console.error('Error during API test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.response.statusText);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
  }
}

testAPI();
