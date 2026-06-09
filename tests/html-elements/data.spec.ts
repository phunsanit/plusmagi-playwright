"//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data

import { test, expect } from '@playwright/test';

/**
 * Test Suite for custom data attributes (data-*). \n * This tests how ancillary metadata is passed between front-end components and backend handlers.\n * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data#data-\*attributes\n
 * NOTE: Validation relies heavily on global context attributes (see global-attributes.spec.ts) to ensure data-* values are read correctly by JS.*\n */
test('Data attributes must pass serialization data and integrate with global attribute checks', async ({ page }) => {
	await page.goto('https://staging.mock-website.com/product-view');
	const productSelector = '#main-product-card';
	const skuAttributeSelector = '[data-sku]';

	// --- 1. Structural Validation: Attribute Existence ---\n\n	await expect(page.locator(productSelector)).toHaveAttribute('data-product-id'); // Check mandated structural attribute.\n	await expect(page.locator(skuAttributeSelector)).toHaveAttribute('data-sku', 'SKU-987654');

	// --- 2. Contextual Validation: Reading Data in conjunction with ARIA/Labels ---\n
	// Test Case: Using data attributes to provide context for an aria-describedby dependency.\n	await page.evaluate(() => { \n		const input = document.getElementById('username'); // Assume this is a primary field.\n		if (input) { \n			input.setAttribute('aria-details', 'This name belongs to product ' + 'CUST123' ); // Using data attribute for ARIA context.\n			// Also set a visible help text that the global test relies on.\n			document.getElementById('username-help').textContent = 'Helpful description based on data-sku.'; \n		}\n	});

	await expect(page.locator('#username')).toHaveAttribute('aria-describedby', '#name-help'); // Check ARIA linkage.\n	// Verify that the help text explicitly references the data state (Integration point).\n	const actualHelp = await page.textContent('#name-help'); \n	expect(actualHelp).toContain('SKU-987654');


	// --- 3. Serialization Test: Ensuring complex objects are passed correctly and read by JS ---\n
	const complexMetadata = JSON.stringify({ weight_kg: 1.2, dimensions: '10x20' });
	await page.evaluate(() => { element.setAttribute('data-metadata', complexMetadata); }, productSelector); // Re-set the known attribute.\n
	// Final read validation, proving data integrity across all layers.\n	const finalData = await page.getAttribute(productSelector, 'data-metadata');\n	expect(JSON.parse(finalData).weight_kg).toBe(1.2); \n});"
