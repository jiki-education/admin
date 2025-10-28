import { generateSlug, isValidSlug, sanitizeSlug } from "@/lib/utils/slug";

describe("Slug Utility Functions", () => {
  test("generateSlug converts titles to URL-friendly slugs", () => {
    expect(generateSlug("Introduction to Programming")).toBe("introduction-to-programming");
    expect(generateSlug("Variables & Data Types!")).toBe("variables-data-types");
    expect(generateSlug("  Multiple   Spaces  ")).toBe("multiple-spaces");
    expect(generateSlug("Special-Characters#@$%")).toBe("special-characters");
    expect(generateSlug("123 Numbers & Letters")).toBe("123-numbers-letters");
    expect(generateSlug("")).toBe("");
    expect(generateSlug("---Multiple-Hyphens---")).toBe("multiple-hyphens");
  });

  test("isValidSlug validates proper slug format", () => {
    expect(isValidSlug("valid-slug")).toBe(true);
    expect(isValidSlug("another-valid-slug-123")).toBe(true);
    expect(isValidSlug("simple")).toBe(true);
    expect(isValidSlug("-invalid-start")).toBe(false);
    expect(isValidSlug("invalid-end-")).toBe(false);
    expect(isValidSlug("invalid--double-hyphen")).toBe(false);
    expect(isValidSlug("Invalid-Uppercase")).toBe(false);
    expect(isValidSlug("invalid spaces")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });

  test("sanitizeSlug cleans up malformed slugs", () => {
    expect(sanitizeSlug("Bad Slug!")).toBe("bad-slug");
    expect(sanitizeSlug("  ---Messy---Slug---  ")).toBe("messy-slug");
    expect(sanitizeSlug("UPPERCASE")).toBe("uppercase");
  });
});
