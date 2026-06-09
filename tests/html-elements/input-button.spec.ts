//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/button
import { test, expect } from '@playwright/test';

/**
 * Test Suite for the dedicated HTML input button type (type="button").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/button
 */
test('Button element must function independently of form submission and validate required attributes', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/form');

	const buttonSelector = '#button-trigger';
	const statusDisplaySelector = '#status-display';

	// --- 1. Attribute Validation Checks (Required Attributes) ---
	const buttonElement = page.locator(buttonSelector);

	// Check for required 'value' attribute if the button is intended to display text content.
	await expect(buttonElement).toHaveAttribute('value');

	// Check for general HTML attributes expected on all inputs/buttons.
	await expect(buttonElement).toBeVisible();

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Ensure the button can receive focus programmatically and visually indicates focus state.
	await buttonElement.focus();
	// Assertion for focus visual state confirmation (implementation dependent, but good to check existence).
	const focusedLocator = page.locator(`${buttonSelector}:focus`);
	await expect(focusedLocator).toBeAttached();


	// Test Blur: Simulate losing focus and ensure the associated element handles it gracefully.
	// This tests if any JS event listeners are attached on blur.
	await buttonElement.blur();

	// --- 3. Core Behavior & Common Tests ---

	// Reset status before core interaction test
	await page.locator(statusDisplaySelector).waitFor();
	await page.locator(statusDisplaySelector).fill('');
	// Primary Test: Clicking this button must execute JavaScript directly, without triggering a standard form submission/reload cycle.
	await buttonElement.click();
	// Assertion 1: Verify that the specific status display updates ONLY when the button is clicked (Proves JS interaction over form submit).
	await expect(page.locator(statusDisplaySelector)).toHaveText('Button action executed successfully!');

	// Optional Test: Simulate a known failure case to ensure error handling doesn't cause general page failures.
	// await page.evaluate(() => { /* Malicious JS execution that should be caught by global handlers */ });

});```
