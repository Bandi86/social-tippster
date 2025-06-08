// Interactive debugging script to catch intermittent 500 errors
import { chromium } from 'playwright';

async function interactiveErrorDebug() {
  console.log('🔍 Starting interactive 500 error debugging...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const errors500 = [];
  let requestCounter = 0;

  // Track all network activity in detail
  page.on('response', async response => {
    requestCounter++;
    const url = response.url();
    const status = response.status();

    if (status === 500) {
      console.log(`🚨 500 Error #${errors500.length + 1}: ${url}`);
      console.log(`   Request #${requestCounter} - Status: ${status}`);
      console.log(`   Time: ${new Date().toISOString()}`);

      try {
        const responseBody = await response.text();
        console.log(`   Response: ${responseBody.substring(0, 200)}`);
      } catch (e) {
        console.log(`   Could not read response body`);
      }

      errors500.push({ url, status, counter: requestCounter, timestamp: new Date() });
    }

    // Log image requests specifically
    if (
      url.includes('_next/image') ||
      url.includes('placeholder') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg')
    ) {
      console.log(`🖼️  Image request #${requestCounter}: ${status} ${url}`);
      if (status >= 400) {
        console.log(`   ❌ Image error: ${status} ${url}`);
      }
    }
  });

  page.on('requestfailed', request => {
    console.log(`❌ Request Failed: ${request.url()}`);
    console.log(`   Error: ${request.failure()?.errorText}`);
  });

  try {
    console.log('📄 Loading main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📄 Loading posts page...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('📄 Clicking on posts (if any)...');
    // Try to click on post cards to see if that triggers errors
    try {
      const postCards = await page.locator('[data-testid="post-card"], .post-card, article').all();
      console.log(`Found ${postCards.length} post elements`);

      if (postCards.length > 0) {
        console.log('🖱️  Clicking on first post...');
        await postCards[0].click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log(`Could not interact with posts: ${e.message}`);
    }

    console.log('📄 Testing navigation back to home...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('🔄 Refreshing page to test reload behavior...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }

  console.log('\n📊 FINAL ANALYSIS:');
  console.log(`Total requests: ${requestCounter}`);
  console.log(`Total 500 errors: ${errors500.length}`);

  if (errors500.length > 0) {
    console.log('\n🚨 500 Error Summary:');
    errors500.forEach((error, index) => {
      console.log(`${index + 1}. Request #${error.counter}: ${error.url}`);
      console.log(`   Time: ${error.timestamp.toISOString()}`);
    });
  } else {
    console.log('✅ No 500 errors detected in this session!');
  }

  await browser.close();
}

interactiveErrorDebug().catch(console.error);
