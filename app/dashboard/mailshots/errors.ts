import { ApiError } from "@/lib/api";

interface ErrorEnvelope {
  error?: {
    type?: string;
    message?: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * The API returns validation errors as { error: { errors: { field: [messages] } } }.
 * Pull out the per-field messages for display next to form inputs.
 */
export function extractFieldErrors(error: ApiError): Record<string, string[]> {
  const data = error.data as ErrorEnvelope | undefined;
  return data?.error?.errors ?? {};
}

/**
 * Best-effort human-readable message from the standard { error: { message } } envelope,
 * falling back to the ApiError's own message.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data as ErrorEnvelope | undefined;
    return data?.error?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
