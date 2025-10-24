import { 
  getPipelines, 
  getPipeline, 
  createPipeline, 
  updatePipeline, 
  deletePipeline 
} from '@/lib/api/video-pipelines';
import { api } from '@/lib/api/client';
import type { PipelineFilters, CreatePipelineData, UpdatePipelineData } from '@/lib/api/video-pipelines';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('Video Pipelines API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPipelines', () => {
    test('sends correct API request with filters and returns pipelines data', async () => {
      const filters: PipelineFilters = {
        page: 2,
        per: 10
      };

      const mockResponse = {
        data: {
          results: [
            {
              uuid: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Ruby Course Introduction',
              version: '1.0',
              config: {
                storage: {
                  bucket: 'jiki-videos',
                  prefix: 'lessons/ruby-intro/'
                }
              },
              metadata: {
                totalCost: 45.67,
                progress: {
                  completed: 8,
                  in_progress: 2,
                  pending: 3,
                  failed: 0,
                  total: 13
                }
              },
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-15T14:22:00Z'
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

      const result = await getPipelines(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/admin/video_production/pipelines', {
        params: {
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

      await getPipelines();

      expect(mockApi.get).toHaveBeenCalledWith('/admin/video_production/pipelines', {
        params: {}
      });
    });

    test('handles API errors properly', async () => {
      const apiError = new Error('Network error');
      
      mockApi.get.mockRejectedValue(apiError);

      await expect(getPipelines()).rejects.toThrow('Network error');
    });
  });

  describe('getPipeline', () => {
    test('sends correct API request and returns pipeline with nodes', async () => {
      const uuid = 'test-merge';
      
      const mockResponse = {
        data: {
          pipeline: {
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Ruby Course Introduction',
            version: '1.0',
            config: {
              storage: {
                bucket: 'jiki-videos',
                prefix: 'lessons/ruby-intro/'
              }
            },
            metadata: {
              totalCost: 45.67,
              progress: {
                completed: 8,
                in_progress: 2,
                pending: 3,
                failed: 0,
                total: 13
              }
            },
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T14:22:00Z',
            nodes: [
              {
                uuid: 'node-123',
                pipeline_uuid: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Welcome Script',
                type: 'asset',
                inputs: {},
                config: {},
                status: 'completed',
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-15T11:00:00Z'
              }
            ]
          }
        }
      };

      mockApi.get.mockResolvedValue({ ...mockResponse, status: 200, headers: {} });

      const result = await getPipeline(uuid);

      expect(mockApi.get).toHaveBeenCalledWith(`/admin/video_production/pipelines/${uuid}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('handles pipeline not found error', async () => {
      const uuid = 'non-existent-uuid';
      const apiError = new Error('Pipeline not found');
      
      mockApi.get.mockRejectedValue(apiError);

      await expect(getPipeline(uuid)).rejects.toThrow('Pipeline not found');
    });
  });

  describe('createPipeline', () => {
    test('sends correct POST request and returns created pipeline', async () => {
      const createData: CreatePipelineData = {
        title: 'New Video Pipeline',
        version: '1.0',
        config: {
          storage: {
            bucket: 'jiki-videos',
            prefix: 'new-course/'
          }
        },
        metadata: {
          totalCost: 0
        }
      };

      const mockResponse = {
        data: {
          uuid: '456e7890-e89b-12d3-a456-426614174001',
          title: 'New Video Pipeline',
          version: '1.0',
          config: {
            storage: {
              bucket: 'jiki-videos',
              prefix: 'new-course/'
            }
          },
          metadata: {
            totalCost: 0,
            progress: {
              completed: 0,
              in_progress: 0,
              pending: 0,
              failed: 0,
              total: 0
            }
          },
          created_at: '2024-01-16T09:00:00Z',
          updated_at: '2024-01-16T09:00:00Z'
        }
      };

      mockApi.post.mockResolvedValue({ ...mockResponse, status: 201, headers: {} });

      const result = await createPipeline(createData);

      expect(mockApi.post).toHaveBeenCalledWith('/admin/video_production/pipelines', {
        pipeline: createData
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles validation errors properly', async () => {
      const invalidData: CreatePipelineData = {
        title: '',
        config: {
          storage: {
            bucket: ''
          }
        }
      };

      const apiError = new Error('Title cannot be blank');
      
      mockApi.post.mockRejectedValue(apiError);

      await expect(createPipeline(invalidData)).rejects.toThrow('Title cannot be blank');
    });
  });

  describe('updatePipeline', () => {
    test('sends correct PATCH request and returns updated pipeline', async () => {
      const uuid = 'test-merge';
      const updateData: UpdatePipelineData = {
        title: 'Updated Pipeline Title',
        version: '1.1'
      };

      const mockResponse = {
        data: {
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Updated Pipeline Title',
          version: '1.1',
          config: {
            storage: {
              bucket: 'jiki-videos'
            }
          },
          metadata: {
            totalCost: 50.0,
            progress: {
              completed: 10,
              in_progress: 0,
              pending: 0,
              failed: 0,
              total: 10
            }
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-16T15:30:00Z'
        }
      };

      mockApi.patch.mockResolvedValue({ ...mockResponse, status: 200, headers: {} });

      const result = await updatePipeline(uuid, updateData);

      expect(mockApi.patch).toHaveBeenCalledWith(`/admin/video_production/pipelines/${uuid}`, {
        pipeline: updateData
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles update errors properly', async () => {
      const uuid = 'non-existent';
      const updateData: UpdatePipelineData = {
        title: 'New Title'
      };

      const apiError = new Error('Pipeline not found');
      
      mockApi.patch.mockRejectedValue(apiError);

      await expect(updatePipeline(uuid, updateData)).rejects.toThrow('Pipeline not found');
    });
  });

  describe('deletePipeline', () => {
    test('sends correct DELETE request', async () => {
      const uuid = 'test-merge';

      mockApi.delete.mockResolvedValue({ data: null, status: 204, headers: {} });

      await deletePipeline(uuid);

      expect(mockApi.delete).toHaveBeenCalledWith(`/admin/video_production/pipelines/${uuid}`);
    });

    test('handles deletion errors properly', async () => {
      const uuid = 'non-existent';
      const apiError = new Error('Pipeline not found');
      
      mockApi.delete.mockRejectedValue(apiError);

      await expect(deletePipeline(uuid)).rejects.toThrow('Pipeline not found');
    });

    test('returns void on successful deletion', async () => {
      const uuid = 'test-merge';

      mockApi.delete.mockResolvedValue({ data: null, status: 204, headers: {} });

      await deletePipeline(uuid);
      
      expect(mockApi.delete).toHaveBeenCalledWith(`/admin/video_production/pipelines/${uuid}`);
    });
  });
});