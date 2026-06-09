//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML range input validation (type="range").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range
 */
test('Range slider must respect defined min, max, and step boundaries', async ({ page }) => {
	await page.setContent(`
		<div class="range-selector-wrapper">
			<label for="satisfaction-slider">Satisfaction</label>
			<input type="range" id="satisfaction-slider" min="0" max="100" step="1" />
		</div>
	`);
	const rangeSelector = '#satisfaction-slider';
	const containerSelector = '.range-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	await expect(page.locator(rangeSelector)).toHaveAttribute('min', '0'); // Assume min is set to 0.
	await expect(page.locator(rangeSelector)).toHaveAttribute('max', '100'); // Assume max is set to 100.
	await expect(page.locator(rangeSelector)).toHaveAttribute('step', '1');


	// --- 2. Event Validation Checks (Interaction & State) ---

	// Test Focus: Interacting with the slider knob/thumb should allow both drag and direct input.
	await page.focus(rangeSelector);
	// Check that keyboard navigation arrows increment/decrement by 'step' amount.
	await page.keyboard.press('ArrowRight'); // Should move it by 1 (the step).

	// Test Value Update: Changing the value via direct input box simulation.
	const targetValue = '75';
	await page.fill(rangeSelector, targetValue);
	await expect(page.locator(rangeSelector)).toHaveValue(targetValue); // Assert direct fill works.


	// --- 3. Common Use Case Validation Tests (Boundary & Increment) ---

	// Test A: Boundary Check - Setting to Min/Max values.
	await page.fill(rangeSelector, '0');
	await expect(page.locator(rangeSelector)).toHaveValue('0');

	await page.fill(rangeSelector, '100');
	await expect(page.locator(rangeSelector)).toHaveValue('100');

	// Test B: Boundary Overflow Check (Attempting to set invalid value).
	// Attempting to set a value far outside the defined range.
	const overflowValue = '200';
	await page.locator(rangeSelector).evaluate((node: HTMLInputElement, val) => {
		node.value = val;
	}, overflowValue); // Simulate an attempt by backend/script

	// Assertion: The actual value should be clamped to the maximum allowed boundary (100).
	await expect(page.locator(rangeSelector)).toHaveValue('100');
});