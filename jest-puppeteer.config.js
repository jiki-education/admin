module.exports = {
  launch: {
    headless: process.env.HEADLESS !== "false",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor"
    ],
    // Performance optimizations
    defaultViewport: { width: 1280, height: 720 }, // Smaller than default
    slowMo: 0, // No artificial delays
    devtools: false // Disable devtools for speed
  },
  ...(process.env.SKIP_SERVER !== "true" && {
    server: {
      command: "next dev --port 3064",
      port: 3064,
      launchTimeout: 10000,
      debug: true
    }
  })
};
