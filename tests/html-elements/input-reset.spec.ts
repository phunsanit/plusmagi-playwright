//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/reset

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML reset button validation (type="reset").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/reset
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<input id="field-name" />
		<select id="country-select">
			<option value="">Select</option>
			<option value="US">United States</option>
		</select>
		<input type="checkbox" id="optin-checkbox" />
		<button type="reset">Reset</button>
	`);
});

test('Reset button must clear ALL form inputs back to their initial state', async ({ page }) => {
	const resetSelector = 'button[type="reset"]';

	// --- 1. Attribute Validation Checks (Structural) ---

	// Test: Mandatory Type Attribute.
	await expect(page.locator(resetSelector)).toHaveAttribute('type', 'reset');

	// --- 2. Event Validation Checks (The Core Functionality) ---

	// Test Setup: Populate multiple, diverse fields to ensure all are targeted for reset.
	await page.fill('#field-name', 'Test User Name'); // Text Field
	await page.selectOption('#country-select', 'US'); // Select Dropdown
	await page.check('#optin-checkbox'); // Checkbox

	// State Verification: Capture the initial state of various fields.
	const initialUsername = await page.inputValue('#field-name');
	const initialCheckboxState = await page.locator('#optin-checkbox').isChecked();

	await expect(page.locator('form')).toBeVisible(); // Ensure we are within a form context.

	// Action: Click the reset button.
	await page.click(resetSelector);

	// --- 3. Common Use Case Validation Tests (State Reset) ---

	// Test A: Text Field Reset Confirmation.
	await expect(page.locator('#field-name')).toHaveValue(''); // Must be cleared.

	// Test B: Checkbox Reset Confirmation.
	await expect(page.locator('#optin-checkbox')).not.toBeChecked(); // Must revert to unchecked state.

	// Test C: Select Dropdown Reset Confirmation (Requires simulating a default/initial option if available).
	await expect(page.locator('#country-select')).toHaveValue(''); // Must revert to its default selection ("").

	// Test D: Isolation Check - Ensure unrelated, non-form elements are unaffected (out of scope for this specific test).
});