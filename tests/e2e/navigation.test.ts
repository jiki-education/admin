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

  it("should redirect to signin when accessing dashboard without auth", async () => {
    await page.goto(`${baseUrl}/dashboard`);

    // Wait for redirect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify redirect to signin
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });

  it("should redirect to signin when accessing users without auth", async () => {
    await page.goto(`${baseUrl}/dashboard/users`);

    // Wait for redirect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify redirect to signin
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });

  it("should redirect to signin when accessing levels without auth", async () => {
    await page.goto(`${baseUrl}/dashboard/levels`);

    // Wait for redirect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify redirect to signin
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });

  it("should redirect to signin when accessing email templates without auth", async () => {
    await page.goto(`${baseUrl}/dashboard/email-templates`);

    // Wait for redirect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check that we can access the page (no errors)
    const body = await page.$("body");
    expect(body).toBeTruthy();

    // Verify redirect to signin
    const currentUrl = page.url();
    expect(currentUrl).toContain("/signin");
  });
});
