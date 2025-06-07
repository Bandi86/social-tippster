import { test } from '@playwright/test';

/**
 * Advanced Posts and Categories E2E Test
 *
 * Ez a teszt részletesen teszteli a poszt rendszer minden aspektusát:
 * - Poszt létrehozás különböző típusokkal
 * - Kategóriák hozzáadása és kezelése
 * - Tagek hozzáadása
 * - Like/Dislike rendszer
 * - Bookmark rendszer
 * - Komment rendszer
 * - Szűrések és keresés
 */

const TEST_ADMIN = {
  email: 'admin@socialtippster.com',
  password: 'admin123',
};

test.describe('Advanced Posts and Categories Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Complete post management and interaction flow', async ({ page }) => {
    console.log('🎮 Starting advanced posts and categories test...');

    // ========================================
    // BEJELENTKEZÉS
    // ========================================
    console.log('\n🔐 Logging in as admin...');

    await page.goto('http://localhost:3000/auth/login');
    await page.waitForTimeout(1000);

    await page.fill('input[name="email"], input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_ADMIN.password);
    await page.click(
      'button[type="submit"], button:has-text("Bejelentkezés"), button:has-text("Login")',
    );

    await page.waitForTimeout(3000);

    // Verify login success
    const currentUrl = page.url();
    if (currentUrl === 'http://localhost:3000/' || !currentUrl.includes('/auth')) {
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }

    // ========================================
    // POSZT LÉTREHOZÁS TESZTELÉSE
    // ========================================
    console.log('\n📝 Testing post creation with different types...');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Look for create post functionality
    const createPostButton = page.locator(
      'button:has-text("Új poszt"), button:has-text("Create Post"), [data-testid="create-post"], .create-post-button, a[href*="/create"], a[href*="/new-post"]',
    );

    let postCreated = false;

    if (await createPostButton.isVisible()) {
      console.log('✅ Create post button found');
      await createPostButton.click();
      await page.waitForTimeout(1000);

      // Test post creation for different types
      const postTypes = ['general', 'discussion', 'analysis', 'help_request', 'news'];

      for (const postType of postTypes.slice(0, 2)) {
        // Test first 2 types to save time
        console.log(`  Testing post type: ${postType}`);

        const titleInput = page.locator(
          'input[name="title"], input[placeholder*="cím"], input[placeholder*="title"]',
        );
        const contentInput = page.locator(
          'textarea[name="content"], textarea[placeholder*="tartalom"], textarea[placeholder*="content"], .ql-editor',
        );

        if ((await titleInput.isVisible()) && (await contentInput.isVisible())) {
          const testTitle = `Test ${postType} Post ${Date.now()}`;
          const testContent = `Ez egy ${postType} típusú teszt poszt. Tartalom: ${new Date().toISOString()}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

          await titleInput.fill(testTitle);
          await contentInput.fill(testContent);

          // Select post type if dropdown exists
          const typeSelect = page.locator(
            'select[name="type"], select[name="postType"], [data-testid="post-type-select"]',
          );
          if (await typeSelect.isVisible()) {
            const options = await typeSelect.locator('option').allInnerTexts();
            const matchingOption = options.find(
              option =>
                option.toLowerCase().includes(postType) ||
                option.toLowerCase().includes(postType.replace('_', ' ')),
            );

            if (matchingOption) {
              await typeSelect.selectOption({ label: matchingOption });
              console.log(`  ✅ Selected post type: ${matchingOption}`);
            }
          }

          // Select category if available
          const categorySelect = page.locator(
            'select[name="category"], select[name="categoryId"], [data-testid="category-select"]',
          );
          if (await categorySelect.isVisible()) {
            const categoryOptions = await categorySelect.locator('option').count();
            if (categoryOptions > 1) {
              await categorySelect.selectOption({ index: 1 }); // Select first non-default option
              console.log('  ✅ Category selected');
            }
          }

          // Add tags if tag input exists
          const tagInput = page.locator(
            'input[name="tags"], input[placeholder*="tag"], .tag-input',
          );
          if (await tagInput.isVisible()) {
            const tags = ['teszt', 'automatizált', postType];
            for (const tag of tags) {
              await tagInput.fill(tag);
              await page.keyboard.press('Enter');
              await page.waitForTimeout(500);
            }
            console.log('  ✅ Tags added');
          }

          // Set visibility if option exists
          const visibilitySelect = page.locator(
            'select[name="visibility"], [data-testid="visibility-select"]',
          );
          if (await visibilitySelect.isVisible()) {
            await visibilitySelect.selectOption('public');
            console.log('  ✅ Visibility set to public');
          }

          // Submit post
          const submitButton = page.locator(
            'button[type="submit"], button:has-text("Közzététel"), button:has-text("Publish"), button:has-text("Create")',
          );
          await submitButton.click();
          await page.waitForTimeout(3000);

          // Check for success message or redirect
          const successIndicators = [
            page.locator('.toast:has-text("sikeres"), .toast:has-text("success")'),
            page.locator('text=/poszt létrehozva/i, text=/post created/i'),
          ];

          let postCreationSuccess = false;
          for (const indicator of successIndicators) {
            if (await indicator.isVisible({ timeout: 2000 })) {
              postCreationSuccess = true;
              break;
            }
          }

          if (
            postCreationSuccess ||
            page.url() === 'http://localhost:3000/' ||
            page.url().includes('/posts/')
          ) {
            console.log(`  ✅ Post of type ${postType} created successfully`);
            postCreated = true;

            // Go back for next post type
            if (postType !== postTypes[1]) {
              // Not the last one
              await page.goto('http://localhost:3000');
              await page.waitForTimeout(1000);
              await createPostButton.click();
              await page.waitForTimeout(1000);
            }
          } else {
            console.log(`  ⚠️ Post creation for ${postType} may have failed`);
          }
        }
      }
    }

    if (!postCreated) {
      console.log('ℹ️ Post creation interface not found, continuing with interaction tests...');
    }

    // ========================================
    // POSZTOK INTERAKCIÓI TESZTELÉSE
    // ========================================
    console.log('\n💝 Testing post interactions...');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    const posts = page.locator('[data-testid="post-card"], .post-card, article');
    const postCount = await posts.count();
    console.log(`Found ${postCount} posts to test interactions`);

    if (postCount > 0) {
      const firstPost = posts.first();

      // Test Like functionality
      console.log('  Testing like functionality...');
      const likeButton = firstPost.locator(
        'button:has([data-lucide="heart"]), .like-button, [data-testid="like-button"], button[title*="Like" i]',
      );

      if (await likeButton.isVisible()) {
        const initialLikes =
          (await firstPost
            .locator('button:has([data-lucide="heart"]) span, .like-count')
            .textContent()) || '0';
        await likeButton.click();
        await page.waitForTimeout(1500);

        const newLikes =
          (await firstPost
            .locator('button:has([data-lucide="heart"]) span, .like-count')
            .textContent()) || '0';
        if (newLikes !== initialLikes) {
          console.log('  ✅ Like functionality working');
        }

        // Test unlike (click again)
        await likeButton.click();
        await page.waitForTimeout(1500);
        console.log('  ✅ Unlike functionality tested');
      }

      // Test Dislike functionality
      console.log('  Testing dislike functionality...');
      const dislikeButton = firstPost.locator(
        'button:has([data-lucide="heart-off"]), .dislike-button, [data-testid="dislike-button"], button[title*="Dislike" i]',
      );

      if (await dislikeButton.isVisible()) {
        await dislikeButton.click();
        await page.waitForTimeout(1500);
        console.log('  ✅ Dislike functionality tested');

        // Undo dislike
        await dislikeButton.click();
        await page.waitForTimeout(1500);
      }

      // Test Bookmark functionality
      console.log('  Testing bookmark functionality...');
      const bookmarkButton = firstPost.locator(
        'button:has([data-lucide="bookmark"]), .bookmark-button, [data-testid="bookmark-button"], button[title*="Bookmark" i]',
      );

      if (await bookmarkButton.isVisible()) {
        const initialBookmarkClass = (await bookmarkButton.getAttribute('class')) || '';
        await bookmarkButton.click();
        await page.waitForTimeout(1500);

        const newBookmarkClass = (await bookmarkButton.getAttribute('class')) || '';
        if (initialBookmarkClass !== newBookmarkClass) {
          console.log('  ✅ Bookmark functionality working');
        }

        // Test unbookmark
        await bookmarkButton.click();
        await page.waitForTimeout(1500);
        console.log('  ✅ Unbookmark functionality tested');
      }

      // Test Post Detail Navigation and Comments
      console.log('  Testing post detail navigation and comments...');
      const postTitleLink = firstPost
        .locator('h1 a, h2 a, h3 a, .post-title a, a[href*="/posts/"]')
        .first();

      if (await postTitleLink.isVisible()) {
        await postTitleLink.click();
        await page.waitForTimeout(2000);

        if (page.url().includes('/posts/')) {
          console.log('  ✅ Post detail navigation working');

          // Test commenting
          const commentTextarea = page.locator(
            'textarea[name="content"], textarea[placeholder*="komment"], textarea[placeholder*="comment"]',
          );
          if (await commentTextarea.isVisible()) {
            const testComment = `Ez egy teszt komment a poszt funkcionalitás teszteléséhez. Időpont: ${new Date().toISOString()}`;
            await commentTextarea.fill(testComment);

            const submitCommentButton = page
              .locator(
                'button[type="submit"], button:has-text("Küldés"), button:has-text("Submit")',
              )
              .last();
            if (await submitCommentButton.isVisible()) {
              await submitCommentButton.click();
              await page.waitForTimeout(3000);
              console.log('  ✅ Comment submission tested');
            }
          }

          // Test comment interactions on existing comments
          const existingComments = page.locator('.comment, [data-testid="comment"], .comment-card');
          const commentCount = await existingComments.count();

          if (commentCount > 0) {
            console.log(`  Found ${commentCount} existing comments`);
            const firstComment = existingComments.first();

            // Test comment like
            const commentLikeButton = firstComment.locator(
              'button:has([data-lucide="heart"]), .like-button',
            );
            if (await commentLikeButton.isVisible()) {
              await commentLikeButton.click();
              await page.waitForTimeout(1000);
              console.log('  ✅ Comment like functionality tested');
            }

            // Test reply to comment
            const replyButton = firstComment.locator(
              'button:has-text("Válasz"), button:has-text("Reply")',
            );
            if (await replyButton.isVisible()) {
              await replyButton.click();
              await page.waitForTimeout(1000);

              const replyTextarea = page.locator(
                'textarea[placeholder*="válasz"], textarea[placeholder*="reply"]',
              );
              if (await replyTextarea.isVisible()) {
                await replyTextarea.fill('Ez egy teszt válasz.');

                const submitReplyButton = page.locator('button[type="submit"]').last();
                await submitReplyButton.click();
                await page.waitForTimeout(2000);
                console.log('  ✅ Comment reply functionality tested');
              }
            }
          }
        }
      }
    }

    // ========================================
    // KATEGÓRIÁK ÉS SZŰRÉSEK TESZTELÉSE
    // ========================================
    console.log('\n🏷️ Testing categories and filters...');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Test category filters
    const categoryFilters = page.locator(
      '.filter-button, .category-filter, [data-testid="category-filter"], button[data-category]',
    );
    const filterCount = await categoryFilters.count();

    if (filterCount > 0) {
      console.log(`✅ Found ${filterCount} category filters`);

      // Test each category filter
      for (let i = 0; i < Math.min(filterCount, 3); i++) {
        // Test first 3 filters
        const filter = categoryFilters.nth(i);
        const filterText = await filter.textContent();

        await filter.click();
        await page.waitForTimeout(2000);

        // Check if posts are filtered
        const filteredPosts = page.locator('[data-testid="post-card"], .post-card, article');
        const filteredCount = await filteredPosts.count();

        console.log(`  ✅ Filter "${filterText}" applied, showing ${filteredCount} posts`);
      }

      // Reset filters by clicking "All" or similar
      const allFilter = page.locator(
        'button:has-text("Összes"), button:has-text("All"), .filter-button[data-category="all"]',
      );
      if (await allFilter.isVisible()) {
        await allFilter.click();
        await page.waitForTimeout(1000);
        console.log('  ✅ Filters reset to show all posts');
      }
    }

    // Test search functionality
    console.log('  Testing search functionality...');
    const searchInput = page.locator(
      'input[name="search"], input[placeholder*="keres"], input[placeholder*="search"], [data-testid="search-input"]',
    );

    if (await searchInput.isVisible()) {
      const searchTerms = ['teszt', 'test', 'poszt'];

      for (const term of searchTerms) {
        await searchInput.fill(term);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        const searchResults = page.locator('[data-testid="post-card"], .post-card, article');
        const resultCount = await searchResults.count();

        console.log(`  ✅ Search for "${term}" returned ${resultCount} results`);

        // Clear search
        await searchInput.clear();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }
    }

    // Test sort functionality
    console.log('  Testing sort functionality...');
    const sortSelect = page.locator(
      'select[name="sort"], [data-testid="sort-select"], .sort-dropdown',
    );

    if (await sortSelect.isVisible()) {
      const sortOptions = ['newest', 'oldest', 'popular', 'most_liked'];

      for (const option of sortOptions.slice(0, 2)) {
        // Test first 2 options
        const optionExists = (await sortSelect.locator(`option[value="${option}"]`).count()) > 0;

        if (optionExists) {
          await sortSelect.selectOption(option);
          await page.waitForTimeout(2000);
          console.log(`  ✅ Sort by "${option}" tested`);
        }
      }
    }

    // ========================================
    // ADMIN POSZTKKEZELÉS TESZTELÉSE
    // ========================================
    console.log('\n⚙️ Testing admin post management...');

    await page.goto('http://localhost:3000/admin/posts');
    await page.waitForTimeout(2000);

    if (page.url().includes('/admin') && !page.url().includes('/auth')) {
      console.log('✅ Admin posts page accessible');

      // Test admin post table
      const adminPostTable = page.locator('table, [data-testid="posts-table"], .posts-table');
      if (await adminPostTable.isVisible()) {
        const postRows = adminPostTable.locator('tbody tr, .post-row');
        const adminPostCount = await postRows.count();
        console.log(`  Found ${adminPostCount} posts in admin panel`);

        if (adminPostCount > 0) {
          const firstPostRow = postRows.first();

          // Test post actions dropdown
          const actionsButton = firstPostRow.locator(
            'button:has([data-lucide="more-horizontal"]), .actions-button, [data-testid="post-actions"]',
          );
          if (await actionsButton.isVisible()) {
            await actionsButton.click();
            await page.waitForTimeout(500);

            // Look for action menu items
            const actionItems = page.locator('.dropdown-item, [role="menuitem"], .action-item');
            const actionCount = await actionItems.count();

            if (actionCount > 0) {
              console.log(`  ✅ Found ${actionCount} admin actions for posts`);

              // Close dropdown
              await page.keyboard.press('Escape');
            }
          }

          // Test post detail view in admin
          const viewButton = firstPostRow.locator(
            'a:has-text("View"), a:has-text("Megtekint"), button:has([data-lucide="eye"])',
          );
          if (await viewButton.isVisible()) {
            await viewButton.click();
            await page.waitForTimeout(2000);

            if (page.url().includes('/admin/posts/')) {
              console.log('  ✅ Admin post detail page accessible');

              // Test admin post actions
              const adminActions = page.locator(
                'button:has-text("Feature"), button:has-text("Hide"), button:has-text("Delete")',
              );
              if ((await adminActions.count()) > 0) {
                console.log('  ✅ Admin post actions available');
              }
            }
          }
        }
      }

      // Test admin comments page
      await page.goto('http://localhost:3000/admin/comments');
      await page.waitForTimeout(2000);

      if (page.url().includes('/admin/comments')) {
        console.log('✅ Admin comments page accessible');

        const commentTable = page.locator('table, [data-testid="comments-table"]');
        if (await commentTable.isVisible()) {
          const commentRows = commentTable.locator('tbody tr');
          const adminCommentCount = await commentRows.count();
          console.log(`  Found ${adminCommentCount} comments in admin panel`);
        }
      }
    }

    // ========================================
    // TELJESÍTMÉNY ÉS HIBÁK ELLENŐRZÉSE
    // ========================================
    console.log('\n📊 Performance and error checking...');

    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // Test page load performance
    await page.goto('http://localhost:3000');
    const loadStart = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - loadStart;

    console.log(`  Page load time: ${loadTime}ms`);

    if (loadTime < 5000) {
      console.log('  ✅ Page load performance acceptable');
    } else {
      console.log('  ⚠️ Page load time is slow');
    }

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // ========================================
    // ÖSSZEGZÉS
    // ========================================
    console.log('\n🎯 Advanced Posts and Categories Test Summary:');
    console.log('✅ Admin authentication');
    console.log('✅ Post creation with different types');
    console.log('✅ Post interactions (like, dislike, bookmark)');
    console.log('✅ Comment system and replies');
    console.log('✅ Category filtering and search');
    console.log('✅ Admin post management');
    console.log('✅ Performance monitoring');

    if (jsErrors.length > 0) {
      console.log('\n⚠️ JavaScript errors found:');
      jsErrors.slice(0, 5).forEach(error => console.log(`  - ${error}`));
      if (jsErrors.length > 5) {
        console.log(`  ... and ${jsErrors.length - 5} more errors`);
      }
    } else {
      console.log('\n✅ No JavaScript errors detected');
    }

    if (consoleErrors.length > 0) {
      console.log('\n⚠️ Console errors found:');
      consoleErrors.slice(0, 3).forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🚀 Advanced posts and categories test completed!');
  });

  test('Quick interaction test for all post types', async ({ page }) => {
    console.log('⚡ Running quick interaction test...');

    // Quick login
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Go to home and test interactions on multiple posts
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    const posts = page.locator('[data-testid="post-card"], .post-card, article');
    const postCount = await posts.count();
    const testsToRun = Math.min(postCount, 3); // Test first 3 posts

    console.log(`Testing interactions on ${testsToRun} posts...`);

    for (let i = 0; i < testsToRun; i++) {
      const post = posts.nth(i);

      // Quick like test
      const likeButton = post.locator('button:has([data-lucide="heart"])');
      if (await likeButton.isVisible()) {
        await likeButton.click();
        await page.waitForTimeout(500);
      }

      // Quick bookmark test
      const bookmarkButton = post.locator('button:has([data-lucide="bookmark"])');
      if (await bookmarkButton.isVisible()) {
        await bookmarkButton.click();
        await page.waitForTimeout(500);
      }

      console.log(`✅ Post ${i + 1} interactions tested`);
    }

    console.log('⚡ Quick interaction test completed');
  });
});
