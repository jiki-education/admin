/**
 * Sanity Check Test Suite
 * Ensures all pages can be imported and rendered without errors
 */

import { render, act } from "@testing-library/react";

// Mock API functions - use fast resolving promises to prevent timing issues
function fastResolve(value: unknown) {
  return jest.fn().mockImplementation(() => Promise.resolve(value));
}

jest.mock("@/lib/api/levels", () => ({
  getLevels: fastResolve({ results: [], meta: { current_page: 1, total_pages: 1, total_count: 0 } }),
  getLevel: fastResolve({ id: 1, title: "Test Level", slug: "test-level", description: "Test", position: 1 }),
  getLevelLessons: fastResolve([]),
  getLesson: fastResolve({
    id: 1,
    title: "Test Lesson",
    slug: "test-lesson",
    description: "Test",
    type: "exercise",
    data: {}
  }),
  updateLesson: fastResolve({}),
  createLesson: fastResolve({}),
  createLevel: fastResolve({}),
  getAdminLevels: fastResolve({ results: [], meta: { current_page: 1, total_pages: 1, total_count: 0 } })
}));

jest.mock("@/lib/api/users", () => ({
  getUsers: fastResolve({ results: [], meta: { current_page: 1, total_pages: 1, total_count: 0 } })
}));

jest.mock("@/lib/api/email-templates", () => ({
  getEmailTemplates: fastResolve({ results: [], meta: { current_page: 1, total_pages: 1, total_count: 0 } }),
  getEmailTemplate: fastResolve({ id: 1, subject: "Test", body: "Test body", template_type: "welcome" }),
  getEmailTemplateTypes: fastResolve([]),
  updateEmailTemplate: fastResolve({}),
  createEmailTemplate: fastResolve({}),
  getEmailTemplatesSummary: fastResolve({ results: [], meta: { current_page: 1, total_pages: 1, total_count: 0 } })
}));

// Mock hooks
jest.mock("@/hooks/useModal", () => ({
  useModal: () => ({
    isOpen: false,
    open: jest.fn(),
    close: jest.fn()
  })
}));

// Mock auth components
jest.mock("@/components/auth/SignInForm", () => {
  return function MockSignInForm() {
    return React.createElement("div", { "data-testid": "signin-form" }, "Sign In Form");
  };
});

// Add React import for the mocks
import React from "react";

// Helper function to test component rendering without throwing
async function expectRenderWithoutError(Component: React.ComponentType) {
  let error: Error | null = null;
  try {
    await act(async () => {
      render(<Component />);
      // Allow time for all async state updates to complete
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  } catch (e) {
    error = e as Error;
  }
  expect(error).toBeNull();
}

describe("Pages Sanity Check", () => {
  describe("Public Pages", () => {
    test("Home page (/) renders without errors", async () => {
      const HomePage = (await import("@/app/page")).default;
      await expectRenderWithoutError(HomePage);
    });

    test("Sign In page renders without errors", async () => {
      const SignInPage = (await import("@/app/signin/page")).default;
      await expectRenderWithoutError(SignInPage);
    });
  });

  describe("Dashboard Pages", () => {
    test("Dashboard home page renders without errors", async () => {
      const DashboardPage = (await import("@/app/dashboard/page")).default;
      await expectRenderWithoutError(DashboardPage);
    });

    test("Users page renders without errors", async () => {
      const UsersPage = (await import("@/app/dashboard/users/page")).default;
      await expectRenderWithoutError(UsersPage);
    });

    test("Email Templates page renders without errors", async () => {
      const EmailTemplatesPage = (await import("@/app/dashboard/email-templates/page")).default;
      await expectRenderWithoutError(EmailTemplatesPage);
    });

    test("Email Template Edit page renders without errors", async () => {
      const EmailTemplateEditPage = (await import("@/app/dashboard/email-templates/edit/[id]/page")).default;
      await expectRenderWithoutError(EmailTemplateEditPage);
    });
  });

  describe("Levels Pages", () => {
    test("Levels list page renders without errors", async () => {
      const LevelsPage = (await import("@/app/dashboard/levels/page")).default;
      await expectRenderWithoutError(LevelsPage);
    });

    test("New Level page renders without errors", async () => {
      const NewLevelPage = (await import("@/app/dashboard/levels/new/page")).default;
      await expectRenderWithoutError(NewLevelPage);
    });

    test("Level detail page renders without errors", async () => {
      const LevelDetailPage = (await import("@/app/dashboard/levels/[id]/page")).default;
      await expectRenderWithoutError(LevelDetailPage);
    });

    test("New Lesson page renders without errors", async () => {
      const NewLessonPage = (await import("@/app/dashboard/levels/[id]/lessons/new/page")).default;
      await expectRenderWithoutError(NewLessonPage);
    });

    test("Edit Lesson page renders without errors", async () => {
      const EditLessonPage = (await import("@/app/dashboard/levels/[id]/lessons/[lessonId]/edit/page")).default;
      await expectRenderWithoutError(EditLessonPage);
    });
  });

  describe("Import Validation", () => {
    test("Core page components can be imported without throwing", async () => {
      const corePageImports = [
        import("@/app/page"),
        import("@/app/signin/page"),
        import("@/app/dashboard/page"),
        import("@/app/dashboard/users/page"),
        import("@/app/dashboard/email-templates/page"),
        import("@/app/dashboard/levels/page"),
        import("@/app/dashboard/levels/new/page")
      ];

      // Core imports should resolve without throwing
      const results = await Promise.all(corePageImports);

      // Each import should have a default export (the page component)
      results.forEach((module) => {
        expect(module.default).toBeDefined();
        expect(typeof module.default).toBe("function");
      });
    });

    test("Dynamic route pages can be imported", async () => {
      // Test individual dynamic route imports
      const emailEditModule = await import("@/app/dashboard/email-templates/edit/[id]/page");
      expect(emailEditModule.default).toBeDefined();
      expect(typeof emailEditModule.default).toBe("function");

      const levelDetailModule = await import("@/app/dashboard/levels/[id]/page");
      expect(levelDetailModule.default).toBeDefined();
      expect(typeof levelDetailModule.default).toBe("function");

      const newLessonModule = await import("@/app/dashboard/levels/[id]/lessons/new/page");
      expect(newLessonModule.default).toBeDefined();
      expect(typeof newLessonModule.default).toBe("function");
    });
  });

  describe("Authentication Integration", () => {
    test("Protected pages handle authentication gracefully", async () => {
      const DashboardPage = (await import("@/app/dashboard/page")).default;

      // Should not throw (auth is handled by useRequireAuth hook)
      await expectRenderWithoutError(DashboardPage);
    });

    test("Auth-protected pages render without errors", async () => {
      const UsersPage = (await import("@/app/dashboard/users/page")).default;

      // Should render without throwing
      await expectRenderWithoutError(UsersPage);
    });
  });

  describe("Route Parameters", () => {
    test("Dynamic route pages handle parameters gracefully", async () => {
      const LevelDetailPage = (await import("@/app/dashboard/levels/[id]/page")).default;

      // Should not throw (params are handled by the pages)
      await expectRenderWithoutError(LevelDetailPage);
    });

    test("Complex dynamic routes handle parameters gracefully", async () => {
      const EditLessonPage = (await import("@/app/dashboard/levels/[id]/lessons/[lessonId]/edit/page")).default;

      // Should not throw (params are handled by the pages)
      await expectRenderWithoutError(EditLessonPage);
    });
  });
});
