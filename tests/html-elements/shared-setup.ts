import { test as base, expect, Page } from '@playwright/test';

// --- Custom Fixtures: วิธีสืบทอดที่ง่ายและคลีนที่สุด ---
type MyFixtures = {
	setupForm: (innerHtml: string, scriptContent?: string) => Promise<void>;
};

export const test = base.extend<MyFixtures>({
	setupForm: async ({ page }, use) => {
		await use(async (innerHtml: string, scriptContent?: string) => {
			// 1. สร้างโครงสร้างพื้นฐานให้โดยอัตโนมัติ
			await page.setContent(`
				<form id="master-form">
					<input id="username" />
					${innerHtml}
				</form>
			`);

			// 2. ใส่ Script ย่อยของแต่ละเทส (ถ้ามี)
			if (scriptContent) {
				await page.addScriptTag({ content: scriptContent });
			}

			// 3. รัน Global Setup ที่ใช้ร่วมกัน
			await page.route('**/submit-success*', route => route.fulfill({ status: 200, body: 'Success' }));
			await page.locator('#master-form').waitFor();
			await page.fill('#username', '');
		});
	}
});

export { expect };

// ============================================================================
// (โค้ดเก่าด้านล่างนี้ยังคงไว้เพื่อให้ไฟล์ที่ยังไม่ได้แก้ไม่พังไปก่อนครับ)
// ============================================================================

export const globalSetup = {
	setupContext: async (page: Page) => {
		await page.setContent(`
			<form id="my-form">
				<input id="name" />
				<div id="nameHelp"></div>
				<input id="username" />
				<input id="email-input" aria-describedby="#email-help" />
				<div id="product-id"></div>
				<button type="submit">Submit</button>
				<div id="error-message" style="display:none">This name is required.</div>
			</form>
		`);
		await page.evaluate(() => {
			document.querySelector('#my-form')?.addEventListener('submit', (e) => {
				e.preventDefault();
				const nameEl = document.querySelector('#name') as HTMLInputElement;
				if (!nameEl.value) {
					(document.querySelector('#error-message') as HTMLElement).style.display = 'block';
				}
			});
		});

		await page.locator('#username').click();

		await page.evaluate(() => {
			const nameEl = document.getElementById('name');
			const nameHelpEl = document.getElementById('nameHelp');
			if (nameEl) nameEl.setAttribute('aria-required', 'true');
			if (nameHelpEl) nameHelpEl.textContent = 'This name is required.';
		});

		await page.locator('#email-input').fill('test@example.com');
	}
};

export const formSetup = {
	setupContext: async (page: Page) => {
		await page.route('**/submit-success*', route => route.fulfill({ status: 200, body: 'Success' }));
		await globalSetup.setupContext(page);
	}
};

export const inputSetup = {
	setupContext: async (page: Page) => {
		await formSetup.setupContext(page);
		await page.locator('#my-form').waitFor();
		await page.fill('#username', '');
	}
};