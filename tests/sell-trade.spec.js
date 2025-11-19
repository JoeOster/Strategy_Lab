// tests/sell-trade.spec.js
import { expect, test } from "@playwright/test";

test.describe("Sell Trade Functionality", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the base URL of the application
		await page.goto("http://localhost:8080");

		// Click on the "Strategy Lab" navigation button
		await page.click('.main-nav .nav-btn[data-tab="strategy-lab"]');

		// Wait for the Strategy Lab content to load
		await page.waitForSelector("#strategy-lab-page-container");

		// Click on the "Paper Trades" sub-tab
		await page.click('.sub-nav-btn[data-sub-tab="paper-trades-panel"]');

		// Wait for the paper trades table to be visible
		await page.waitForSelector("#new-paper-trades-table table");
	});

	test("should successfully sell an open trade", async ({ page }) => {
		// Find the first "Sell" button for an open trade
		// Assuming 'real-sell-btn' is for real trades and 'paper-trades-table' contains them
		const sellButton = page
			.locator("#new-paper-trades-table .real-sell-btn")
			.first();
		await expect(sellButton).toBeVisible();

		// Click the sell button
		await sellButton.click();

		// Wait for the sell trade modal to appear
		const sellTradeModal = page.locator("#sell-trade-modal");
		await expect(sellTradeModal).toBeVisible();

		// Fill out the sell form
		await sellTradeModal.locator("#sell-quantity").fill("5"); // Sell 5 units
		await sellTradeModal.locator("#sell-price").fill("110.00"); // Sell at 110.00

		// Click the confirm sell button
		await sellTradeModal.locator("#confirm-sell-btn").click();

		// Expect a success alert
		await expect(page.locator("text=Trade sold successfully!")).toBeVisible();

		// Close the alert
		await page.locator("text=Trade sold successfully!").click(); // Assuming clicking closes it

		// Verify the trade is no longer in the open trades table or its quantity is updated
		// This part might need adjustment based on how the UI updates after a sell
		// For now, let's assume the trade is removed or its status changes.
		// A more robust check would involve checking the database or a specific UI element.
		// For demonstration, let's check if the original sell button is gone or the row is updated.
		// This might require re-fetching the table content or checking for a specific row.
		// For now, we'll just check if the modal is gone.
		await expect(sellTradeModal).not.toBeVisible();
	});

	test("should show an error if selling more than available quantity", async ({
		page,
	}) => {
		// Find the first "Sell" button for an open trade
		const sellButton = page
			.locator("#new-paper-trades-table .real-sell-btn")
			.first();
		await expect(sellButton).toBeVisible();

		// Click the sell button
		await sellButton.click();

		// Wait for the sell trade modal to appear
		const sellTradeModal = page.locator("#sell-trade-modal");
		await expect(sellTradeModal).toBeVisible();

		// Get the initial quantity from the trade details in the modal
		const initialQuantityText = await sellTradeModal
			.locator('#sell-trade-details strong:has-text("Quantity:") + *')
			.textContent();
		const initialQuantity = Number.parseFloat(initialQuantityText || "0");

		// Attempt to sell more than available
		await sellTradeModal
			.locator("#sell-quantity")
			.fill(String(initialQuantity + 1));
		await sellTradeModal.locator("#sell-price").fill("110.00");

		// Click the confirm sell button
		await sellTradeModal.locator("#confirm-sell-btn").click();

		// Expect an error alert
		await expect(
			page.locator("text=Failed to sell trade. See console for details."),
		).toBeVisible();

		// Close the alert
		await page
			.locator("text=Failed to sell trade. See console for details.")
			.click();

		// Ensure the modal is still visible or closed, depending on error handling
		await expect(sellTradeModal).toBeVisible(); // Assuming modal stays open on error
	});
});
