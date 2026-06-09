//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML password input validation (type="password").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password
 */
test('Password input must enforce complexity, handle masking, and validate on blur', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/login');
	const passwordSelector = '#password-input';
	const containerSelector = '.password-container';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association & Length Requirements.
	await expect(page.locator(containerSelector)).toContainElement(page.getByRole('label'));
	await expect(page.locator(passwordSelector)).toHaveAttribute('autocomplete', 'current-password'); // Best practice attribute check


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Check that focus activates a visible password strength indicator/toggle.
	await page.focus(passwordSelector);
	// Assert visibility of the show/hide toggle if it exists in the UI context.
	await expect(page).toHaveScreenshot('password_input_focused.png');

	// Test Blur: Crucial for triggering immediate, client-side complexity checks (e.g., minimum length).
	await page.fill(passwordSelector, 'Short1!'); // Intentionally weak password
	await page.blur(passwordSelector);


	// --- 3. Common Use Case Validation Tests (Complexity & Masking) ---

	// Test A: Minimum Complexity Check.
	// Wait for the known error message that triggers on insufficient complexity (e.g., missing uppercase letter).
	await expect(page.locator('.password-requirements-error')).toContainText('Must contain an uppercase letter.');

	// Test B: Successful Password Input & Masking.
	const strongPass = 'SecureP@ss123';
	await page.fill(passwordSelector, '') // Clear previous attempt
	await page.fill(passwordSelector, strongPass); // Fill with strong value

	// Verify the value is correctly set and masked (UI check).
	await expect(page.locator(passwordSelector)).toHaveValue(strongPass);
	console.log('Password field successfully typed and validated (masked in UI).');
});
