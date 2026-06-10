//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML checkbox validation (type="checkbox").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div>
			<label>Optional Opt-in <input type="checkbox" id="optin-checkbox" name="optional_optin" value="true" /></label>
			<label>Receive Newsletter <input type="checkbox" id="newsletter-checkbox" /></label>
		</div>
	`);
});

test('Checkbox input must manage state correctly, respect accessibility labels, and handle groups', async ({ page }) => {
	const checkboxSelector = '#optin-checkbox';
	const labelLocator = page.getByLabel('Optional Opt-in');

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Association - Check that the checkbox is correctly linked to a label.
	await expect(labelLocator).toBeVisible();

	// Test: Name/Value attributes for form submission integrity (essential for backend processing).
	await expect(page.locator(checkboxSelector)).toHaveAttribute('name', 'optional_optin');
	await expect(page.locator(checkboxSelector)).toHaveAttribute('value', 'true'); // Value sent if checked

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Ensure focus is visually received.
	await page.focus(checkboxSelector);
	await expect(page.locator(checkboxSelector)).toBeFocused();

	// Test Label Interaction: Simulating clicks on the associated label element.
	await labelLocator.click(); // Click via label should toggle state
	await expect(page.locator(checkboxSelector)).toBeChecked();

	// --- 3. Common Use Case Validation Tests (State & Grouping) ---

	// Test A: Toggling State.
	await page.click(checkboxSelector); // Uncheck it first
	await expect(page.locator(checkboxSelector)).not.toBeChecked();

	// Test B: Handling Multiple Checkboxes (Group Context).
	// Assume a second checkbox exists for testing group management.
	const otherCheckbox = page.getByLabel('Receive Newsletter'); // Placeholder selector
	await expect(otherCheckbox).toBeVisible();
	await otherCheckbox.check(); // Use locator.check() utility method
	await expect(page.locator(checkboxSelector)).not.toBeChecked(); // Reconfirm first state is maintained
});
