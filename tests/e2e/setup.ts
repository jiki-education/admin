// E2E test setup
// jest-puppeteer provides global variables, this file ensures proper typing

import type { Browser, Page } from "puppeteer";

declare global {
  var page: Page;
  var browser: Browser;
  var context: any;
  var jestPuppeteer: {
    debug: () => void;
    resetPage: () => Promise<void>;
    resetBrowser: () => Promise<void>;
  };
}

// Export to make this a module
export {};
