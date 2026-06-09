//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML datetime-local input validation (type="datetime-local").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local
 */
test('Datetime-Local input must validate ISO format, handle picker interaction, and enforce accessibility', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/appointment');
	const dateTimeSelector = '#datetime-picker';
	const containerSelector = '.datetime-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Label Association
	await expect(page.locator(containerSelector)).toContainElement(page.getByRole('label'));

	// Test: Type check for mandatory attribute presence.
	await expect(page.locator(dateTimeSelector)).toHaveAttribute('type', 'datetime-local');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Check if focusing triggers the comprehensive picker widget overlay.
	await page.focus(dateTimeSelector);
	// Screenshot check is crucial here to validate complex UI appearance.
	await expect(page).toHaveScreenshot('datetime_picker_focused.png');

	// Test Blur & Value Confirmation: Setting a known valid value and confirming it persists.
	const sampleDateTime = '2025-10-01T09:00';
	await page.fill(dateTimeSelector, sampleDateTime);
	await page.blur(dateTimeSelector);
	await expect(page.locator(dateTimeSelector)).toHaveValue(sampleDateTime);


	// --- 3. Common Use Case Validation Tests (Format & Boundaries) ---

	// Test A: Valid Date/Time combination.
	const futureValidDateTime = '2099-12-31T23:59';
	await page.fill(dateTimeSelector, futureValidDateTime);
	await expect(page.locator(dateTimeSelector)).toHaveValue(futureValidDateTime);

	// Test B: Invalid Time Component (e.g., 24:00 hour or invalid minute).
	const impossibleTime = '2025-12-31T24:00';
	await page.fill(dateTimeSelector, impossibleTime);

	// Assert that the field either rejects input via UI (preferred) or retains the last valid value.
	await expect(page.locator(dateTimeSelector)).not.toHaveValue('2025-12-31T24:00');
});
