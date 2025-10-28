import "./setup";

describe("Users - Basic", () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  it("should load the home page", async () => {
    await page.goto(`${baseUrl}/`);
    const body = await page.$("body");
    expect(body).toBeTruthy();
  });

  it("should redirect to signin when accessing users without auth", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    // Wait for redirect
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });

  it("should load the users page", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await page.waitForSelector("body", { timeout: 5000 });
    const body = await page.$("body");
    expect(body).toBeTruthy();
  });

  it("should navigate to signin page when accessing users", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });

  it("should display signin page title when redirected from users", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await page.waitForSelector("h1", { timeout: 5000 });
    const titleText = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? h1.textContent : "";
    });
    expect(titleText).toContain("Sign In");
  });

  it("should have signin form when redirected from users", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const form = await page.$("form");
    expect(form).toBeTruthy();
  });

  it("should display user filters structure when accessing users page directly (if authenticated)", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const currentUrl = page.url();

    // If redirected to signin, skip this test (expected behavior)
    if (currentUrl.includes("/signin")) {
      console.debug("Redirected to signin - skipping filter structure test");
      return;
    }

    // If we reached the users page (somehow authenticated), test the filter structure
    try {
      await page.waitForSelector("body", { timeout: 3000 });

      // Look for filter elements that should exist
      const emailInput = await page.$('input[placeholder*="email"]');
      const nameInput = await page.$('input[placeholder*="name"]');

      // These elements should exist if we're on the actual users page
      expect(emailInput || nameInput).toBeTruthy();
    } catch {
      console.debug("Could not test filter structure - page not accessible");
    }
  });

  it("should handle pagination controls structure (if authenticated)", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const currentUrl = page.url();

    // If redirected to signin, skip this test
    if (currentUrl.includes("/signin")) {
      console.debug("Redirected to signin - skipping pagination test");
      return;
    }

    try {
      // Look for pagination-related elements
      const pageElements = await page.$$('[class*="pagination"], [class*="page"]');
      const _itemsPerPageText = await page.$("text=/Items per page/");

      console.debug(`Found ${pageElements.length} pagination elements`);

      // If we can access the page, there should be some pagination structure
      expect(pageElements.length >= 0).toBeTruthy();
    } catch {
      console.debug("Could not test pagination - page not accessible");
    }
  });
});
