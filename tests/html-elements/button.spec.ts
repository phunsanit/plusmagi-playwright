"//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML button element validation (type="button").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
 */
test('Button must execute specified JavaScript actions without interfering with form submission flow', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/dashboard');
	const actionButtonSelector = '#action-trigger';
	const statusDisplaySelector = '#status-display';

	// --- 1. Structural Distinction Test ---

	// Test: Type Identification. The button MUST be identifiable as type="button" to prevent accidental submission.
	await expect(page.locator(actionButtonSelector)).toHaveAttribute('type', 'button');


	// --- 2. Event Validation Checks (JavaScript Interaction) ---

	// Test: Execution of custom JS logic upon click.
	await page.click(actionButtonSelector);
	// Verify the specific, non-form related action happens.
	await expect(page.locator(statusDisplaySelector)).toHaveText('Custom JavaScript executed successfully!');


	// --- 3. Common Use Case Validation Tests (Submission Isolation) ---

	// Test A: Non-Interference with Form Data.
	const formData = { name: 'InitialName', email: 'init@test.com' };
	await page.fill('#form-username', formData.name); // Fill form data before button click.

	// Action: Click the custom button instead of submit.
	await page.click(actionButtonSelector);

	// Assertion 1: The status message confirms the JS action.
	await expect(page.locator(statusDisplaySelector)).toHaveText('Custom JavaScript executed successfully!');

	// Assertion 2: Crucially, the form data MUST remain untouched after a button click that is NOT type="submit".
	const remainingName = await page.inputValue('#form-username');
	expect(remainingName).toBe(formData.name); // The username should persist.
});"
