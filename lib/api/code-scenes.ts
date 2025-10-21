import type {
  CreateCodeSceneData,
  UpdateCodeSceneData,
  CodeScenesResponse,
  CodeSceneResponse,
} from "@/lib/types/code-scenes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3061";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("authToken");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      `HTTP ${response.status}: ${errorText || response.statusText}`,
      response.status,
      response,
    );
  }

  return response;
}

export async function getCodeScenes(
  page: number = 1,
  limit: number = 20
): Promise<CodeScenesResponse> {
  const url = new URL(`${API_BASE_URL}/api/admin/code-scenes`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());

  const response = await fetchWithAuth(url.toString());
  return response.json();
}

export async function getCodeScene(id: string): Promise<CodeSceneResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/code-scenes/${id}`);
  return response.json();
}

export async function createCodeScene(data: CreateCodeSceneData): Promise<CodeSceneResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/code-scenes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCodeScene(id: string, data: UpdateCodeSceneData): Promise<CodeSceneResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/code-scenes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCodeScene(id: string): Promise<void> {
  await fetchWithAuth(`${API_BASE_URL}/api/admin/code-scenes/${id}`, {
    method: "DELETE",
  });
}

export async function renderCodeScene(id: string): Promise<{ jobId: string }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/code-scenes/${id}/render`, {
    method: "POST",
  });
  return response.json();
}