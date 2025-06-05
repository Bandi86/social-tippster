const axios = require('axios');

async function testPostCreation() {
  try {
    // First, login to get token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'bob@example.com',
      password: 'securepassword123',
    });

    const token = loginResponse.data.access_token;
    console.log('Login successful, token obtained');

    // Test 1: Valid minimal post
    console.log('\n=== Test 1: Valid minimal post ===');
    const postData1 = {
      title: 'Test Post',
      content: 'Test content for debugging',
      type: 'general',
    };

    console.log('Sending request with data:', JSON.stringify(postData1, null, 2));

    try {
      const response = await axios.post('http://localhost:3001/api/posts', postData1, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Success:', response.status, response.data);
    } catch (error) {
      console.log('Error Response Status:', error.response?.status);
      console.log('Error Response Headers:', error.response?.headers);
      console.log('Error Response Data:', error.response?.data);
      console.log('Request Headers:', error.config?.headers);
      console.log('Request Data:', error.config?.data);
    }

    // Test 2: Post with extra field to test forbidNonWhitelisted
    console.log('\n=== Test 2: Post with extra field ===');
    const postData2 = {
      title: 'Test Post 2',
      content: 'Test content 2',
      type: 'general',
      extraField: 'This should be rejected',
    };

    console.log('Sending request with data:', JSON.stringify(postData2, null, 2));

    try {
      const response = await axios.post('http://localhost:3001/api/posts', postData2, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Success:', response.status, response.data);
    } catch (error) {
      console.log('Error Response Status:', error.response?.status);
      console.log('Error Response Data:', error.response?.data);
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testPostCreation();
