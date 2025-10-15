import './setup';

describe("Basic App Functionality", () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  it("should load the home page", async () => {
    await page.goto(`${baseUrl}/`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that we can access the page (no errors)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Get the current URL to verify it loaded
    const currentUrl = page.url();
    expect(currentUrl).toContain(baseUrl);
  });
});
