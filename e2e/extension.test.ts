import { chromium, expect, test } from '@playwright/test';
import path from 'path';

// Custom matchers for Playwright
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveCSS(property: string, value: string): Promise<R>;
      toBeVisible(): Promise<R>;
    }
  }
}

test.describe('Chrome Extension E2E Tests', () => {
  test('should load extension and process social media content', async () => {
    // Launch browser with extension
    const pathToExtension = path.join(__dirname, '../dist');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });

    // Create a new page
    const page = await context.newPage();

    // Navigate to Twitter
    await page.goto('https://twitter.com');
    await page.waitForLoadState('networkidle');

    // Wait for extension to process posts
    await page.waitForSelector('.blackout-rating-overlay', { timeout: 5000 });

    // Check if ratings are displayed
    const ratings = await page.$$('.blackout-rating-overlay');
    expect(ratings.length).toBeGreaterThan(0);

    // Check if score elements are present
    const scores = await page.$$('.blackout-score');
    expect(scores.length).toBeGreaterThan(0);

    // Test popup functionality
    const extensionId = await getExtensionId(pathToExtension);
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

    // Check if popup loads correctly
    await expect(popupPage.locator('text=Hardcore Blackout')).toBeVisible();

    // Test settings interaction
    await popupPage.click('text=Open Settings');
    await expect(page).toHaveURL(new RegExp('chrome-extension://.*/options.html'));

    // Clean up
    await context.close();
  });
});

async function getExtensionId(pathToExtension: string): Promise<string> {
  // Read manifest to get extension ID
  const manifestPath = path.join(pathToExtension, 'manifest.json');
  const manifest = require(manifestPath);
  return manifest.key || 'extension-id';
}

test.describe('Content Processing Tests', () => {
  test('should correctly process and rate Twitter posts', async () => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${path.join(__dirname, '../dist')}`,
        `--load-extension=${path.join(__dirname, '../dist')}`
      ]
    });

    const page = await context.newPage();
    await page.goto('https://twitter.com');

    // Wait for posts to be processed
    await page.waitForSelector('.blackout-rating-overlay');

    // Check rating functionality
    const firstPost = await page.$('article[data-testid="tweet"]');
    if (firstPost) {
      const rating = await firstPost.$('.blackout-score');
      expect(rating).toBeTruthy();

      // Test hide/block functionality
      const hideButton = await firstPost.$('.blackout-hide');
      if (hideButton) {
        await hideButton.click();
        await expect(firstPost).toHaveCSS('opacity', '0.5');
      }
    }

    await context.close();
  });

  test('should correctly process and rate Facebook posts', async () => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${path.join(__dirname, '../dist')}`,
        `--load-extension=${path.join(__dirname, '../dist')}`
      ]
    });

    const page = await context.newPage();
    await page.goto('https://facebook.com');

    // Wait for posts to be processed
    await page.waitForSelector('.blackout-rating-overlay');

    // Check rating functionality
    const firstPost = await page.$('[role="article"]');
    if (firstPost) {
      const rating = await firstPost.$('.blackout-score');
      expect(rating).toBeTruthy();

      // Test block functionality
      const blockButton = await firstPost.$('.blackout-block');
      if (blockButton) {
        await blockButton.click();
        await expect(firstPost).not.toBeVisible();
      }
    }

    await context.close();
  });
});