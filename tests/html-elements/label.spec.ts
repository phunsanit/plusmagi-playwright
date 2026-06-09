//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML label element validation (type="label").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
 */
test('Label must correctly associate and trigger focus on associated form controls', async ({ page }) => {
	await page.setContent(`
		<form>
			<label>Username <input id="username" /></label>
			<label for="email-input">Email Address</label>
			<input id="email-input" />
			<input type="password" id="password-input" />
			<label>Optional Opt-in <input type="checkbox" id="optin-checkbox" /></label>
			<div role="textbox" aria-label="Full Name">Sample Text</div>
		</form>
	`);
	// Setup: We assume a standard setup where fields are labeled, using both 'for' attribute and aria-labelledby.

	const usernameLabel = page.getByLabel('Username'); // Standard use (implied association)
	const emailLabel = page.getByLabel('Email Address');
	const passwordField = '#password-input';

	// --- 1. Structural Validation: The Label must be associated correctly ---

	await expect(usernameLabel).toBeVisible(); // Basic visibility check.

	// Test using the 'for' attribute (Traditional method).
	const emailLabelElement = page.locator('label', { hasText: 'Email Address' });
	await expect(emailLabelElement).toHaveAttribute('for', 'email-input'); // Asserting structural link property.


	// --- 2. Event Validation Checks (Accessibility Trigger) ---

	// Test Interaction: Clicking the label must focus the associated input, regardless of visibility.
	await emailLabelElement.click();
	// Check that focusing the label successfully places focus on the actual input element.
	await expect(page.locator('#email-input')).toBeFocused();

	// Test State Synchronization: If the input has state (like a checkbox), clicking the label must toggle that state.
	const checkboxLabel = page.getByLabel('Optional Opt-in'); // Reusing selector from checkbox spec for testing
	await checkboxLabel.click(); // Click via label should toggle state.
	await expect(page.locator('#optin-checkbox')).toBeChecked();


	// --- 3. Advanced Context Test: aria-labelledby (For complex labeling scenarios) ---

	// Test Scenario: When a label relies on other elements for its text content or grouping information.
	const complexLabel = page.getByRole('textbox', { name: 'Full Name' }); // A field labeled by combination of IDs/text.
	await expect(complexLabel).toBeVisible();

});
