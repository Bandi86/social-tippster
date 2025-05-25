// Manual test for the registration flow
// This should be used from the browser console

async function testRegistration() {
  const testData = {
    name: 'Test Frontend User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    confirmPassword: 'password123',
  };

  try {
    console.log('Testing registration with:', testData);

    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testData.email.split('@')[0],
        email: testData.email,
        password: testData.password,
        first_name: testData.name.split(' ')[0],
        last_name: testData.name.split(' ').slice(1).join(' '),
      }),
    });

    const result = await response.json();
    console.log('Registration result:', result);

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Access token:', result.accessToken);
    } else {
      console.log('❌ Registration failed:', result);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
}

// Run the test
testRegistration();
