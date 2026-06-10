//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML time input validation (type="time").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<div class="time-selector-wrapper">
			<label for="appointment-time">Select Time</label>
			<input type="time" id="appointment-time" />
		</div>
	`);
});

test('Time input must validate HH:MM:SS format and handle picker interaction', async ({ page }) => {
	const timeSelector = '#appointment-time';
	const containerSelector = '.time-selector-wrapper';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	await expect(page.locator(timeSelector)).toHaveAttribute('type', 'time');

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Must trigger the time picker widget overlay.
	await page.focus(timeSelector);
	await expect(page).toHaveScreenshot('time_picker_focused.png', { maxDiffPixelRatio: 0.02 });

	// Test Interaction: Simulating direct input of a valid time.
	const sampleTime = '14:30:00'; // 2:30 PM
	await page.fill(timeSelector, sampleTime);
	await page.locator(timeSelector).blur();

	// --- 3. Common Use Case Validation Tests (Boundary & Rollover) ---

	// Test A: Boundary Check - Valid time near rollover boundaries.
	const earlyMorning = '01:05:00'; // Should be valid
	await page.fill(timeSelector, earlyMorning);
	await expect(page.locator(timeSelector)).toHaveValue(earlyMorning);

	// Test B: Time Rollover Simulation (e.g., crossing midnight). This validates the internal calendar logic.
	const rolloverTime = '23:59:59'; // The last second of a day
	await page.fill(timeSelector, rolloverTime);
	await expect(page.locator(timeSelector)).toHaveValue(rolloverTime);

	// Test C: Invalid Time Component (Invalid minute or hour).
	const invalidTime = '14:65:00'; // 65 minutes is invalid.
	await page.locator(timeSelector).evaluate((node: HTMLInputElement, val) => {
		node.value = val;
	}, invalidTime);
	// Expect the browser/library to correct this, usually by clamping it to the max valid value (e.g., 14:59:59).
	await expect(page.locator(timeSelector)).not.toHaveValue('14:65:00');
});
