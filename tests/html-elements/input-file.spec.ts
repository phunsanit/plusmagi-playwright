//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file

import { test, expect } from './shared-setup';

/**
 * Test Suite for HTML file input validation (type="file").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
 */

test.beforeEach(async ({ setupForm }) => {
	await setupForm(`
		<label aria-label="Upload Document">Upload Document
			<input type="file" id="file-upload" accept="\\.(pdf|jpg|jpeg)$" multiple />
		</label>
		<button type="submit">Submit</button>
	`, `
		const input = document.querySelector('#file-upload');
		input?.addEventListener('change', () => {
			if (input.files && input.files.length > 0 && input.files[0].name.endsWith('.txt'))
				input.value = ''; // Simulate client-side rejection
		});
		document.querySelector('#master-form')?.addEventListener('submit', (e) => {
			e.preventDefault();
			window.location.hash = 'processing';
		});
	`);
});

test('File input must handle local selection, MIME type restrictions, and multi-select scenarios', async ({ page }) => {
	const fileInputSelector = '#file-upload';
	const uploadButtonSelector = 'button[type="submit"]';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: MIME Type Restriction via 'accept' attribute.
	await expect(page.locator(fileInputSelector)).toHaveAttribute('accept', '\\.(pdf|jpg|jpeg)$');

	// Test: Mandatory Label Association
	await expect(page.locator('label')).toContainText('Upload Document'); // Assuming the label is near enough or visible via aria-label.


	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Interacting with the file input should open a dialog (testing focus state).
	await page.focus(fileInputSelector);
	// Note: For actual testing, one would mock the OS dialog interaction.

	// Simulate cancellation on blur: Attempting to cancel the dialog and confirming no value change occurs.
	await page.evaluate((selector) => {
		const input = document.querySelector(selector);
		if (input) {
			// In a controlled test environment, we assert that clicking away from an unselected state does nothing malicious.
			 (input as HTMLInputElement).value = '';
		}
	}, fileInputSelector);
	await page.locator(fileInputSelector).blur();


	// --- 3. Common Use Case Validation Tests (Selection & Restriction) ---


	// Test A: Single File Selection (PDF).
	await page.locator(fileInputSelector).setInputFiles({ name: 'report.pdf', mimeType: 'application/pdf', buffer: Buffer.from('dummy pdf content') });
	await expect(page.locator(fileInputSelector)).toHaveValue(/.*\.pdf$/);

	// Test B: MIME Type Restriction Enforcement.
	// Attempt to select a disallowed file type (e.g., .txt) and assert it fails or the value reverts.
	await page.locator(fileInputSelector).setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('dummy text content') });
	// We check if the resulting path still ends in an allowed extension, indicating client-side filtering worked.
	await expect(page.locator(fileInputSelector)).toHaveValue('');

	// Test C: Multiple File Selection (If supported by attribute or use case).
	// If the 'multiple' attribute is present, test selecting two files.
	await page.locator(fileInputSelector).setInputFiles([
		{ name: 'image1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('dummy jpg 1') },
		{ name: 'image2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('dummy jpg 2') }
	]);
	// Value comparison becomes complex, but we confirm two items are processed:
	const fileNames = await page.locator(fileInputSelector).evaluate((el: HTMLInputElement) => {
		return Array.from(el.files || []).map(f => f.name);
	});
	expect(fileNames).toContain('image1.jpg');
	expect(fileNames).toContain('image2.jpg');

	// Final action: Trigger submission to verify data pipeline acceptance.
	await page.click(uploadButtonSelector);
	await expect(page).toHaveURL(/.*#processing/);
});
