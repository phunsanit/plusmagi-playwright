import { test, expect } from '@playwright/test';

test.describe('Firefox Specific Features & Quirks', () => {

  // เคสที่ 1: Form Autocomplete Persistence
  test('1. ทดสอบพฤติกรรมการจัดการค่าคงค้างในฟอร์มหลังจากกด Refresh', async ({ page }) => {
	const mockUrl = 'http://localhost:3000/form';

	await page.route(mockUrl, async (route) => {
	  await route.fulfill({
		status: 200,
		contentType: 'text/html',
		body: `
		  <html>
			<body>
			  <form id="profile-form">
				<input type="text" id="nickname" value="" />
			  </form>
			</body>
		  </html>
		`
	  });
	});

	await page.goto(mockUrl);
	const inputArea = page.locator('#nickname');
	await inputArea.fill('Pitt Dev');
	await page.reload();

	await expect(inputArea).toHaveValue('');
  });

  // เคสที่ 2: Strict Focus & Keyboard Events
  test('2. ทดสอบความเข้มงวดเรื่อง Keyboard Focus บน Custom Component', async ({ page }) => {
	await page.setContent(`
	  <html>
		<body>
		  <div id="custom-select" tabindex="0" style="border:1px solid #ccc; padding:10px;">
			Select Option
		  </div>
		  <ul id="options-list" style="display:none;">
			<li id="opt-1">Option 1</li>
		  </ul>
		  <script>
			const select = document.getElementById('custom-select');
			select.addEventListener('focus', () => {
			  document.getElementById('options-list').style.display = 'block';
			});
			select.addEventListener('keydown', (e) => {
			  if (e.key === 'ArrowDown') {
				document.getElementById('opt-1').style.color = 'red';
			  }
			});
		  </script>
		</body>
	  </html>
	`);

	await page.keyboard.press('Tab');
	await expect(page.locator('#options-list')).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await expect(page.locator('#opt-1')).toHaveCSS('color', 'rgb(255, 0, 0)');
  });

  // เคสที่ 3: Built-in PDF Viewer / Document Detection
  test('3. ทดสอบสกัดกั้นและตรวจจับการโหลดไฟล์รายงาน PDF', async ({ page }) => {
	const mockOrigin = 'http://localhost:3000';

	await page.route(mockOrigin, async (route) => {
	  await route.fulfill({
		status: 200,
		contentType: 'text/html',
		body: `<a id="view-report" href="/files/mock-report.pdf">เปิดดูรายงาน PDF</a>`
	  });
	});

	// 🔥 จุดแก้ไข: เติม **/ นำหน้าพาทไฟล์ เพื่อให้ Playwright ดักจับแบบ Glob Pattern ได้สมบูรณ์ ไม่หลุดไปหาเน็ตจริง
	await page.route('**/files/mock-report.pdf', async (route) => {
	  await route.fulfill({
		status: 200,
		contentType: 'application/pdf',
		body: Buffer.from('%PDF-1.4 ... mock pdf content ...')
	  });
	});

	await page.goto(mockOrigin);

	// ดักฟัง Event การตอบกลับของเน็ตเวิร์ก
	const responsePromise = page.waitForResponse('**/files/mock-report.pdf');
	await page.click('#view-report');

	const response = await responsePromise;
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('application/pdf');
  });

});