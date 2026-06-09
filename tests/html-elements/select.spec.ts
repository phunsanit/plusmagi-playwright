//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML select element validation (type="select").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
 */
test('Select dropdown must manage state correctly, respect options, and validate selection', async ({ page }) => {
	await page.setContent(`
		<div class="select-wrapper">
			<label for="country-select">Country</label>
			<select id="country-select" name="country_code">
				<option value="US">United States</option>
				<option value="DE">Germany</option>
				<optgroup label="Asia">
					<option value="JP">Japan</option>
				</optgroup>
			</select>
		</div>
		<select id="disabled-select" disabled></select>
	`);
	const selectSelector = '#country-select';
	const containerSelector = '.select-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	// Test: The select element must have a name attribute for form submission.
	await expect(page.locator(selectSelector)).toHaveAttribute('name', 'country_code');


	// --- 2. Event Validation Checks (Interaction) ---

	// Test Focus and Selection: Opening the dropdown and verifying initial selection state.
	await page.focus(selectSelector);
	await expect(page).toHaveScreenshot('select_dropdown_focused.png');

	// Test Option Interaction: Selecting an option programmatically.
	const targetOptionText = 'Germany';
	await page.selectOption(selectSelector, { label: targetOptionText }); // Use the label for robustness.
	await expect(page.locator(selectSelector)).toHaveValue('DE'); // Assert that the *value* (not text) is correctly set on the input.


	// --- 3. Common Use Case Validation Tests (Grouping & State) ---

	// Test A: Option Grouping (__optgroup__). Ensure structure can handle categorized options.
	const optgroupOptionText = 'Japan';
	await page.selectOption(selectSelector, { label: optgroupOptionText }); // Select item inside optgroup
	await expect(page.locator(selectSelector)).toHaveValue('JP');

	// Test B: Disabled State Handling.
	const disabledSelect = '#disabled-select';
	await expect(page.locator(disabledSelect)).toBeDisabled();
	// Attempting interaction should fail gracefully and not change the form state.

	// Test C: Resetting Selection (Deselecting).
	// If possible, test setting the value to null/default if no required selection was made.
});
