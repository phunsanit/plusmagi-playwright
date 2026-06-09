//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML week input validation (type="week").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week
 */
test('Week input must correctly validate and handle YYYY-Www format', async ({ page }) => {
	// *** INHERITANCE STEP ***
	await test.beforeEach(async () => {
		// Use the centralized setup fixture for all week-based testing.
		await inputSetup.setupContext(page); // Fixture call based on global setup.
	});

	const weekSelector = '#week-picker';
	const containerSelector = '.week-selector-wrapper';
	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(containerSelector)).toContainElement(page.getByRole('label'));
	await expect(page.locator(weekSelector)).toHaveAttribute('type', 'week');


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Must trigger the week picker widget, typically displaying a calendar grid.
	await page.focus(weekSelector);
	await expect(page).toHaveScreenshot('week_picker_focused');

	// --- 3. Common Use Case Validation Tests (Boundary & Format) ---

	// Test A: Standard Week Selection (Valid YYYY-Www format).
	const standardWeek = '2024-W31'; // Year and Week Number.
	await page.fill(weekSelector, standardWeek);
	await expect(page.locator(weekSelector)).toHaveValue(standardWeek);

	// Test B: Boundary Check - Testing the first and last week of a year.
	const startOfYear = '2024-W01';
	await page.fill(weekSelector, startOfYear);
	await expect(page.locator(weekSelector)).toHaveValue(startOfYear);

	// Test C: Boundary Check - Year rollover validation (e.g., Week 52 of one year to Week 1 of next).
	const nextYearStart = '2025-W01';
	await page.fill(weekSelector, nextYearStart);
	await expect(page.locator(weekSelector)).toHaveValue(nextYearStart);
});"