const config = {
  preset: "jest-puppeteer",
  testMatch: ["<rootDir>/tests/e2e/**/*.test.{js,ts}"],
  testTimeout: 30000, // Longer timeout for CI environment
  maxWorkers: 2, // Conservative workers for CI
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
  // CI-optimized settings
  maxConcurrency: 2, // Conservative for CI stability
  bail: false, // Don't stop on first failure in CI
  verbose: true, // More output for CI debugging
  cache: false, // Disable cache in CI for consistency
  detectOpenHandles: true, // Help debug CI issues
  forceExit: false,
  // CI-specific settings
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
  testResultsProcessor: undefined // Clean results for CI
};

export default config;
