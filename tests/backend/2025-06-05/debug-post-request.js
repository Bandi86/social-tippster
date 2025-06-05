const axios = require('axios');

async function debugPostRequest() {
  console.log('=== DEBUGGING POST REQUEST ===');

  try {
    // First login to get token
    console.log('1. Attempting login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'bob@example.com',
      password: 'password123',
    });

    console.log('Login successful:', {
      status: loginResponse.status,
      hasToken: !!loginResponse.data.access_token,
    });

    const token = loginResponse.data.access_token;

    // Now try to create a post with detailed error handling
    console.log('\n2. Attempting post creation...');

    const postData = {
      title: 'Debug Test Post',
      content: 'Testing post creation for debugging',
      type: 'general',
    };

    console.log('Request data:', JSON.stringify(postData, null, 2));
    console.log('Authorization token (first 20 chars):', token.substring(0, 20) + '...');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    };

    console.log('Request config:', {
      url: 'http://localhost:3001/api/posts',
      method: 'POST',
      headers: config.headers,
      timeout: config.timeout,
    });

    const response = await axios.post('http://localhost:3001/api/posts', postData, config);

    console.log('\n✅ POST request successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ POST request failed!');

    if (error.response) {
      // Server responded with error status
      console.log('Error Response Status:', error.response.status);
      console.log('Error Response Headers:', error.response.headers);
      console.log('Error Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request was made but no response received
      console.log('No response received:', error.request);
    } else {
      // Something else happened
      console.log('Error setting up request:', error.message);
    }

    console.log('Full error object:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
  }
}

debugPostRequest().catch(console.error);
