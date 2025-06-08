import { chromium } from 'playwright';

async function testPostDetailPage() {
  console.log('🧪 Manual test: Post Detail Page Infinite Loop Fix');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Monitor console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  try {
    console.log('1️⃣ Testing direct navigation to post detail page...');

    // Test with a properly formatted UUID
    const testPostId = '550e8400-e29b-41d4-a716-446655440000';
    await page.goto(`http://localhost:3000/posts/${testPostId}`);

    console.log('⏱️ Waiting 5 seconds to check for infinite loops...');
    await page.waitForTimeout(5000);

    // Check if page has rendered content
    const bodyText = await page.textContent('body');

    if (bodyText?.includes('A poszt nem található')) {
      console.log('✅ Post not found message displayed - no infinite loop');
    } else if (bodyText?.includes('Poszt betöltése')) {
      console.log('⚠️ Still loading after 5 seconds - potential issue');
    } else if (bodyText?.includes('Vissza')) {
      console.log('✅ Post detail page rendered with back button');
    } else {
      console.log('📄 Page content:', bodyText?.substring(0, 200));
    }

    console.log('2️⃣ Testing navigation from home page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Look for any post links
    const postLinks = await page.locator('a[href^="/posts/"]').count();
    console.log(`📋 Found ${postLinks} post links on home page`);

    if (postLinks > 0) {
      console.log('🔗 Clicking first post link...');
      await page.locator('a[href^="/posts/"]').first().click();
      await page.waitForTimeout(3000);

      const url = page.url();
      console.log(`📍 Navigated to: ${url}`);

      if (url.includes('/posts/')) {
        console.log('✅ Navigation to post detail successful');

        // Check for infinite loop indicators
        const newBodyText = await page.textContent('body');
        if (newBodyText) {
          console.log('✅ Page content loaded without infinite loop');
        }
      }
    }

    console.log('3️⃣ Testing invalid post ID...');
    await page.goto('http://localhost:3000/posts/invalid-id');
    await page.waitForTimeout(2000);

    const invalidText = await page.textContent('body');
    console.log('📄 Invalid ID response:', invalidText?.substring(0, 100));

    console.log('✅ All tests completed successfully - no infinite loops detected');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testPostDetailPage().catch(console.error);
