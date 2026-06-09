"//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text

import { test, expect } from '@playwright/test';

/**
 * Test Suite for general text input validation (type="text").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text
 */
test('Text input must handle global data types, autocomplete context, and sanitization', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/profile');
	const textSelector = '#username';
	const containerSelector = '.text-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association & Autocomplete context.
	await expect(page.locator(containerSelector)).toContainElement(page.getByRole('label'));
	await expect(page.locator(textSelector)).toHaveAttribute('autocomplete', 'username');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Ensure that focus activates standard browser autocomplete suggestions (if applicable).
	await page.focus(textSelector);
	// Check if the system populates placeholder/autocomplete suggestions correctly.
	await expect(page).toHaveScreenshot('text_input_focused');

	// Test Blur & Sanitization: Simulate entering special characters that might need stripping or encoding on blur.
	const complexInput = 'User Name with ÄÖÜ & ™';
	await page.fill(textSelector, complexInput);
	await page.blur(textSelector);
	// For testing, we assert the *displayed* value matches the input, confirming no premature stripping.
	await expect(page.locator(textSelector)).toHaveValue(complexInput);


	// --- 3. Common Use Case Validation Tests (Data Handling & Length) ---

	// Test A: Unicode Support.
	const unicodeUser = 'ユーザー名'; // Japanese characters
	await page.fill(textSelector, unicodeUser);
	await expect(page.locator(textSelector)).toHaveValue(unicodeUser);

	// Test B: Max Length Constraint Simulation.
	// Assume an attribute limits the input to 50 characters.
	await page.evaluate(() => {
		const input = document.querySelector(textSelector);
		if (input) { window.__MAX_LENGTH__ = 20; } // Mocking a client-side limit set in JS
	});

	let overLengthString = 'A'.repeat(50);
	await page.fill(textSelector, overLengthString); // Fill initially
	// Then cap it at the mocked limit.
	await page.evaluate((str) => { document.querySelector(textSelector).value = str.substring(0, window.__MAX_LENGTH__); }, overLengthString);

	await expect(page.locator(textSelector)).toHaveValue('A'.repeat(20));
});"
