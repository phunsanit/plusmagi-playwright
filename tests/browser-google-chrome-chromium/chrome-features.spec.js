import { test, expect } from '@playwright/test';
test.describe('Chrome Specific Features', () => {
    test('ทดสอบระบบจำลองพิกัด GPS (Geolocation) บน Chrome', async ({ context, page }) => {
        const mockOrigin = 'http://localhost:3000';
        await context.grantPermissions(['geolocation'], { origin: mockOrigin });
        await context.setGeolocation({ latitude: 18.7883, longitude: 98.9853 });
        await page.route(mockOrigin, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: `
					<html>
						<body>
							<h3>ระบบทดสอบพิกัด GPS</h3>
							<button id="get-location">Where am I?</button>
							<div id="result">
								Latitude: <span id="latval"></span><br>
								Longitude: <span id="longval"></span>
							</div>
							<script>
								document.getElementById('get-location').addEventListener('click', () => {
									if (!navigator.geolocation) return;
									navigator.geolocation.getCurrentPosition((position) => {
										document.getElementById('latval').innerText = position.coords.latitude;
										document.getElementById('longval').innerText = position.coords.longitude;
									});
								});
							</script>
						</body>
					</html>
				`
            });
        });
        await page.goto(mockOrigin);
        await page.locator('#get-location').click();
        await expect(page.locator('#latval')).toHaveText('18.7883', { timeout: 3000 });
        await expect(page.locator('#longval')).toHaveText('98.9853', { timeout: 3000 });
    });
});
