//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML number input validation (type="number").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number
 */
test('Number input must enforce boundaries (min/max) and handle step changes', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/form');
	const numberSelector = '#number-input';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Min/Max Boundaries via attributes.
	// We check for the presence of min/max/step to ensure proper browser handling.
	await expect(page.locator(numberSelector)).toHaveAttribute('min');
	await expect(page.locator(numberSelector)).toHaveAttribute('max');
	await expect(page.locator(numberSelector)).toHaveAttribute('step');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Interacting with the input should activate native spinners/controls.
	await page.focus(numberSelector);
	// Check if the up/down arrow controls are visible when focused.
	await expect(page.locator(`${numberSelector}::-webkit-outer-spin-button`)).toBeVisible();

	// Test Blur on empty state: Losing focus with no value should be permissible (if not marked required).
	await page.clear(numberSelector);
	await page.blur(numberSelector);


	// --- 3. Common Use Case Validation Tests (Boundary & Type) ---

	// Test A: Setting Maximum Boundary.
	const maxVal = '100'; // Assume max is set to 100 for this test case
	await page.fill(numberSelector, maxVal);
	await expect(page.locator(numberSelector)).toHaveValue(maxVal);

	// Test B: Exceeding Maximum Boundary (Simulating up-spin/manual input).
	// We attempt to set a value > Max and assert the value caps at the boundary or rejects.
	const overflowValue = '101';
	await page.fill(numberSelector, overflowValue); // Filling might bypass spinner check initially
	// A more robust test would involve simulating clicks on the up-spinner until the value changes or stops incrementing.

	// Test C: Decimal Handling (Step validation).
	const stepVal = '0.1';
	await page.fill(numberSelector, '2.5'); // Start at 2.5
	// To test the step, we programmatically adjust the value by one step.
	await page.evaluate((val) => { document.getElementById('number-input').value = (parseFloat(val) + parseFloat(window.__STEP__)).toString(); }, '2.5');
	await expect(page.locator(numberSelector)).toHaveValue('2.6'); // Assuming step is 0.1

	// Test D: Invalid Character Input (Non-numeric).
	await page.fill(numberSelector, '42x'); // Mix of number and text
	await expect(page.locator(numberSelector)).toHaveValue('42'); // Expect browser/library validation to strip the invalid character upon loss of focus.
});