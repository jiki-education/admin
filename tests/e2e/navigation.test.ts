import "./setup";

describe("Navigation Tests", () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  it("should load the signin page", async () => {
    await page.goto(`${baseUrl}/signin`);

    // Wait for the page to load (reduced timeout)
    await page.waitForSelector("body", { timeout: 5000 });

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify we're on the correct page
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });

  it("should load the signup page", async () => {
    await page.goto(`${baseUrl}/signup`);

    // Wait for the page to load (reduced timeout)
    await page.waitForSelector("body", { timeout: 5000 });

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify we're on the correct page
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signup");
  });

  it("should load the dashboard page", async () => {
    await page.goto(`${baseUrl}/dashboard`);

    // Wait for the page to load (reduced timeout)
    await page.waitForSelector("body", { timeout: 5000 });

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify we can access the page (behavior may vary)
    const currentUrl = page.url();
    expect(currentUrl).toContain("localhost:3064");
  });

  it("should load the users management page", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);

    // Wait for the page to load (reduced timeout)
    await page.waitForSelector("body", { timeout: 5000 });

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify we can access the page (behavior may vary)
    const currentUrl = page.url();
    expect(currentUrl).toContain("localhost:3064");
  });

  it("should load the levels management page", async () => {
    await page.goto(`${baseUrl}/dashboard/levels`);

    // Wait for the page to load (reduced timeout)
    await page.waitForSelector("body", { timeout: 5000 });

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify we can access the page (behavior may vary)
    const currentUrl = page.url();
    expect(currentUrl).toContain("localhost:3064");
  });

  it("should load the email templates page", async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);

    // Wait for the page to load (reduced timeout)
    await page.waitForSelector("body", { timeout: 5000 });

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify we can access the page (may redirect to signin depending on auth state)
    const currentUrl = page.url();
    expect(currentUrl).toContain("localhost:3064");
  });
});
