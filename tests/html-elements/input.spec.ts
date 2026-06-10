//https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input

import { test, expect } from '@playwright/test';
import { handleReportFailure } from '../utils/report-generator'; // For consistent reporting.



/**
 * MASTER SANITY CHECK: This file now contains comprehensive tests for BOTH general
 * input element validation (type safety) AND overall <form> structure validation (attributes).
 */
import { inputSetup } from './shared-setup';
