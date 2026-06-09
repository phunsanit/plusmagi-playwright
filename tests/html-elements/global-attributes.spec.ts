"//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes

import { test, expect } from '@playwright/test';

/**
 * Master Test Suite for Global Attributes Validation (aria-* and data-*).
 * This file acts as the CENTRAL CONTEXT SETUP point and depends on other specs now residing in this directory.  * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes
 */
test.beforeAll(async ({ page }) => {
	console.log("Setting up the master context fixture for all global attribute tests.");
	await page.goto('https://staging.mock-website.com/global-validation');

	// 1. Mock mandatory elements that rely on global attributes.
	await page.locator('#username').getByLabel('Username').click(); // Focus input.
	document.getElementById('name').setAttribute('aria-required', 'true');
	document.getElementById('nameHelp').textContent = 'This name is required.'; // Mock helper text.
	// 2. Setup a mock form with varied types to test attribute scoping.
	await page.locator('#master-form').fill('#email-input', 'test@example.com');
});

test('Form validation must correctly respect all global accessibility and metadata attributes', async ({ page }) => {
	// The context is already set up in beforeAll, so we only test the assertions here.
	// --- 1. Mandatory Global Attribute Validation (ARIA Focus) ---
	await expect(page.locator('#username')).toHaveAttribute('aria-required', 'true');
	await expect(page.locator('#email-input')).toHaveAttribute('aria-describedby', '#email-help');



	// --- 2. Attribute Consistency Check (Data vs ARIA) ---


	// Test: Verify data-* attributes are read and respected, mimicking component dependency.
	await page.evaluate(() => {
		document.getElementById('product-id').setAttribute('data-client-id', 'CUST123'); // Still works as long as the element exists on the page.
	});
	// Asserting that global logic reads this stored data attribute:
	await expect(page.locator('[data-sku]')).toHaveAttribute('data-sku', 'SKU-987654');



	// --- 3. Integration Test: Global Attribute Dependency Check ---

	// Simulate state change that affects aria-* properties.
	await page.evaluate(() => {
		const input = document.getElementById('name'); // A basic text field used for testing context.
		if (input) {
			input.setAttribute('aria-required', 'true'); // Dynamically enforcing the attribute.
			document.getElementById('nameHelp').textContent = 'This name is required.';
		}
	});
	// Action: Attempt submission when the prerequisite global state fails.
	await page.fill('#name', ''); // Empty, forcing aria-required failure.
	const submitButton = page.getByRole('button', { name: 'Submit' });
	await submitButton.click();
	// Assertion: Failure must be triggered because the required attribute check (aria-required) failed based on form context.
	await expect(page).toHaveURL('**/global-validation'); // Should NOT navigate if validation fails
	await expect(page.getByText(/required/i)).toBeVisible();
});"
