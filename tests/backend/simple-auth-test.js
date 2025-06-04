const fetch = require('node-fetch');

async function testAuth() {
  console.log('🔐 Testing authentication...');

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testadmin@test.com',
        password: 'password123',
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.access_token) {
      console.log('✅ Authentication successful!');
      return data.access_token;
    } else {
      console.log('❌ Authentication failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

testAuth();
