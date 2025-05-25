const axios = require('axios');

async function testRegistration() {
  try {
    const timestamp = Date.now();
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${timestamp}@example.com`,
      password: 'password123',
      username: `testuser${timestamp}`,
    };

    console.log('Testing registration with:', testData);

    const response = await axios.post('http://localhost:3001/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Registration failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
