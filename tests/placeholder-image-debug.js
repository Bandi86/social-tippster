// Check for posts with placeholder URLs that might cause 500 errors
import { chromium } from 'playwright';

async function checkPlaceholderImages() {
  console.log('🔍 Checking for placeholder image URLs in posts...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const imageErrors = [];
  let requestCounter = 0;

  // Track image requests specifically for placeholder URLs
  page.on('response', async response => {
    requestCounter++;
    const url = response.url();
    const status = response.status();

    // Focus on placeholder or external image requests
    if (url.includes('via.placeholder.com') || url.includes('_next/image?url=')) {
      console.log(`🖼️  Image request #${requestCounter}: ${status} ${url}`);

      if (status >= 400) {
        console.log(`   ❌ Image error: ${status} ${url}`);
        imageErrors.push({ url, status, counter: requestCounter });
      }
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('placeholder') || request.url().includes('_next/image')) {
      console.log(`❌ Image Request Failed: ${request.url()}`);
      console.log(`   Error: ${request.failure()?.errorText}`);
    }
  });

  try {
    console.log('📄 Loading posts to check for placeholder images...');
    await page.goto('http://localhost:3000/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Wait longer to catch all image loads

    console.log('📄 Loading main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Try to navigate through multiple pages to trigger all image loads
    console.log('📄 Loading individual post pages...');

    // Look for post links and try to visit them
    const postLinks = await page.locator('a[href*="/posts/"]').all();
    console.log(`Found ${postLinks.length} post links`);

    for (let i = 0; i < Math.min(3, postLinks.length); i++) {
      try {
        const href = await postLinks[i].getAttribute('href');
        if (href && href.includes('/posts/')) {
          console.log(`🔗 Visiting: ${href}`);
          await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(3000);
        }
      } catch (e) {
        console.log(`Could not visit post link: ${e.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }

  console.log('\n📊 PLACEHOLDER IMAGE ANALYSIS:');
  console.log(`Total image errors: ${imageErrors.length}`);

  if (imageErrors.length > 0) {
    console.log('\n🚨 Image Error Details:');
    imageErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.status} - ${error.url}`);
    });

    console.log('\n💡 SOLUTION RECOMMENDATIONS:');
    console.log('1. Replace via.placeholder.com URLs with local placeholder images');
    console.log('2. Remove test posts containing external placeholder URLs');
    console.log('3. Use local uploads for test data instead of external placeholder services');
  } else {
    console.log('✅ No placeholder image errors detected!');
  }

  await browser.close();
}

checkPlaceholderImages().catch(console.error);
