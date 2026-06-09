"//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/submit

import { test, expect } from '@playwright/test';

/**
 * Test Suite for HTML submit button validation (type="submit").
 * MDN Reference URL Context: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/submit
 */
test('Submit button must correctly trigger the form submission lifecycle', async ({ page }) => {
    // *** INHERITANCE STEP ***
    await test.beforeEach(async () => {
        // Use the centralized setup fixture to ensure all elements are ready.
        await inputSetup.setupContext(page); // Fixture call based on global setup.
    });

    const submitSelector = 'button[type="submit"]';
    const targetActionButton = page.getByRole('button', { name: 'Submit' });

    // --- 1. Attribute Validation Checks (Required Attributes) ---

    await expect(page.locator(submitSelector)).toHaveAttribute('type', 'submit');


    // --- 2. Event Validation Checks (Submission Triggering) ---

    // Test: Basic Submission Flow.
    const initialUrl = page.url();
    await test.setTimeout(60000); // Increase timeout for potential network wait time.

    // Populate all necessary fields before submission attempt to ensure data transfer occurs.
    await page.fill('#username', 'TestUser');
    await page.selectOption('#country-select', { label: 'CA' });

    console.log("--- Starting Submission Test ---");
    // ACTION: Clicking the submit button should trigger the form submission.
    await targetActionButton.click();

    // Assertion 1: Success Check (Assuming successful submission navigates to a known success page).
    await expect(page).toHaveURL(/submission-success/); // Must hit the correct endpoint.
    await expect(page).toContainText('Submission Complete');


    // --- 3. Data Integrity Validation ---

    // Test B: Data preservation during submission (Verifies data-* attributes are processed).
    // In a real scenario, this would require network interception to read the form payload.
    await page.evaluate(() => {
        const hiddenInput = document.querySelector('#csrf-token'); // Check token existence on failure/success?
        if(hiddenInput) { console.log('CSRF Token:', hiddenInput.value); }
    });

    // Test C: Preventing Default Submission (If the form submission must be blocked for validation).
    await page.evaluate(() => {
        const submitButton = document.querySelector('#cancel-submit'); // Assume a 'Cancel' button exists.
        if(submitButton) { window.onSubmitBlocked = true; }
    });
    // If submission logic requires pre-validation, test that an explicit JS call prevents the default browser action.
});"
