import { getUsers, deleteUser } from '@/lib/api/users';
import { api } from '@/lib/api/client';
import type { UserFilters } from '@/app/dashboard/users/types';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  api: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('Users API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    test('sends correct API request with filters and returns users data', async () => {
      const filters: UserFilters = {
        name: 'John',
        email: 'john@example.com',
        page: 2,
        per: 10
      };

      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              email: 'john@example.com',
              name: 'John Doe',
              admin: false,
              locale: 'en'
            }
          ],
          meta: {
            current_page: 2,
            total_pages: 5,
            total_count: 50
          }
        }
      };

      mockApi.get.mockResolvedValue({ ...mockResponse, status: 200, headers: {} });

      const result = await getUsers(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/admin/users', {
        params: {
          name: 'John',
          email: 'john@example.com',
          page: '2',
          per: '10'
        }
      });

      expect(result).toEqual(mockResponse.data);
    });

    test('sends request without filters when none provided', async () => {
      const mockResponse = {
        data: {
          results: [],
          meta: { current_page: 1, total_pages: 1, total_count: 0 }
        }
      };

      mockApi.get.mockResolvedValue({ ...mockResponse, status: 200, headers: {} });

      await getUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/admin/users', {
        params: {}
      });
    });

    test('includes admin filter when provided', async () => {
      const filters: UserFilters = {
        admin: true
      };

      const mockResponse = {
        data: {
          results: [],
          meta: { current_page: 1, total_pages: 1, total_count: 0 }
        }
      };

      mockApi.get.mockResolvedValue({ ...mockResponse, status: 200, headers: {} });

      await getUsers(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/admin/users', {
        params: {
          admin: 'true'
        }
      });
    });

    test('includes admin false filter when provided', async () => {
      const filters: UserFilters = {
        admin: false
      };

      const mockResponse = {
        data: {
          results: [],
          meta: { current_page: 1, total_pages: 1, total_count: 0 }
        }
      };

      mockApi.get.mockResolvedValue({ ...mockResponse, status: 200, headers: {} });

      await getUsers(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/admin/users', {
        params: {
          admin: 'false'
        }
      });
    });
  });

  describe('deleteUser', () => {
    test('sends correct DELETE request to user endpoint', async () => {
      const userId = 123;

      mockApi.delete.mockResolvedValue({ data: null, status: 204, headers: {} });

      await deleteUser(userId);

      expect(mockApi.delete).toHaveBeenCalledWith('/admin/users/123');
    });

    test('handles API errors properly', async () => {
      const userId = 999;
      const apiError = new Error('User not found');
      
      mockApi.delete.mockRejectedValue(apiError);

      await expect(deleteUser(userId)).rejects.toThrow('User not found');

      expect(mockApi.delete).toHaveBeenCalledWith('/admin/users/999');
    });

    test('returns void on successful deletion', async () => {
      const userId = 456;

      mockApi.delete.mockResolvedValue({ data: null, status: 204, headers: {} });

      await deleteUser(userId);
      
      expect(mockApi.delete).toHaveBeenCalledWith(`/v1/admin/users/${userId}`);
    });
  });
});