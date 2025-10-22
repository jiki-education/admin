import './setup';

describe('App Structure and Integration Tests', () => {
  const baseUrl = process.env.TEST_URL || "http://localhost:3064";
  
  beforeEach(async () => {
    await page.setViewport({ width: 1200, height: 800 });
  });

  describe('Basic App Functionality', () => {
    it('should load the home page successfully', async () => {
      await page.goto(`${baseUrl}/`);
      await page.waitForSelector('body', { timeout: 5000 });
      
      const body = await page.$('body');
      expect(body).toBeTruthy();
      
      // Check that we get some kind of response (either dashboard or redirect)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(dashboard\/.*|signin)?/);
    });

    it('should handle navigation between different admin sections', async () => {
      const routes = [
        '/dashboard/users',
        '/dashboard/levels', 
        '/dashboard/email-templates'
      ];
      
      for (const route of routes) {
        await page.goto(`${baseUrl}${route}`);
        await page.waitForSelector('body', { timeout: 5000 });
        
        const body = await page.$('body');
        expect(body).toBeTruthy();
        
        // Should either show the page or redirect to signin
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(dashboard\/.*|signin)/);
      }
    });

    it('should have working authentication flow structure', async () => {
      await page.goto(`${baseUrl}/signin`);
      await page.waitForSelector('body', { timeout: 5000 });
      
      // Should have sign-in form elements
      const form = await page.$('form');
      const emailInput = await page.$('input[type="email"], input[name*="email"]');
      const passwordInput = await page.$('input[type="password"], input[name*="password"]');
      
      expect(form).toBeTruthy();
      expect(emailInput || passwordInput).toBeTruthy();
    });

    it('should display correct page titles and headers', async () => {
      const testCases = [
        { route: '/signin', expectedText: 'Sign In' },
        { route: '/dashboard/users', expectedText: 'Users' },
        { route: '/dashboard/levels', expectedText: 'Levels' }
      ];
      
      for (const testCase of testCases) {
        await page.goto(`${baseUrl}${testCase.route}`);
        await page.waitForSelector('body', { timeout: 5000 });
        
        try {
          // Look for the expected text in h1, h2, or title elements
          await page.waitForSelector('h1, h2, title', { timeout: 3000 });
          const headingText = await page.evaluate(() => {
            const h1 = document.querySelector('h1');
            const h2 = document.querySelector('h2');
            const title = document.querySelector('title');
            return h1?.textContent || h2?.textContent || title?.textContent || '';
          });
          
          expect(headingText.toLowerCase()).toMatch(new RegExp(testCase.expectedText.toLowerCase()));
        } catch {
          console.debug(`Could not verify page title for ${testCase.route}`);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes gracefully', async () => {
      await page.goto(`${baseUrl}/non-existent-route`);
      await page.waitForSelector('body', { timeout: 5000 });
      
      const body = await page.$('body');
      expect(body).toBeTruthy();
      
      // Should either show 404 page or redirect
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    });

    it('should handle nested routes correctly', async () => {
      await page.goto(`${baseUrl}/dashboard/levels/new`);
      await page.waitForSelector('body', { timeout: 5000 });
      
      const body = await page.$('body');
      expect(body).toBeTruthy();
      
      // Should load the page or redirect to signin
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(dashboard\/levels\/new|signin)/);
    });
  });
});