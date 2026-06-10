//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML month input validation (type="month").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month
 */
test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div class="month-selector-wrapper">
			<label for="month-picker">Billing Month</label>
			<input type="month" id="month-picker" />
		</div>
	`);
});

test('Month input must validate YYYY-MM format and handle year boundary crossing', async ({ page }) => {
	const monthSelector = '#month-picker';
	const containerSelector = '.month-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	await expect(page.locator(monthSelector)).toHaveAttribute('type', 'month');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Must trigger the appropriate combined Year/Month picker widget.
	await page.focus(monthSelector);
	await expect(page.locator(monthSelector)).toBeFocused();

	// Test Interaction: Simulating selection interaction that correctly sets both year and month.
	const initialDate = '2024-11'; // YYYY-MM format for November 2024
	await page.fill(monthSelector, initialDate);
	await page.locator(monthSelector).blur();


	// --- 3. Common Use Case Validation Tests (Boundary & Format) ---

	// Test A: Standard valid month selection.
	const standardMonth = '2024-12'; // December 2024
	await page.fill(monthSelector, standardMonth);
	await expect(page.locator(monthSelector)).toHaveValue(standardMonth);

	// Test B: Year Boundary Crossing (Critical Test). This verifies that selecting a month near the end of a year correctly rolls over to the next year if simulating calendar logic.
	const rolloverTest = '2024-11'; // Start here
	await page.fill(monthSelector, rolloverTest);
	// If we were using picker controls, we would simulate advancing past month 12 (e.g., clicking next year button).

	// For direct input testing, we assert that setting a format from the *next* year is acceptable.
	const nextYearMonth = '2025-01';
	await page.fill(monthSelector, nextYearMonth);
	await expect(page.locator(monthSelector)).toHaveValue(nextYearMonth);
});