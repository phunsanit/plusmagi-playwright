//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML select element validation (type="select").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
 */
test('Select dropdown must manage state correctly, respect options, and validate selection', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/user-profile');
	const selectSelector = '#country-select';
	const containerSelector = '.select-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(containerSelector)).toContainElement(page.getByRole('label'));
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
	await page.selectOption(selectSelector, { label: 'Asia' }); // Selecting a group header item (if implemented in UI).
	// In a real scenario, we would test that the visual grouping renders correctly.

	// Test B: Disabled State Handling.
	const disabledSelect = '#disabled-select';
	await page.goto('https://staging.mock-website.com/limited'); // Navigate to a section with a disabled select.
	await expect(page.locator(disabledSelect)).toBeDisabled();
	// Attempting interaction should fail gracefully and not change the form state.

	// Test C: Resetting Selection (Deselecting).
	// If possible, test setting the value to null/default if no required selection was made.
});
