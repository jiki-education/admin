/**
 * Image Upload API
 * Handles image uploads to Cloudflare R2 via admin endpoint
 */

import { getToken, removeToken } from "@/lib/auth/storage";
import { getApiUrl } from "./config";

export class ImageUploadError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`Image Upload Error: ${status} ${statusText}`);
    this.name = "ImageUploadError";
  }
}

export interface ImageUploadResponse {
  url: string;
}

/**
 * Upload an image file to the admin endpoint
 * @param file - The image file to upload
 * @returns Promise with the CDN URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // Get auth token
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token required for image upload");
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append("image", file);

  // Prepare request
  const url = getApiUrl("/admin/images");
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token}`
    // NOTE: Do NOT set Content-Type for FormData - browser sets it automatically with boundary
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData
    });

    // Parse response
    let data: ImageUploadResponse;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      throw new Error("Expected JSON response from image upload endpoint");
    }

    // Handle error responses
    if (!response.ok) {
      // Handle 401 Unauthorized - clear invalid token
      if (response.status === 401) {
        removeToken();
      }
      throw new ImageUploadError(response.status, response.statusText, data);
    }

    return data.url;
  } catch (error) {
    // Re-throw ImageUploadError
    if (error instanceof ImageUploadError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new Error(`Network error during image upload: ${error.message}`);
    }

    // Handle other errors
    throw new Error(`Image upload failed: ${error}`);
  }
}