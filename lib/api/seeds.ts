/**
 * Seeds API Service
 */

import { api } from "./client";

/**
 * Reseed the database
 * POST /admin/seeds
 */
export async function reseedDatabase(): Promise<void> {
  await api.post("/admin/seeds");
}
