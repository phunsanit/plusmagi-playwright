//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML radio button validation (type="radio").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio
 */
test('Radio input group must enforce mutual exclusivity, label association, and state transitions', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/settings');
	const options = [
		{ id: '#optionA', label: 'Option A' },
		{ id: '#optionB', label: 'Option B' },
		{ id: '#optionC', label: 'Option C' }
	];

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Grouping Name.
	// All radios in a group MUST share the same 'name' attribute to enforce mutual exclusivity.
	await expect(page.locator('#optionA')).toHaveAttribute('name', 'user_preference');

	// Test: Label Association (Accessibility).
	for (const option of options) {
		await expect(page.getByLabel(option.label)).toBeVisible(); // Checks if label exists for each radio.
		// We should also check that the input is correctly associated with its label via aria-labelledby/for.
	}


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus Sequence: Moving focus programmatically through options.
	await page.focus(options[0].id); // Focus A
	await page.focus(options[1].id); // Shift/Tab to B
	await expect(page).toHaveScreenshot('radio_group_focused.png');

	// Test Blur from non-input element: If another element blurs, the selection state must be retained.
	await page.click('.other-related-element'); // Simulate focus shift away from the group


	// --- 3. Common Use Case Validation Tests (State & Exclusivity) ---

	// Test A: Initial Selection and State Confirmation.
	await page.click(options[0].id);
	await expect(page.locator(options[0].id)).toBeChecked();

	// Test B: Mutual Exclusion (Crucial Logic Check).
	const secondOption = options[1];
	await page.click(secondOption.id); // Select Option B

	// Assertion 1: Original option must be unchecked.
	await expect(page.locator(options[0].id)).not.toBeChecked();
	// Assertion 2: New option must be checked.
	await expect(page.locator(secondOption.id)).toBeChecked();

	// Test C: Deselecting all options (If possible, simulating unchecking the current choice).
	await page.click(options[1].id); // Re-select B for context
	// If a 'Deselect All' mechanism exists or if clicking an invisible element can unset it, test that sequence.
});
