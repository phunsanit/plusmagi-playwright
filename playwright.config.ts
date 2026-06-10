import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,

	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.05,
		},
	},
	// Keep reporter simple for the final template view:
	reporter: [
		['list']
	],
	use: {
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'Google Chrome',
			use: { ...devices['Desktop Chrome'] },
			testMatch: '**/*.spec.ts',
			// Keep specific test ignores for structured testing separation
			testIgnore: ['**/browser-mozilla-firefox-gecko/**', '**/browser-apple-safari-webkit*/**'],
		},
		{
			name: 'Mozilla Firefox',
			use: { ...devices['Desktop Firefox'] },
			testMatch: '**/*.spec.ts',
			testIgnore: ['**/browser-google-chrome-chromium/**', '**/browser-apple-safari-webkit*/**'],
		},
		{
			name: 'Apple Safari',
			use: { ...devices['Desktop Safari'] },
			testMatch: '**/*.spec.ts',
			testIgnore: ['**/browser-google-chrome-chromium/**', '**/browser-mozilla-firefox-gecko/**'],
		}
	],
});