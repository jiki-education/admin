import { getAdminConcepts, getAdminConcept, createConcept, updateConcept, deleteConcept } from "@/lib/api/concepts";
import { api } from "@/lib/api/client";
import type { CreateConceptData, UpdateConceptData } from "@/app/dashboard/concepts/types";

// Mock the API client
jest.mock("@/lib/api/client", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("Concepts API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAdminConcepts sends correct API request and returns concepts list", async () => {
    const mockResponse = {
      data: {
        results: [
          {
            id: 1,
            title: "Variables",
            slug: "variables",
            description: "Learn about variables",
            content_markdown: "# Variables\nContent here"
          }
        ],
        meta: {
          current_page: 1,
          total_pages: 5,
          total_count: 50
        }
      }
    };

    mockApi.get.mockResolvedValue(mockResponse);

    const result = await getAdminConcepts({ title: "var", page: 1 });

    expect(mockApi.get).toHaveBeenCalledWith("/admin/concepts", {
      params: { title: "var", page: "1" }
    });

    expect(result).toEqual(mockResponse.data);
  });

  test("getAdminConcept sends correct API request and returns single concept", async () => {
    const mockResponse = {
      data: {
        concept: {
          id: 1,
          title: "Variables",
          slug: "variables",
          description: "Learn about variables",
          content_markdown: "# Variables\nContent here"
        }
      }
    };

    mockApi.get.mockResolvedValue(mockResponse);

    const result = await getAdminConcept(1);

    expect(mockApi.get).toHaveBeenCalledWith("/admin/concepts/1");
    expect(result).toEqual(mockResponse.data.concept);
  });

  test("createConcept sends correct API request and returns new concept", async () => {
    const conceptData: CreateConceptData = {
      title: "Functions",
      description: "Learn about functions",
      content_markdown: "# Functions\nContent here"
    };

    const mockResponse = {
      data: {
        concept: {
          id: 2,
          title: "Functions",
          slug: "functions",
          description: "Learn about functions",
          content_markdown: "# Functions\nContent here"
        }
      }
    };

    mockApi.post.mockResolvedValue(mockResponse);

    const result = await createConcept(conceptData);

    expect(mockApi.post).toHaveBeenCalledWith("/admin/concepts", {
      concept: conceptData
    });

    expect(result).toEqual(mockResponse.data.concept);
  });

  test("updateConcept sends correct API request and returns updated concept", async () => {
    const conceptData: UpdateConceptData = {
      title: "Updated Functions",
      slug: "updated-functions",
      description: "Updated description"
    };

    const mockResponse = {
      data: {
        concept: {
          id: 2,
          title: "Updated Functions",
          slug: "updated-functions",
          description: "Updated description",
          content_markdown: "# Functions\nContent here"
        }
      }
    };

    mockApi.patch.mockResolvedValue(mockResponse);

    const result = await updateConcept(2, conceptData);

    expect(mockApi.patch).toHaveBeenCalledWith("/admin/concepts/2", {
      concept: conceptData
    });

    expect(result).toEqual(mockResponse.data.concept);
  });

  test("deleteConcept sends correct API request", async () => {
    mockApi.delete.mockResolvedValue({ data: null });

    await deleteConcept(2);

    expect(mockApi.delete).toHaveBeenCalledWith("/admin/concepts/2");
  });

  test("API functions handle errors properly", async () => {
    const apiError = new Error("API Error: Concept not found");
    mockApi.get.mockRejectedValue(apiError);

    await expect(getAdminConcept(999)).rejects.toThrow("API Error: Concept not found");
  });
});