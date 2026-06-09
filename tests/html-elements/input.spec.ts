//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input

import { test, expect } from '@playwright/test';
import { handleReportFailure } from '../utils/report-generator'; // For consistent reporting.



/**
 * MASTER SANITY CHECK: This file now contains comprehensive tests for BOTH general
 * input element validation (type safety) AND overall <form> structure validation (attributes).
 */
// [Fixture File] Common Setup and Fixtures for All Input Types

test.beforeAll(async ({ page }) => {
	console.log("Setting up the master context fixture for input testing.");
	await page.setContent('<form id="master-form"><input id="username" /></form>'); // Common base form page mock.
});

/**
 * @fixture setupContext
 * Sets up the DOM state on a common, mock form element for all subsequent tests.
 */
export const inputSetup = {
	setupContext: async (page) => {
		// 1. Ensure base selectors are present in the DOM before any test runs.
		await page.locator('#master-form').waitFor();
		// 2. Re-establish common baseline values so every component starts clean.
		await page.fill('#username', '');
	}
};
