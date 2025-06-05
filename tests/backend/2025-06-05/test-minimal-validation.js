const axios = require('axios');

async function testWithoutValidation() {
  console.log('=== TESTING RAW POST REQUEST ===');

  try {
    // First login to get token
    console.log('1. Attempting login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'bob@example.com',
      password: 'password123',
    });

    console.log('Login successful');
    const token = loginResponse.data.access_token;

    // Test with minimal data to see if validation is the issue
    console.log('\n2. Testing with minimal valid data...');

    const minimalPostData = {
      title: 'Test',
      content: 'Test content',
      type: 'general',
    };

    console.log('Sending minimal post data:', JSON.stringify(minimalPostData, null, 2));

    const response = await axios.post('http://localhost:3001/api/posts', minimalPostData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    console.log('\n✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ FAILED!');

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testWithoutValidation().catch(console.error);
