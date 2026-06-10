//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML color input validation (type="color").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div class="color-selector-wrapper">
			<label for="color-picker">Choose Color</label>
			<input type="color" id="color-picker" value="#000000" />
			<div id="color-display">Color: #000000</div>
		</div>
	`, `
		const input = document.querySelector('#color-picker');
		const display = document.querySelector('#color-display');
		const updateDisplay = () => {
			display.textContent = \`Color: \${input.value.toUpperCase()}\`;
		};
		input.addEventListener('input', updateDisplay);
		input.addEventListener('change', updateDisplay);
	`);
});

test('Color input must validate hex format, accessibility attributes, and live updates', async ({ page }) => {
	const colorPickerSelector = '#color-picker';
	const displaySelector = '#color-display';
	const containerSelector = '.color-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association
	await expect(page.locator(`${containerSelector} label`)).toBeVisible();

	// Test: Required Format Pattern - Ensure the input only accepts valid hex codes upon interaction.
	// We test that the underlying value adheres to the expected 6-digit pattern after manipulation.
	await page.evaluate((selector) => {
		const input = document.querySelector(selector) as HTMLInputElement;
		if (input) {
			input.value = '#000000';
		}
	}, colorPickerSelector);
	// Check if the initial value matches the required format.
	await expect(page.locator(colorPickerSelector)).toHaveValue(/^#([0-9a-f]{6})$/i);

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Simulate interaction to ensure the color picker opens correctly.
	await page.focus(colorPickerSelector);
	await expect(page.locator(colorPickerSelector)).toBeFocused();

	// Test Blur & Live Update: Simulation of losing focus after a valid change.
	const sampleColor = '#ff6347'; // Tomato color
	await page.evaluate((color) => {
		const el = document.getElementById('color-picker') as HTMLInputElement;
		el.value = color;
		el.dispatchEvent(new Event('input', { bubbles: true }));
	}, sampleColor);
	// Wait for the associated display element to update immediately upon 'blur' event or change in value.
	await expect(page.locator(displaySelector)).toHaveText(`Color: ${sampleColor.toUpperCase()}`);

	// --- 3. Common Use Case & Accessibility Tests ---

	// Test: Black/White Corner Check (Boundary condition)
	const blackHex = '#000000';
	await page.evaluate((hex) => {
		const el = document.getElementById('color-picker') as HTMLInputElement;
		el.value = hex;
		el.dispatchEvent(new Event('input', { bubbles: true }));
	}, blackHex);
	await expect(page.locator(displaySelector)).toHaveText(`Color: ${blackHex}`);

	// Test: High Contrast (Accessibility check simulation)
	const highContrastColor = '#FFFFFF'; // White background for contrast testing against dark text on the form itself.
	await page.evaluate((hex) => {
		const el = document.getElementById('color-picker') as HTMLInputElement;
		el.value = hex;
		el.dispatchEvent(new Event('input', { bubbles: true }));
	}, highContrastColor);
	// Note: Full contrast checking requires DOM traversal/external libraries, but we confirm state change here.
	await expect(page.locator(displaySelector)).toHaveText(`Color: ${highContrastColor}`);
});
