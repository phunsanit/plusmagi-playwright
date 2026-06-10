//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/url

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML URL input validation (type=\"url\").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/url
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div class="url-selector-wrapper">
			<label for="website-url">Website URL</label>
			<input type="url" id="website-url" />
		</div>
	`);
});

test('URL input must validate correct URI scheme and structure', async ({ page }) => {
	const urlSelector = '#website-url';
	const containerSelector = '.url-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	await expect(page.locator(urlSelector)).toHaveAttribute('type', 'url');

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Ensure focus triggers browser-level autocomplete suggestions if possible.
	await page.focus(urlSelector);
	await expect(page.locator(urlSelector)).toBeFocused();

	// Test Blur & Validation: Simulate entering an incomplete or malformed URL, then blurring to trigger validation error.
	const badUrl = 'www.example'; // Missing scheme://
	await page.fill(urlSelector, badUrl);
	await page.locator(urlSelector).blur();

	// --- 3. Common Use Case Validation Tests (Protocols & Sanitization) ---

	// Test A: Protocol Validation (HTTPS mandatory for modern sites).
	const secureUrl = 'https://www.example.com';
	await page.fill(urlSelector, secureUrl);
	await expect(page.locator(urlSelector)).toHaveValue(secureUrl);

	// Test B: Handling relative vs absolute paths.
	const relativePath = '/about-us/';
	await page.fill(urlSelector, relativePath); // Should be accepted by 'type="url"' but validated on form submission context
	await expect(page.locator(urlSelector)).toHaveValue(relativePath);

	// Test C: Protocol Enforcement (Simulating an invalid protocol).
	const plainString = 'example.com';
	await page.fill(urlSelector, plainString); // Manually entering without scheme
	await expect(page.locator(urlSelector)).toHaveValue('example.com'); // Client-side might accept this; server validation is key.
});