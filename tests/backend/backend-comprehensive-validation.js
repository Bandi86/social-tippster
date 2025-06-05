// Comprehensive backend validation test for registration, login, and public endpoint access
// Covers all edge cases, language handling, and error body output
// Output error bodies to tests/backend/errors/ for easy review

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const ERRORS_DIR = path.join(__dirname, 'errors');

if (!fs.existsSync(ERRORS_DIR)) {
  fs.mkdirSync(ERRORS_DIR);
}

function writeErrorToFile(prefix, body) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${prefix}-error-${timestamp}.json`;
  const filePath = path.join(ERRORS_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8');
  return filePath;
}

function getUniqueEmail(base) {
  // Add timestamp and random string for uniqueness
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${base}+${ts}${rand}@test.com`;
}

function getUniqueUsername(base) {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${base}_${ts}_${rand}`;
}

// Store generated emails and usernames for login tests
const generatedEmails = {};
const generatedUsernames = {};

async function testRegistration() {
  console.log('\n=== Registration Tests ===');
  const testCases = [
    {
      name: 'Valid registration',
      data: {
        username: getUniqueUsername('reguser1'),
        email: getUniqueEmail('reguser1'),
        password: 'Password123!',
        first_name: 'Teszt',
        last_name: 'Felhasználó',
      },
      expectedStatus: 201,
      storeKey: 'reguser1',
    },
    {
      name: 'Missing email',
      data: {
        username: getUniqueUsername('reguser2'),
        password: 'Password123!',
        first_name: 'Teszt',
        last_name: 'Felhasználó',
      },
      expectedStatus: 400,
    },
    {
      name: 'Missing password',
      data: {
        username: getUniqueUsername('reguser3'),
        email: getUniqueEmail('reguser3'),
        first_name: 'Teszt',
        last_name: 'Felhasználó',
      },
      expectedStatus: 400,
    },
    {
      name: 'Invalid email',
      data: {
        username: getUniqueUsername('reguser4'),
        email: 'notanemail',
        password: 'Password123!',
        first_name: 'Teszt',
        last_name: 'Felhasználó',
      },
      expectedStatus: 400,
    },
    {
      name: 'Short password',
      data: {
        username: getUniqueUsername('reguser5'),
        email: getUniqueEmail('reguser5'),
        password: '123',
        first_name: 'Teszt',
        last_name: 'Felhasználó',
      },
      expectedStatus: 400,
    },
    {
      name: 'Hungarian error: missing first_name',
      data: {
        username: getUniqueUsername('reguser6'),
        email: getUniqueEmail('reguser6'),
        password: 'Password123!',
        last_name: 'Felhasználó',
      },
      expectedStatus: 400,
    },
    {
      name: 'Hungarian error: missing last_name',
      data: {
        username: getUniqueUsername('reguser7'),
        email: getUniqueEmail('reguser7'),
        password: 'Password123!',
        first_name: 'Teszt',
      },
      expectedStatus: 400,
    },
  ];

  for (const testCase of testCases) {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, testCase.data, {
        validateStatus: () => true,
      });
      if (res.status === testCase.expectedStatus) {
        console.log(`✅ ${testCase.name}: Passed (${res.status})`);
        if (testCase.storeKey && res.status === 201) {
          generatedEmails[testCase.storeKey] = testCase.data.email;
          generatedUsernames[testCase.storeKey] = testCase.data.username;
        }
      } else {
        console.log(`❌ ${testCase.name}: Expected ${testCase.expectedStatus}, got ${res.status}`);
        writeErrorToFile('registration', res.data);
      }
      // Check for Hungarian/English error messages
      if (res.status >= 400 && res.data && typeof res.data.message === 'string') {
        if (/hib|érvénytelen|hiányzik|kötelező/i.test(res.data.message)) {
          console.log('  🇭🇺 Hungarian error detected:', res.data.message);
        } else if (/invalid|required|missing|must/i.test(res.data.message)) {
          console.log('  🇬🇧 English error detected:', res.data.message);
        }
      }
    } catch (err) {
      console.log(`❌ ${testCase.name}: Exception`);
      writeErrorToFile('registration', err.response?.data || err.message);
    }
    // Add throttling delay to avoid rate limiting
    await new Promise(res => setTimeout(res, 1200));
  }
}

async function testLogin() {
  console.log('\n=== Login Tests ===');
  // Use the email generated during registration for valid login
  const validEmail = generatedEmails['reguser1'] || 'reguser1@test.com';
  const testCases = [
    {
      name: 'Valid login',
      data: { email: validEmail, password: 'Password123!' },
      expectedStatus: 201,
    },
    {
      name: 'Wrong password',
      data: { email: validEmail, password: 'WrongPass' },
      expectedStatus: 401,
    },
    {
      name: 'Nonexistent user',
      data: { email: getUniqueEmail('noone'), password: 'Password123!' },
      expectedStatus: 401,
    },
    {
      name: 'Missing email',
      data: { password: 'Password123!' },
      expectedStatus: 400,
    },
    {
      name: 'Missing password',
      data: { email: validEmail },
      expectedStatus: 400,
    },
    {
      name: 'Hungarian error: missing both',
      data: {},
      expectedStatus: 400,
    },
  ];

  for (const testCase of testCases) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, testCase.data, {
        validateStatus: () => true,
      });
      if (res.status === testCase.expectedStatus) {
        console.log(`✅ ${testCase.name}: Passed (${res.status})`);
      } else {
        console.log(`❌ ${testCase.name}: Expected ${testCase.expectedStatus}, got ${res.status}`);
        writeErrorToFile('login', res.data);
      }
      // Check for Hungarian/English error messages
      if (res.status >= 400 && res.data && typeof res.data.message === 'string') {
        if (/hib|érvénytelen|hiányzik|kötelező/i.test(res.data.message)) {
          console.log('  🇭🇺 Hungarian error detected:', res.data.message);
        } else if (/invalid|required|missing|must/i.test(res.data.message)) {
          console.log('  🇬🇧 English error detected:', res.data.message);
        }
      }
      // If login successful, check DB state via /users/me
      if (res.status === 201 && res.data.access_token) {
        const userRes = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${res.data.access_token}` },
        });
        if (userRes.data && userRes.data.email === testCase.data.email) {
          console.log('  🗄️ DB state correct for user:', userRes.data.email);
        } else {
          console.log('  ⚠️ DB state mismatch:', userRes.data);
          writeErrorToFile('db-state', userRes.data);
        }
      }
    } catch (err) {
      console.log(`❌ ${testCase.name}: Exception`);
      writeErrorToFile('login', err.response?.data || err.message);
    }
    // Add throttling delay to avoid rate limiting
    await new Promise(res => setTimeout(res, 1200));
  }
}

async function testPublicEndpoints() {
  console.log('\n=== Public Endpoint Access Tests (Unauthenticated) ===');
  // List of endpoints to check (add more as needed)
  const endpoints = [
    { url: '/posts', method: 'GET', shouldBeOpen: true },
    { url: '/posts/1', method: 'GET', shouldBeOpen: true },
    { url: '/matches/live', method: 'GET', shouldBeOpen: true },
    { url: '/comments', method: 'GET', shouldBeOpen: false },
    { url: '/users/me', method: 'GET', shouldBeOpen: false },
    { url: '/admin/users', method: 'GET', shouldBeOpen: false },
    { url: '/auth/profile', method: 'GET', shouldBeOpen: false },
    { url: '/auth/login', method: 'POST', shouldBeOpen: true },
    { url: '/auth/register', method: 'POST', shouldBeOpen: true },
  ];

  for (const ep of endpoints) {
    try {
      let res;
      if (ep.method === 'GET') {
        res = await axios.get(`${API_BASE}${ep.url}`, { validateStatus: () => true });
      } else if (ep.method === 'POST') {
        res = await axios.post(`${API_BASE}${ep.url}`, {}, { validateStatus: () => true });
      }
      if (ep.shouldBeOpen && res.status < 400) {
        console.log(`✅ ${ep.method} ${ep.url}: Open as expected (${res.status})`);
      } else if (!ep.shouldBeOpen && res.status >= 400) {
        console.log(`✅ ${ep.method} ${ep.url}: Protected as expected (${res.status})`);
      } else {
        console.log(`❌ ${ep.method} ${ep.url}: Unexpected access result (${res.status})`);
        writeErrorToFile('public-endpoint', {
          url: ep.url,
          method: ep.method,
          status: res.status,
          body: res.data,
        });
      }
    } catch (err) {
      console.log(`❌ ${ep.method} ${ep.url}: Exception`);
      writeErrorToFile('public-endpoint', err.response?.data || err.message);
    }
  }
}

async function main() {
  await testRegistration();
  await testLogin();
  await testPublicEndpoints();
  console.log('\nAll tests complete. Check tests/backend/errors/ for error bodies.');
}

if (require.main === module) {
  main();
}
