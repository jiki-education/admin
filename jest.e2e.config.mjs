const config = {
  preset: "jest-puppeteer",
  testMatch: ["<rootDir>/tests/e2e/**/*.test.{js,ts}"],
  testTimeout: 10000, // Aggressive timeout for speed
  maxWorkers: 4, // Optimized for single machine (increased from 2)
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
  // High performance optimizations (now default)
  maxConcurrency: 6, // Higher concurrency for local development
  bail: false, // Don't stop on first failure
  verbose: false,
  cache: true, // Enable Jest cache
  detectOpenHandles: false // Skip expensive cleanup detection
};

export default config;
