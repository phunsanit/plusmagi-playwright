import { test, expect } from '@playwright/test';
import { ApiClient } from './api-utils';

/**
 * Test Example: Combines backend API contract validation with UI interaction.
 * This demonstrates the full power of the template.
 */
test('Should validate user via API, then verify login success on the GUI', async ({ page }) => {
	// 1. API VALIDATION (The Backend Contract Check)
	const TEST_USER_API = 'https://api.mock-backend.com/users/999';
	let user;

try {
		user = await ApiClient.get(TEST_USER_API);
		// Assert that the API returned a valid, expected structure.
		expect(user).toHaveProperty('username');
	} catch (e) {
		// If API fails, we fail the test immediately with a clear message.
		throw new Error(`[FATAL] Cannot run UI test: API Pre-check failed for ${TEST_USER_API}. Check networking or credentials.`);
	}

	// 2. UI VALIDATION (The Frontend Test)
	await page.goto('https://staging.mock-website.com/login');
		// Use data retrieved from the successful API call.
		await page.fill('#username', user.username);
		await page.fill('#password', 'secure_password123');
		await page.click('button:has-text(\'Login\')');
	// Assert final UI state using data validated in Step 1.
	await expect(page.locator('.user-profile h1')).toHaveText(`Welcome back, ${user.username}`);
});