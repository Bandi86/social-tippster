const axios = require('axios');

async function checkUsers() {
  try {
    console.log('🔍 Checking available users...');

    // Check if there's an endpoint to get users or create one
    const response = await axios.get('http://localhost:3001/api/users');
    console.log('Available users:', response.data);
  } catch (error) {
    console.log('❌ Cannot get users (expected if endpoint is protected)');
    console.log('Status:', error.response?.status);

    // Try to register a test user instead
    console.log('🔄 Trying to register a test user...');
    try {
      const registerResponse = await axios.post('http://localhost:3001/api/auth/register', {
        email: 'testuser@example.com',
        password: 'testpassword123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      });
      console.log('✅ User registered:', registerResponse.data);

      // Now try to login with this user
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'testuser@example.com',
        password: 'testpassword123',
      });
      console.log('✅ Login successful with test user');

      return loginResponse.data.token;
    } catch (regError) {
      console.log('❌ Registration failed:', regError.response?.data || regError.message);

      // Try with existing seed data user credentials
      console.log('🔄 Trying with potential seed user...');
      try {
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
          email: 'admin@example.com',
          password: 'admin123',
        });
        console.log('✅ Login successful with admin user');
        return loginResponse.data.token;
      } catch (adminError) {
        console.log('❌ Admin login failed:', adminError.response?.data || adminError.message);

        // Try another common seed credential
        try {
          const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'test@example.com',
            password: 'password',
          });
          console.log('✅ Login successful with test user');
          return loginResponse.data.token;
        } catch (testError) {
          console.log('❌ Test login failed:', testError.response?.data || testError.message);
          return null;
        }
      }
    }
  }
}

async function testPostWithValidUser() {
  const token = await checkUsers();

  if (!token) {
    console.log('❌ No valid user found, cannot test post creation');
    return;
  }

  console.log('🚀 Testing post creation with valid token...');

  // Test with minimal valid data for discussion type
  const minimalPost = {
    title: 'Test Discussion',
    content: 'This is a test discussion post content.',
    type: 'discussion',
  };

  try {
    console.log('📝 Creating post with data:', JSON.stringify(minimalPost, null, 2));

    const response = await axios.post('http://localhost:3001/api/posts', minimalPost, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Post created successfully:', response.data);
  } catch (error) {
    console.log('❌ Error creating post:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testPostWithValidUser();
