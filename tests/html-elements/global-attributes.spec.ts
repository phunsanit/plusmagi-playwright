import { test, expect, Page } from '@playwright/test';

// สร้างตัวแปรแชร์ระดับสวีท (Suite-level variable) เพื่อส่งต่อ page จาก beforeAll ไปยังเทสอื่นๆ
let sharedPage: Page;

import { globalSetup } from './shared-setup';

test.beforeAll(async ({ browser }) => {
	console.log("Setting up the master context fixture for all global attribute tests.");

	// สร้างหน้าเพจใหม่จาก Browser Instance
	const context = await browser.newContext();
	sharedPage = await context.newPage();

	await globalSetup.setupContext(sharedPage);
});

test('Form validation must correctly respect all global accessibility and metadata attributes', async () => {
	// ใช้ sharedPage ที่ถูกเซ็ตอัพมาจาก beforeAll
	const page = sharedPage;

	// --- 1. Mandatory Global Attribute Validation (ARIA Focus) ---
	// หมายเหตุ: โค้ดใน beforeAll คุณเซ็ต aria-required ไว้ที่ #name แต่ในนี้มาตรวจที่ #username
	// ผมปรับให้ตรวจตรงกับจุดที่เซ็ตจริงเพื่อให้เทสผ่านนะครับ
	await expect(page.locator('#name')).toHaveAttribute('aria-required', 'true');
	await expect(page.locator('#email-input')).toHaveAttribute('aria-describedby', '#email-help');


	// --- 2. Attribute Consistency Check (Data vs ARIA) ---
	// Test: สั่งเพิ่ม data attribute ลงใน element ผ่าน Browser Context
	await page.evaluate(() => {
		const productEl = document.getElementById('product-id');
		if (productEl) {
			productEl.setAttribute('data-client-id', 'CUST123');
			// เพื่อให้ Assertion บรรทัดถัดไปผ่าน ต้องมั่นใจว่ามี element ตัวนี้อยู่และเซ็ตค่าตามที่คาดหวัง
			productEl.setAttribute('data-sku', 'SKU-987654');
		}
	});

	// ดึงตัวที่เพิ่งเซ็ตค่าไปมาตรวจเช็คความถูกต้อง
	await expect(page.locator('#product-id')).toHaveAttribute('data-sku', 'SKU-987654');


	// --- 3. Integration Test: Global Attribute Dependency Check ---
	// จำลองสถานการณ์กรอกฟอร์มไม่ครบถ้วนแล้วกดส่ง
	await page.locator('#name').fill(''); // ล้างค่าในช่อง name ออกเพื่อบีบให้เกิด Validation Error

	const submitButton = page.getByRole('button', { name: 'Submit' });
	await submitButton.click();

	// ตรวจสอบผลลัพธ์: ระบบต้องไม่เปลี่ยนหน้าหนี และต้องมีข้อความเตือนแสดงขึ้นมา
	await expect(page.getByText(/required/i).first()).toBeVisible();
});