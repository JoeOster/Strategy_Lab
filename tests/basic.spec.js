// tests/basic.spec.js
import { expect, test } from "@playwright/test";

test("basic test", async ({ page }) => {
	await page.goto("http://localhost:8080");
	await expect(page).toHaveTitle(/Strategy Lab/);
});
