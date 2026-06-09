import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http'; // 🔥 เพิ่มโมดูล HTTP สำหรับสร้างเซิร์ฟเวอร์จริงในเครื่อง

test.describe('Global Cross-Browser Features', () => {
	let server: http.Server;
	let localServerUrl: string;

	// โหลดเซิร์ฟเวอร์จำลองขึ้นมาก่อนเริ่มรันเทสในไฟล์นี้
	test.beforeAll(async () => {
		server = http.createServer((req, res) => {
			if (req.url === '/') {
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end('<html><body><a href="/download/some-file.txt" download>some-file.txt</a></body></html>');
			} else if (req.url === '/download/some-file.txt') {
				res.writeHead(200, {
					'Content-Type': 'application/octet-stream',
					'Content-Disposition': 'attachment; filename="some-file.txt"'
				});
				res.end('mock text file content');
			} else {
				res.writeHead(404);
				res.end();
			}
		});

		// ให้ระบบสุ่มพอร์ตว่างที่ปลอดภัยจากระบบปฏิบัติการ (พอร์ต 0 หมายถึงสุ่มพอร์ต)
		await new Promise<void>((resolve) => {
			server.listen(0, () => {
				const address = server.address();
				if (address && typeof address !== 'string') {
					localServerUrl = `http://localhost:${address.port}`;
				}
				resolve();
			});
		});
	});

	// ปิดเซิร์ฟเวอร์จำลองทันทีเมื่อรันเทสทุกเคสในไฟล์นี้เสร็จสิ้น ป้องกันพอร์ตค้าง
	test.afterAll(async () => {
		await new Promise<void>((resolve) => server.close(() => resolve()));
	});

	// 1. เคสทดสอบการคลิกปุ่ม Custom
	test('ควรรับส่ง Click Event บน Custom Component ได้ถูกต้อง', async ({ page }) => {
		await page.setContent(`
			<div id="custom-btn" role="button" tabindex="0" style="cursor:pointer; padding:10px; background:blue; color:white;">Click Me</div>
			<div id="click-status">Waiting</div>
			<script>
				document.getElementById('custom-btn').addEventListener('click', () => {
					document.getElementById('click-status').innerText = 'Clicked';
				});
			</script>
		`);
		await page.click('#custom-btn');
		await expect(page.locator('#click-status')).toHaveText('Clicked');
	});

	// 2. เคสทดสอบระบบ Offline
	test('แอปพลิเคชันต้องแสดงหน้าต่างเตือนเมื่อระบบอินเทอร์เน็ต Offline', async ({ context, page }) => {
		await page.setContent(`
			<button id="fetch-data">Load Data</button>
			<div id="network-error" style="display:none;">Internet Connection Error</div>
			<script>
				document.getElementById('fetch-data').addEventListener('click', async () => {
					try { await fetch('/api/data'); } catch { document.getElementById('network-error').style.display = 'block'; }
				});
			</script>
		`);

		try {
			await context.setOffline(true);
			await page.click('#fetch-data');
			await expect(page.locator('#network-error')).toBeVisible();
		} finally {
			await context.setOffline(false);
		}
	});

	// 3. เคสทดสอบฟอร์มทั่วไป
	test('ระบบฟอร์มต้องกรอกข้อมูลและกด Submit ได้อย่างสมบูรณ์', async ({ page }) => {
		await page.setContent(`
			<form id="test-form" onsubmit="event.preventDefault(); document.getElementById('output').innerText = 'Done';">
				<input type="text" id="username" required />
				<button type="submit" id="submit-btn">Submit</button>
			</form>
			<div id="output"></div>
		`);
		await page.fill('#username', 'pitt_dev');
		await page.click('#submit-btn');
		await expect(page.locator('#output')).toHaveText('Done');
	});

	// 4. เคสทดสอบดาวน์โหลดไฟล์ (เวอร์ชันสมบูรณ์ รองรับการรันแบบ Cross-Browser เคร่งครัด)
	test('ทดสอบการดาวน์โหลดไฟล์ และตรวจสอบว่าไฟล์ถูกเขียนลงดิสก์จริง', async ({ page }) => {
		// วิ่งไปยังเซิร์ฟเวอร์ภายในเครื่องที่เราจำลองขึ้นมาจริง ๆ
		await page.goto(localServerUrl);

		const downloadLink = page.getByRole('link', { name: 'some-file.txt', exact: true });

		// ดักฟัง Event ดาวน์โหลด (รอบนี้จะทำงานฉลุยทุกเบราว์เซอร์เพราะเป็น Socket เน็ตเวิร์กจริง)
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			downloadLink.click()
		]);

		expect(download.suggestedFilename()).toBe('some-file.txt');

		const savePath = path.join(__dirname, '../downloads', download.suggestedFilename());
		await download.saveAs(savePath);

		expect(fs.existsSync(savePath)).toBe(true);

		try {
			fs.unlinkSync(savePath);
		} catch (err) {
			console.error('ไม่สามารถลบไฟล์ทดสอบได้:', err);
		}
	});

});