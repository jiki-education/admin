const config = {
  preset: "jest-puppeteer",
  testMatch: ["<rootDir>/tests/e2e/**/*.test.{js,ts}"],
  testTimeout: 8000, // Ultra-fast timeout
  maxWorkers: 6, // Maximum parallel workers for local machine
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          moduleResolution: "node",
          types: ["jest", "node", "puppeteer"]
        }
      }
    ]
  },
  testEnvironment: "jest-environment-puppeteer",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/e2e/setup.ts"],
  // Ultra-speed optimizations
  maxConcurrency: 8, // Very high concurrency for local dev
  bail: true, // Stop on first failure for speed
  verbose: false,
  silent: true, // Minimal output for maximum speed
  cache: true, // Enable Jest cache
  detectOpenHandles: false, // Skip expensive cleanup detection
  forceExit: false // Let Jest exit gracefully
};

export default config;