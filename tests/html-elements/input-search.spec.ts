//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML search input validation (type="search").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search
 */
test('Search input must handle autocomplete suggestions, clear state, and structured query parameters', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/search');
	const searchSelector = '#search-input';
	const suggestionSelector = '.autocomplete-suggestion';

	// --- 1. Attribute Validation Checks (Required Attributes) ---

	// Test: Mandatory Autocomplete Attribute.
	await expect(page.locator(searchSelector)).toHaveAttribute('autocomplete', 'search');

	// Test: Pattern validation for general search characters (if applicable).
	await expect(page.locator(searchSelector)).toHaveAttribute('pattern', '.+'); // Usually non-restrictive, but good to confirm.

	// --- 2. Event Validation Checks (Focus & Blur) ---

	// Test Focus: Ensure focus state correctly activates the suggestion dropdown mechanism.
	await page.focus(searchSelector);
	// Check that the initial suggestion area is visible upon focusing.
	await expect(page.locator(suggestionSelector)).toBeVisible();

	// Test Blur & State Persistence: Simulate losing focus while having input, ensuring suggestions clear gracefully if no search was executed.
	await page.fill(searchSelector, 'PartialQuery'); // Type partial text
	await page.blur(searchSelector);
	// Assert that the UI handles the blur by clearing irrelevant suggestions or resetting to default.
	await expect(page.locator(suggestionSelector)).toHaveCount(0);

	// --- 3. Common Use Case Validation Tests (Suggestions & Search Execution) ---

	// Test A: Autocompletion Logic.
	await page.fill(searchSelector, 'Data'); // Type trigger characters
	await expect(suggestionSelector).toHaveText('Database Records'); // Check suggestion availability.

	// Simulate selecting the best match from the dropdown (preferred over Enter).
	await page.locator(suggestionSelector).click();
	// This click should programmatically fill the field AND trigger search execution if necessary, leading to a dedicated results URL.
	await expect(page).toHaveURL(/search\/results\?query=Database%20Records/);

	// Test B: Clearing Search History.
	await page.fill(searchSelector, 'OldSearchTerm'); // Populate history state
	// Assume a 'Clear' button exists for controlled clearing.
	const clearButton = page.locator('#clear-search');
	await expect(clearButton).toBeVisible();
	await clearButton.click();
	await expect(page.locator(searchSelector)).toHaveValue(''); // Should reset the input field.
});

