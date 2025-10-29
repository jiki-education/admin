/**
 * Image upload utilities for MarkdownEditor
 * 
 * These functions provide a simple interface for handling image uploads.
 * The actual upload endpoint should be implemented by the backend team.
 */

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * Upload an image file to the server
 * 
 * @param file - The image file to upload
 * @returns Promise that resolves to the uploaded image URL
 */
export async function uploadImage(file: File): Promise<string> {
  // TODO: Replace with actual backend endpoint when available
  const endpoint = '/api/images/upload';
  
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: {
      // Add auth header if needed
      // 'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  const data: ImageUploadResponse = await response.json();
  return data.url;
}

/**
 * Validate if a file is a supported image type
 */
export function isValidImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Mock upload function for testing (returns a placeholder image URL)
 * Remove this when the real backend endpoint is implemented
 */
export async function mockUploadImage(file: File): Promise<string> {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a placeholder image URL (using multiple fallback services)
  const placeholders = [
    `https://picsum.photos/400/300?random=${Date.now()}`, // Real photos
    `https://via.placeholder.com/400x300/0066CC/FFFFFF?text=${encodeURIComponent(file.name.substring(0, 20))}`, // Blue background
    `https://placehold.co/400x300/png?text=${encodeURIComponent(file.name.substring(0, 15))}` // Alternative service
  ];
  
  return placeholders[0]; // Use picsum for real photos
}