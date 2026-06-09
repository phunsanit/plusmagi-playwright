/**
 * Shared TypeScript definitions used across the background service worker.
 */

// --- MOCK BROWSER API TYPES FOR DEVELOPMENT SAFETY ---

type BrowserApi = {
    runtime: {
        onInstalled: { addListener: (callback: () => void) => void };
        lastError: { message: string };
    };
    tabs: {
        query: (...args: any[]) => Promise<any[]>;
        onUpdated: { addListener: (callback: (tabId: number, changeInfo: chrome.tabs.update.TabUpdateInfo, tab: chrome.tabs.Tab) => void) => void };
    };
};

// --- INTERFACE DEFINITIONS ---

type Tab = {
  id: number;
  url?: string;
  title?: string;
  active: boolean;
};

/**
 * Placeholder for robust storage interface, mimicking chrome.storage.
 */
interface Storage {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}

// Mock the global browser object for local development/testing compilation (if not in a real extension context)
declare var chrome: BrowserApi;
