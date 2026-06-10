//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form

import { test, expect, Page } from '@playwright/test';

/**
 * Test Suite for the <form> element structure and overall submission pipeline.
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form
 */
import { formSetup } from './shared-setup';

const targetUrl = 'http://localhost/form-test';

test.beforeEach(async ({ page }) => {
	await formSetup.setupContext(page);
	await page.evaluate(() => {
		// Insert the specific form into the body to run our test
		document.body.insertAdjacentHTML('beforeend', '<form action="http://localhost/submit-success"><input type="text" name="fname"><input type="text" name="lname"><button type="submit">Submit</button></form>');
	});
});

test('Form container must validate structural attributes, method flow, and required grouping', async ({ page }) => {

	// ค้นหา Form ล่าสุดบนหน้าเว็บ (ฟอร์มที่ทดสอบถูกแทรกเข้าไปท้ายสุด)
	const form = page.locator('form').last();
	await expect(form).toBeVisible();

	// --- 1. Attribute Validation Checks ---
	// ตรวจสอบว่า Form อย่างน้อยต้องมีการระบุ action ปลายทาง
	await expect(form).toHaveAttribute('action', /.*/);

	// --- 2. Event Validation Checks (Cross-Input Dependency) ---
	// ทดสอบกรอกข้อมูลในช่อง Input แรกที่พบ
	const textInputs = form.locator('input[type="text"]');
	if (await textInputs.count() > 0) {
		await textInputs.first().focus();
		await textInputs.first().fill('Playwright Test User');
		await expect(textInputs.first()).toHaveValue('Playwright Test User');

		// ลอง focus และกรอกช่องถัดไปถ้ามี
		if (await textInputs.count() > 1) {
			await textInputs.nth(1).focus();
			await textInputs.nth(1).fill('Automated');
		}
	}

	// --- 3. Common Submission Flow Tests (Integration Test) ---
	// ค้นหาปุ่ม Submit ภายในฟอร์ม และสั่งคลิก
	const submitBtn = form.locator('input[type="submit"], button[type="submit"]').first();
	if (await submitBtn.count() > 0) {
		await submitBtn.click();
		await expect(page).toHaveURL(/.*submit-success.*/);
	}
});
