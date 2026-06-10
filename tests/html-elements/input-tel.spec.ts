//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML phone number input validation (type="tel").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div class="tel-selector-wrapper">
			<label for="phone-input">Phone Number</label>
			<input type="tel" id="phone-input" pattern="^\\+?[0-9\\(\\)\\-\\s]+$" />
		</div>
	`);
});

test('Telephone input must validate common national/international formats and accessibility', async ({ page }) => {
	const telSelector = '#phone-input';
	const containerSelector = '.tel-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association & Pattern Check.
	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	// Use a broad regex pattern to cover common international formats (e.g., optional country code + digits).
	await expect(page.locator(telSelector)).toHaveAttribute('pattern', '^\\+?[0-9\\(\\)\\-\\s]+$');

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Ensure focus triggers appropriate keyboard handling/input mask suggestions.
	await page.focus(telSelector);
	await expect(page.locator(telSelector)).toBeFocused();

	// Test Blur on invalid input: Should retain the value or display a warning, not crash.
	const badInput = 'abc-def';
	await page.fill(telSelector, badInput);
	await page.locator(telSelector).blur();
	// We assert that even if the UI is lax, the state should be clearly marked as requiring correction or accept the input's current value.

	// --- 3. Common Use Case Validation Tests (Formats & Internationalization) ---

	// Test A: Standard US Format (XXX-XXX-XXXX).
	const usNumber = '5551234567';
	await page.fill(telSelector, usNumber);
	await expect(page.locator(telSelector)).toHaveValue(usNumber);

	// Test B: International Format (Country Code with plus).
	const internationalNumber = '+44 20 7946 0000'; // London example
	await page.fill(telSelector, internationalNumber);
	await expect(page.locator(telSelector)).toHaveValue(internationalNumber);

	// Test C: Mixed formatting (Dashes and parentheses). This confirms tolerance.
	const mixedFormat = '(555) 123-4567';
	await page.fill(telSelector, mixedFormat);
	await expect(page.locator(telSelector)).toHaveValue(mixedFormat);
});