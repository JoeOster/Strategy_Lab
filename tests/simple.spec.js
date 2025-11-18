// tests/simple.spec.js
import { expect, test } from '@playwright/test';

test('simple test', async ({ page }) => {
  page.on('console', (msg) => {
    console.log(`Browser console: ${msg.type()} ${msg.text()}`);
  });
  await page.goto('http://localhost:8080');
  await page.evaluate(() => console.log('Hello from the browser!'));
  await expect(page).toHaveTitle(/Strategy Lab/);
});
