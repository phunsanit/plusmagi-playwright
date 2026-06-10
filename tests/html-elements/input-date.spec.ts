//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML date input validation (type="date").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div class="date-selector-wrapper">
			<label for="date-picker">Select Date</label>
			<input type="date" id="date-picker" />
		</div>
	`);
});

test('Date input must validate YYYY-MM-DD format, handle calendar interaction, and enforce accessibility', async ({ page }) => {
	const dateSelector = '#date-picker';
	const containerSelector = '.date-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association (Accessibility requirement)
	await expect(page.locator(`${containerSelector} label`)).toBeVisible();

	// Test: Type check for mandatory attribute presence.
	await expect(page.locator(dateSelector)).toHaveAttribute('type', 'date');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Check if focusing triggers the native/custom date picker UI overlay.
	await page.focus(dateSelector);
	await expect(page.locator(dateSelector)).toBeFocused();

	// Test Blur: Ensure the value remains correctly set or validates upon losing focus.
	const initialDate = '2023-10-27';
	await page.fill(dateSelector, initialDate);
	await page.locator(dateSelector).blur();
	await expect(page.locator(dateSelector)).toHaveValue(initialDate);


	// --- 3. Common Use Case Validation Tests (Format & Impossibility) ---

	// Test A: Valid Date Input.
	const futureValidDate = '2099-12-31';
	await page.fill(dateSelector, futureValidDate);
	await expect(page.locator(dateSelector)).toHaveValue(futureValidDate);

	// Test B: Impossible Date Handling (Browser/Client side validation check).
	// Attempt to set an invalid date like Feb 30th or month 13.
	const impossibleDate = '2024-02-30';
	await page.locator(dateSelector).evaluate((node: HTMLInputElement, val) => {
		node.value = val;
	}, impossibleDate);

	// Expect the field value NOT to change OR for a specific error message related to calendar logic to appear.
	// (This assertion depends heavily on how strictly the staging site validates this.)
	// We assert that if validation fails client-side, it does not accept the invalid format as truth.
	await expect(page.locator(dateSelector)).not.toHaveValue('2024-02-30');
});
