# Test info

- Name: Comment System - Zustand Migration >> should display comment form and list when authenticated
- Location: C:\Users\bandi\Documents\code\social-tippster\social-tippster\tests\comment-system-zustand-test.spec.ts:9:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at C:\Users\bandi\Documents\code\social-tippster\social-tippster\tests\comment-system-zustand-test.spec.ts:6:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Comment System - Zustand Migration', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to the application
>  6 |     await page.goto('http://localhost:3000');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
   7 |   });
   8 |
   9 |   test('should display comment form and list when authenticated', async ({ page }) => {
   10 |     // First, let's login (assuming there's a login page)
   11 |     await page.click('text=Bejelentkezés', { timeout: 10000 });
   12 |
   13 |     // Fill login form (adjust selectors based on actual form)
   14 |     await page.fill('input[name="email"]', 'test@example.com');
   15 |     await page.fill('input[name="password"]', 'password123');
   16 |     await page.click('button[type="submit"]');
   17 |
   18 |     // Wait for successful login and navigation
   19 |     await page.waitForURL('http://localhost:3000', { timeout: 10000 });
   20 |
   21 |     // Navigate to a post to test comments
   22 |     await page.click('text=Posts', { timeout: 5000 });
   23 |
   24 |     // Click on first post
   25 |     const firstPost = page.locator('.post-card').first();
   26 |     await firstPost.click();
   27 |
   28 |     // Verify comment form is present
   29 |     await expect(page.locator('textarea[placeholder*="komment"]')).toBeVisible();
   30 |
   31 |     // Verify comment list section is present
   32 |     await expect(page.locator('text=Kommentek')).toBeVisible();
   33 |   });
   34 |
   35 |   test('should handle comment creation with Zustand store', async ({ page }) => {
   36 |     // This test assumes user is authenticated
   37 |     // Add authentication steps here if needed
   38 |
   39 |     const testComment = 'Test comment for Zustand migration';
   40 |
   41 |     // Find comment form
   42 |     const commentTextarea = page.locator('textarea[placeholder*="komment"]');
   43 |     await commentTextarea.fill(testComment);
   44 |
   45 |     // Submit comment
   46 |     await page.click('button[type="submit"]');
   47 |
   48 |     // Verify comment appears in the list
   49 |     await expect(page.locator(`text=${testComment}`)).toBeVisible();
   50 |
   51 |     // Verify comment contains proper structure (user info, timestamp, etc.)
   52 |     const commentCard = page.locator('.comment-card').first();
   53 |     await expect(commentCard).toBeVisible();
   54 |     await expect(commentCard.locator('.username')).toBeVisible();
   55 |     await expect(commentCard.locator('.timestamp')).toBeVisible();
   56 |   });
   57 |
   58 |   test('should handle comment voting with Zustand hooks', async ({ page }) => {
   59 |     // Assuming there are existing comments
   60 |     const firstComment = page.locator('.comment-card').first();
   61 |
   62 |     // Test upvote
   63 |     const upvoteButton = firstComment.locator('button[aria-label*="upvote"], button:has-text("❤")');
   64 |     await upvoteButton.click();
   65 |
   66 |     // Verify vote count updates
   67 |     const voteCount = firstComment.locator('.vote-count');
   68 |     await expect(voteCount).toBeVisible();
   69 |
   70 |     // Test downvote
   71 |     const downvoteButton = firstComment.locator('button[aria-label*="downvote"], button:has-text("💔")');
   72 |     await downvoteButton.click();
   73 |   });
   74 |
   75 |   test('should handle comment replies with proper nesting', async ({ page }) => {
   76 |     const parentComment = page.locator('.comment-card').first();
   77 |
   78 |     // Click reply button
   79 |     const replyButton = parentComment.locator('button:has-text("Válasz")');
   80 |     await replyButton.click();
   81 |
   82 |     // Verify reply form appears
   83 |     const replyForm = page.locator('textarea[placeholder*="Válaszolj"]');
   84 |     await expect(replyForm).toBeVisible();
   85 |
   86 |     // Fill and submit reply
   87 |     const replyText = 'This is a test reply';
   88 |     await replyForm.fill(replyText);
   89 |     await page.click('button[type="submit"]');
   90 |
   91 |     // Verify reply appears as nested comment
   92 |     const replyComment = page.locator('.comment-reply').first();
   93 |     await expect(replyComment.locator(`text=${replyText}`)).toBeVisible();
   94 |   });
   95 |
   96 |   test('should handle comment editing with Zustand state management', async ({ page }) => {
   97 |     // Find user's own comment (assuming proper auth)
   98 |     const ownComment = page.locator('.comment-card').first();
   99 |
  100 |     // Click edit option
  101 |     await ownComment.locator('button[aria-label="More options"]').click();
  102 |     await page.click('text=Szerkesztés');
  103 |
  104 |     // Verify edit form appears
  105 |     const editTextarea = page.locator('textarea');
  106 |     await expect(editTextarea).toBeVisible();
```