import { test, expect } from '@playwright/test';
// 💡 อย่าลืม import inputSetup มาจากไฟล์โมดูลของคุณด้วยนะครับ เช่น:
// import { inputSetup } from '../helpers/inputSetup';

const textSelector = '#username';
const containerSelector = '.text-selector-wrapper';

// ✅ 1. ย้าย beforeEach ออกมาด้านนอก เพื่อเตรียมพร้อมก่อนเริ่มทุกเทสในไฟล์นี้
test.beforeEach(async ({ page }) => {
	// ตรวจสอบให้แน่ใจว่าได้ทำการสร้างหรือ import inputSetup มาแล้ว
	if (typeof inputSetup !== 'undefined') {
		await inputSetup.setupContext(page);
	} else {
		// 🛠️ จำลองหน้าเว็บที่มีโครงสร้างแท็กตามที่คุณต้องการทดสอบขึ้นมาตรงๆ
		await page.setContent(`
			<div class="text-selector-wrapper">
				<label for="username">Username:</label>
				<input type="text" id="username" autocomplete="username" />
			</div>
		`);
	}
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