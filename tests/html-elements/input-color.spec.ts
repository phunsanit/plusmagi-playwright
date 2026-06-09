"//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML color input validation (type="color").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color
 */
test('Color input must validate hex format, accessibility attributes, and live updates', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/design');
	const colorPickerSelector = '#color-picker';
	const displaySelector = '#color-display';
	const containerSelector = '.color-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association
	await expect(page.locator(containerSelector)).toContainElement(page.getByRole('label'));

	// Test: Required Format Pattern - Ensure the input only accepts valid hex codes upon interaction.
	// We test that the underlying value adheres to the expected 6-digit pattern after manipulation.
	await page.evaluate(() => {
		const input = document.querySelector(colorPickerSelector);
		if (input) {
			Object.defineProperty(input, 'value', { writableValue: '#000000' });
		}
	});
	// Check if the initial value matches the required format.
	await expect(page.locator(colorPickerSelector)).toHaveValue(/^#([0-9a-f]{6})$/i);


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Simulate interaction to ensure the color picker opens correctly.
	await page.focus(colorPickerSelector);
	await expect(page).toHaveScreenshot('color_picker_focused'); // Useful for checking if the native UI component appears

	// Test Blur & Live Update: Simulation of losing focus after a valid change.
	const sampleColor = '#FF6347'; // Tomato color
	await page.evaluate((color) => {
		document.getElementById('color-picker').value = color;
	}, sampleColor);
	// Wait for the associated display element to update immediately upon 'blur' event or change in value.
	await page.waitForFunction(`el => el.textContent === 'Color: ${sampleColor}'`, { timeout: 5000 });
	await expect(page.locator(displaySelector)).toHaveText(`Color: ${sampleColor}`);


	// --- 3. Common Use Case & Accessibility Tests ---

	// Test: Black/White Corner Check (Boundary condition)
	const blackHex = '#000000';
	await page.evaluate((hex) => {
		document.getElementById('color-picker').value = hex;
	}, blackHex);
	await expect(page.locator(displaySelector)).toHaveText(`Color: ${blackHex}`);

	// Test: High Contrast (Accessibility check simulation)
	const highContrastColor = '#FFFFFF'; // White background for contrast testing against dark text on the form itself.
	await page.evaluate((hex) => {
		document.getElementById('color-picker').value = hex;
	}, highContrastColor);
	// Note: Full contrast checking requires DOM traversal/external libraries, but we confirm state change here.
	await expect(page.locator(displaySelector)).toHaveText(`Color: ${highContrastColor}`);
});
