const axios = require('axios');

async function testValidationErrors() {
  console.log('=== TESTING FOR VALIDATION ERRORS ===');

  try {
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'bob@example.com',
      password: 'password123',
    });

    console.log('Login successful');
    const token = loginResponse.data.access_token;

    // Test 1: Empty request body to trigger validation
    console.log('\n2. Testing with empty body...');
    try {
      const response = await axios.post(
        'http://localhost:3001/api/posts',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Empty body request succeeded:', response.status);
    } catch (error) {
      console.log('Empty body failed (expected):', error.response?.status);
      console.log('Error data:', error.response?.data);
    }

    // Test 2: Invalid type field
    console.log('\n3. Testing with invalid type...');
    try {
      const response = await axios.post(
        'http://localhost:3001/api/posts',
        {
          title: 'Test',
          content: 'Test content',
          type: 'invalid_type',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Invalid type request succeeded:', response.status);
    } catch (error) {
      console.log('Invalid type failed (expected):', error.response?.status);
      console.log('Error data:', error.response?.data);
    }

    // Test 3: Extra forbidden fields
    console.log('\n4. Testing with forbidden fields...');
    try {
      const response = await axios.post(
        'http://localhost:3001/api/posts',
        {
          title: 'Test',
          content: 'Test content',
          type: 'general',
          forbiddenField: 'this should be rejected',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Forbidden fields request succeeded:', response.status);
    } catch (error) {
      console.log('Forbidden fields failed (expected):', error.response?.status);
      console.log('Error data:', error.response?.data);
    }

    // Test 4: Valid minimal data again
    console.log('\n5. Testing with valid data again...');
    try {
      const response = await axios.post(
        'http://localhost:3001/api/posts',
        {
          title: 'Test Post',
          content: 'Test content here',
          type: 'general',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('✅ VALID DATA SUCCEEDED:', response.status, response.data);
    } catch (error) {
      console.log('❌ VALID DATA FAILED:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Request headers sent:', error.config?.headers);
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testValidationErrors();
