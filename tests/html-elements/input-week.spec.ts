//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week

import { test, expect } from './shared-setup';

const weekSelector = '#week-picker';
const containerSelector = '.week-selector-wrapper';

test.beforeEach(async ({ setupForm }) => {
	// โยนแค่โครงสร้างที่ต้องการทดสอบเข้าไป โครงสร้างหลักและ setup จะถูกจัดการให้เอง
	await setupForm(`
		<div class="week-selector-wrapper">
			<label for="week-picker">Select Week:</label>
			<input type="week" id="week-picker" autocomplete="off" />
		</div>
	`);
});

/**
 * Test Suite for HTML week input validation (type="week").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week
 */
test('Week input must correctly validate and handle YYYY-Www format', async ({ page }) => {

	// --- 1. Attribute Validation Checks (Required Attributes) ---
	// ปรับปรุงการตรวจสอบ Label ภายในคอนเทนเนอร์ให้ทำงานได้แม่นยำขึ้น
	await expect(page.locator(`${containerSelector} label`)).toBeVisible();
	await expect(page.locator(weekSelector)).toHaveAttribute('type', 'week');

	// --- 2. Event Validation Checks (Focus & Blur) ---
	// Test Focus: เคาะโฟกัสไปที่ Input
	await page.focus(weekSelector);

	// หมายเหตุ: การตรวจ Screenshot ถ้ารันครั้งแรกระบบจะสร้างไฟล์ Master Image ไว้ให้ก่อน
	// และถ้ารันครั้งถัดไปจะเปิดฟีเจอร์เปรียบเทียบรูปภาพ (Visual Regression) อัตโนมัติครับ
	await expect(page).toHaveScreenshot('week_picker_focused.png');

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
});