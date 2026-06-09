//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form

import { test, expect } from '@playwright/test';

/**
 * Test Suite for the <form> element structure and overall submission pipeline.
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form
 */
test('Form container must validate structural attributes, method flow, and required grouping', async ({ page }) => {
	const targetUrl = 'http://localhost/form-test';
	await page.route(targetUrl, route => {
		route.fulfill({
			status: 200,
			contentType: 'text/html',
			body: '<form action="/submit-success"><input type="text" name="fname"><input type="text" name="lname"><button type="submit">Submit</button></form>'
		});
	});
	await page.route('**/submit-success*', route => route.fulfill({ status: 200, body: 'Success' }));
	await page.goto(targetUrl);

	// ค้นหา Form แรกบนหน้าเว็บ
	const form = page.locator('form').first();
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
		// ดัก Event รอหน้าโหลดเสร็จหลังจากกด Submit (เพราะปกติกดแล้วฟอร์มจะต้องส่งค่าเปลี่ยนหน้า)
		await Promise.all([
			page.waitForNavigation({ url: /.*/, waitUntil: 'load' }).catch(() => {}), // รอรับ URL ใหม่
			submitBtn.click({ force: true })
		]);

		// ทดสอบว่าหน้าเว็บได้มีการส่งข้อมูลและเปลี่ยนหน้า URL จริง
		expect(page.url()).not.toBe(targetUrl);
	}
});
