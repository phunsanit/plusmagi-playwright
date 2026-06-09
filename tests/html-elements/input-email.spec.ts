//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML email input validation (type=\"email\").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email
 */
test('Email input must validate standard format, mandatory attributes, and events', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/contact');
	const emailSelector = '#email-input';
	const errorSelector = '.error-message';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association (Accessibility requirement)
	await expect(page.locator('#email-label')).toBeVisible(); // Assuming label exists with id="email-label"
	const label = page.getByLabel('Email Address'); // Use getByLabel for best practice testing
	await expect(label).toHaveAttribute('for', 'email-input');

	// Test: Required placeholder/pattern check (if supported by the specific form implementation)
	await expect(page.locator(emailSelector)).toHaveAttribute('type', 'email');
	// If a pattern attribute were present, we would test it here: await expect(page.locator(emailSelector)).toHaveAttribute('pattern', '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	await page.focus(emailSelector);
	// Assert that focusing the field correctly places focus and potentially triggers client-side validation checks if present.
	await expect(page.locator(emailSelector)).toBeFocused();

	// Simulate blur: This is critical for checking when browser/library validators fire.
	await page.blur(emailSelector);


	// --- 3. Common Use Case Validation Tests (Format & State) ---

	// Test A: Invalid format detection (Missing TLD or '@')
	await page.fill(emailSelector, 'invalid_email');
	// Wait for the expected client-side error message to appear upon filling invalid data.
	await expect(errorSelector).toContainText('Please enter a valid email address.');

	// Test B: Boundary condition (No input) - Check if validation fires when empty but required.
	await page.clear(emailSelector); // Clear previous content
	await page.blur(emailSelector);
	// Assert that the "required" error appears if no value is given and the field is marked required.
	await expect(errorSelector).toContainText('Email Address is required.');


	// Test C: Success path validation (Valid format)
	const validEmail = 'user@example.com';
	await page.fill(emailSelector, validEmail);

	// Clear any previous error messages before confirming success
	await page.locator(errorSelector).waitFor({ state: 'hidden' });

	// Assertion for success path validation.
	// In a real scenario, we would check if the submission button becomes enabled here.
	// For now, we just assert the content is set and no error is visible on blur/check.
	await expect(page.locator(emailSelector)).toHaveValue(validEmail);

});
