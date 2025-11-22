import { uploadImage, ImageUploadError } from "@/lib/api/images";
import { getToken, removeToken } from "@/lib/auth/storage";
import { getApiUrl } from "@/lib/api/config";

// Mock dependencies
jest.mock("@/lib/auth/storage");
jest.mock("@/lib/api/config");

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockRemoveToken = removeToken as jest.MockedFunction<typeof removeToken>;
const mockGetApiUrl = getApiUrl as jest.MockedFunction<typeof getApiUrl>;

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Image Upload API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApiUrl.mockReturnValue("http://localhost:3000/admin/images");
  });

  describe("uploadImage", () => {
    const mockFile = new File(["test image content"], "test.jpg", { type: "image/jpeg" });

    test("successfully uploads image and returns CDN URL", async () => {
      const mockToken = "mock-jwt-token";
      const mockResponse = { url: "https://assets.jiki.io/production/images/hash123/uuid456.jpg" };

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await uploadImage(mockFile);

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockGetApiUrl).toHaveBeenCalledWith("/admin/images");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/admin/images",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${mockToken}`
          },
          body: expect.any(FormData)
        }
      );

      // Verify FormData contains the file
      const formData = (mockFetch as jest.Mock).mock.calls[0][1].body;
      expect(formData.get("image")).toBe(mockFile);

      expect(result).toBe(mockResponse.url);
    });

    test("throws error when no authentication token is available", async () => {
      mockGetToken.mockReturnValue(null);

      await expect(uploadImage(mockFile)).rejects.toThrow(
        "Authentication token required for image upload"
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("throws ImageUploadError for 422 validation errors", async () => {
      const mockToken = "mock-jwt-token";
      const mockErrorResponse = { error: "Image file size exceeds maximum of 5MB" };

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue(mockErrorResponse)
      });

      await expect(uploadImage(mockFile)).rejects.toThrow(ImageUploadError);
      await expect(uploadImage(mockFile)).rejects.toThrow(
        "Image Upload Error: 422 Unprocessable Entity"
      );
    });

    test("throws ImageUploadError for 401 unauthorized and clears token", async () => {
      const mockToken = "invalid-token";
      const mockErrorResponse = { error: "Unauthorized" };

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({ "content-type": "application/json" }),
        json: jest.fn().mockResolvedValue(mockErrorResponse)
      });

      await expect(uploadImage(mockFile)).rejects.toThrow(ImageUploadError);
      
      // Verify token was cleared
      expect(mockRemoveToken).toHaveBeenCalled();
    });

    test("throws error when response is not JSON", async () => {
      const mockToken = "mock-jwt-token";

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
        json: jest.fn().mockResolvedValue({ url: "test" })
      });

      await expect(uploadImage(mockFile)).rejects.toThrow(
        "Expected JSON response from image upload endpoint"
      );
    });

    test("handles network errors", async () => {
      const mockToken = "mock-jwt-token";

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockRejectedValue(new TypeError("Network error"));

      await expect(uploadImage(mockFile)).rejects.toThrow(
        "Network error during image upload: Network error"
      );
    });

    test("handles other fetch errors", async () => {
      const mockToken = "mock-jwt-token";

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockRejectedValue(new Error("Some other error"));

      await expect(uploadImage(mockFile)).rejects.toThrow(
        "Image upload failed: Error: Some other error"
      );
    });

    test("re-throws ImageUploadError without wrapping", async () => {
      const mockToken = "mock-jwt-token";
      const originalError = new ImageUploadError(500, "Internal Server Error");

      mockGetToken.mockReturnValue(mockToken);
      mockFetch.mockRejectedValue(originalError);

      await expect(uploadImage(mockFile)).rejects.toBe(originalError);
    });
  });

  describe("ImageUploadError", () => {
    test("creates error with correct properties", () => {
      const error = new ImageUploadError(422, "Unprocessable Entity", { error: "File too large" });

      expect(error.name).toBe("ImageUploadError");
      expect(error.message).toBe("Image Upload Error: 422 Unprocessable Entity");
      expect(error.status).toBe(422);
      expect(error.statusText).toBe("Unprocessable Entity");
      expect(error.data).toEqual({ error: "File too large" });
    });
  });
});