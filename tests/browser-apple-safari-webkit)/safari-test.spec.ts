import { test, expect } from '@playwright/test';

test.describe('Safari WebKit Specific Features', () => {

  // เคสที่ 1: ตรวจสอบเรื่อง Case-Insensitive และขนาด Bounding Box (เวอร์ชันเสถียร ไม่พึ่งเว็บนอก)
  test('1. ทดสอบการแสดงผลและตรวจจับปุ่มแบบ Case-Insensitive และยืดหยุ่นบน Safari', async ({ page }) => {
	await page.setContent(`
	  <html>
		<body>
		  <div style="padding: 20px;">
			<a href="#info" style="text-transform: uppercase; display: inline-block; padding: 10px;">
			  More Information
			</a>
		  </div>
		</body>
	  </html>
	`);

	// ใช้ Regular Expression ค้นหาตัวอักษรโดยไม่สนพิมพ์เล็ก-พิมพ์ใหญ่
	const moreInfoLink = page.getByRole('link', { name: /more information/i });

	// ตรวจสอบความพร้อมในการมองเห็น และขนาดกล่องเรนเดอร์
	await expect(moreInfoLink).toBeVisible();
	const box = await moreInfoLink.boundingBox();
	expect(box?.width).toBeGreaterThan(0);
	expect(box?.height).toBeGreaterThan(0);
  });

  // เคสที่ 3: เก็บไว้เพราะเป็นพฤติกรรมเฉพาะทางของ WebKit Engine
  test('2. ทดสอบมาตรฐานการแปลงรูปแบบวันที่ (Date Parsing) บน WebKit Engine', async ({ page }) => {
	await page.setContent(`
		<html>
			<body>
				<div id="date-output"></div>
				<script>
					try {
						// ใช้ฟอร์มแมตที่ปลอดภัยสำหรับทุกเบราว์เซอร์รวมถึง WebKit (Safari จะไม่ชอบฟอร์มแมตแบบขีด -)
						const targetDate = new Date('2026/06/09');
						if (isNaN(targetDate.getTime())) {
							document.getElementById('date-output').innerText = 'Error: Invalid Date';
						} else {
							document.getElementById('date-output').innerText = 'Year: ' + targetDate.getFullYear();
						}
					} catch (e) {
						document.getElementById('date-output').innerText = 'Error: ' + e.message;
					}
				</script>
			</body>
		</html>
	`);

	const dateResult = page.locator('#date-output');
	await expect(dateResult).toHaveText('Year: 2026');
  });

});