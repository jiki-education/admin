// Type definitions for jest-puppeteer globals
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

export {};
