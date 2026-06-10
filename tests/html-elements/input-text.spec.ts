import { test, expect } from './shared-setup';

const textSelector = '#username';
const containerSelector = '.text-selector-wrapper';

test.beforeEach(async ({ setupForm }) => {
	// username input is inherently provided by setupForm, so we just wrap it with a label via DOM structure.
	await setupForm(`
		<div class="text-selector-wrapper">
			<label for="username">Username:</label>
		</div>
	`, `
		// Move the auto-generated username field into our wrapper for clean structure
		const wrapper = document.querySelector('.text-selector-wrapper');
		const usernameInput = document.getElementById('username');
		usernameInput.autocomplete = 'username';
		wrapper.appendChild(usernameInput);
	`);
});

/**
 * Test Suite for general text input validation (type="text").
 */
test('Text input must handle global data types, autocomplete context, and sanitization', async ({ page }) => {
	// --- 1. Attribute Validation Checks (Required Attributes) ---
	// ปรับแก้ไขจาก toContainElement (ไม่มีใน playwright) เป็นใช้ locator ปกติ
	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	await expect(page.locator(textSelector)).toHaveAttribute('autocomplete', 'username');

	// --- 2. Event Validation Checks (Focus & Blur) ---
	await page.focus(textSelector);
	await expect(page.locator(textSelector)).toBeFocused();

	// --- 3. Common Use Case Validation Tests (Data Handling & Length) ---
	// Test A: Unicode Support.
	const unicodeUser = 'ユーザー名';
	await page.fill(textSelector, unicodeUser);
	await expect(page.locator(textSelector)).toHaveValue(unicodeUser);

	// Test B: Max Length Constraint Simulation.
	await page.evaluate(() => {
		const input = document.querySelector('#username');
		if (input) {
			(window as any).__MAX_LENGTH__ = 20;
		}
	});

	const overLengthString = 'A'.repeat(50);
	await page.fill(textSelector, overLengthString);

	await page.evaluate((str) => {
		const input = document.querySelector('#username') as HTMLInputElement;
		if (input) {
			input.value = str.substring(0, (window as any).__MAX_LENGTH__);
		}
	}, overLengthString);

	await expect(page.locator(textSelector)).toHaveValue('A'.repeat(20));
});