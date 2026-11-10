export interface User {
  id: number;
  name: string;
  email: string;
  locale: string; // "en" | "hu"
  admin: boolean;
  internal: boolean;
}

export interface UpdateUserData {
  internal?: boolean;
}

export interface UserFilters {
  name?: string;
  email?: string;
  locale?: string;
  admin?: boolean;
  page?: number;
  per?: number; // pagination limit
}

export interface UsersResponse {
  results: User[];
  meta: {
    current_page: number;
    total_count: number;
    total_pages: number;
  };
}

export type UserBulkAction = "set_internal";
