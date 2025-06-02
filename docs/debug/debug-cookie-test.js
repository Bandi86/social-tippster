// Test script to verify cookie behavior in development environment
// Run this in browser console after logging in

async function testCookieFlow() {
  console.log('=== COOKIE FLOW TEST ===');

  // Step 1: Check current cookies
  console.log('1. Current document.cookie:', document.cookie);

  // Step 2: Test login and check cookies
  console.log('2. Testing login...');
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // This is the key for cross-origin cookies
      body: JSON.stringify({
        email: 'testadmin@test.com',
        password: 'password123',
      }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('Login successful:', data);
      console.log('Set-Cookie headers:', loginResponse.headers.get('Set-Cookie'));
      console.log('Document cookies after login:', document.cookie);

      // Step 3: Test refresh endpoint
      console.log('3. Testing refresh endpoint...');
      const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This is crucial
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log('Refresh successful:', refreshData);
      } else {
        console.log('Refresh failed:', await refreshResponse.text());
      }
    } else {
      console.log('Login failed:', await loginResponse.text());
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCookieFlow();
