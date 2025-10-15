import './setup';

describe('Route Discovery Validation', () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";

  // Expected routes based on the E2E expansion plan
  const expectedRoutes = [
    '/',
    '/signin',
    '/signup', 
    '/dashboard',
    '/dashboard/users',
    '/dashboard/levels',
    '/dashboard/email-templates'
  ];

  it('should have all expected routes accessible without errors', async () => {
    // Test each expected route
    for (const route of expectedRoutes) {
      await page.goto(`${baseUrl}${route}`);
      
      // Wait for the page to load
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Check that we can access the page (no errors)
      const body = await page.$('body');
      expect(body).toBeTruthy();

      // Check that we don't get a 404 page
      const title = await page.title();
      expect(title).not.toContain('404');
      expect(title).not.toContain('Not Found');
    }
  });

  it('should handle non-existent routes gracefully', async () => {
    const nonExistentRoute = '/this-route-does-not-exist';
    
    await page.goto(`${baseUrl}${nonExistentRoute}`);
    
    // Wait for page load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check that the page loads without errors (body exists)
    const body = await page.$('body');
    expect(body).toBeTruthy();
    
    // Verify the URL stayed on the non-existent route (Next.js default behavior)
    const currentUrl = page.url();
    expect(currentUrl).toBe(`${baseUrl}${nonExistentRoute}`);
  });
});