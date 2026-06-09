//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data

import { test, expect } from '@playwright/test';

/**
 * Test Suite for custom data attributes (data-*).
 * This tests how ancillary metadata is passed between front-end components and backend handlers.
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data#data-\*attributes

 * NOTE: Validation relies heavily on global context attributes (see global-attributes.spec.ts) to ensure data-* values are read correctly by JS.*
 */
test('Data attributes must pass serialization data and integrate with global attribute checks', async ({ page }) => {
	await page.setContent(`
		<div id="main-product-card" data-product-id="PROD-001">
			<span data-sku="SKU-987654"></span>
		</div>
		<input id="username" />
		<div id="username-help"></div>
		<div id="name-help"></div>
	`);
	const productSelector = '#main-product-card';
	const skuAttributeSelector = '[data-sku]';

	// --- 1. Structural Validation: Attribute Existence ---

	await expect(page.locator(productSelector)).toHaveAttribute('data-product-id'); // Check mandated structural attribute.
	await expect(page.locator(skuAttributeSelector)).toHaveAttribute('data-sku', 'SKU-987654');

	// --- 2. Contextual Validation: Reading Data in conjunction with ARIA/Labels ---

	// Test Case: Using data attributes to provide context for an aria-describedby dependency.
	await page.evaluate(() => {
		const input = document.getElementById('username'); // Assume this is a primary field.
		if (input) {
			input.setAttribute('aria-describedby', '#name-help'); // Using data attribute for ARIA context.
			// Also set a visible help text that the global test relies on.
			document.getElementById('name-help')!.textContent = 'Helpful description based on SKU-987654.';
		}
	});

	await expect(page.locator('#username')).toHaveAttribute('aria-describedby', '#name-help'); // Check ARIA linkage.
	// Verify that the help text explicitly references the data state (Integration point).
	const actualHelp = await page.textContent('#name-help');
	expect(actualHelp).toContain('SKU-987654');


	// --- 3. Serialization Test: Ensuring complex objects are passed correctly and read by JS ---

	const complexMetadata = JSON.stringify({ weight_kg: 1.2, dimensions: '10x20' });
	await page.locator(productSelector).evaluate((node, meta) => {
		node.setAttribute('data-metadata', meta);
	}, complexMetadata);

	// Final read validation, proving data integrity across all layers.
	const finalData = await page.getAttribute(productSelector, 'data-metadata');
	expect(JSON.parse(finalData).weight_kg).toBe(1.2);
});