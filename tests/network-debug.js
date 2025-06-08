// Network debugging script to identify 500 errors
import { chromium } from 'playwright';

async function debugNetworkErrors() {
  console.log('🔍 Starting network debugging for 500 errors...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Track network requests
  const serverErrors = [];

  page.on('response', async response => {
    if (response.status() >= 500) {
      const url = response.url();
      const status = response.status();
      const statusText = response.statusText();

      serverErrors.push({ url, status, statusText });
      console.log(`🚨 Server Error ${status}: ${url}`);

      try {
        const responseBody = await response.text();
        console.log(`   Response: ${responseBody.substring(0, 200)}...`);
      } catch (e) {
        console.log(`   Could not read response body`);
      }
    }
  });

  page.on('requestfailed', request => {
    console.log(`❌ Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('📄 Testing main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📄 Testing posts page...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📄 Testing profile page...');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }

  await browser.close();

  console.log('\n📊 SERVER ERROR SUMMARY:');
  if (serverErrors.length === 0) {
    console.log('✅ No server errors detected!');
  } else {
    console.log(`❌ Found ${serverErrors.length} server errors:`);
    serverErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.status} ${error.statusText}: ${error.url}`);
    });
  }

  return serverErrors;
}

debugNetworkErrors()
  .then(errors => {
    process.exit(errors.length === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
