/**
 * Video Pipelines API - Edge Disconnection Tests
 * Tests for the new disconnectNodes functionality
 */

import { api } from "@/lib/api";
import { disconnectNodes } from "@/lib/api/video-pipelines";

// Mock the API
jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("disconnectNodes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should remove single source from array input", async () => {
    const pipelineUuid = "pipeline-123";
    const sourceNodeUuid = "source-456";
    const targetNodeUuid = "target-789";
    const inputKey = "segments";

    // Mock the target node with array input
    const mockNode = {
      node: {
        uuid: targetNodeUuid,
        inputs: {
          segments: ["source-456", "other-source-123"]
        }
      }
    };

    mockApi.get.mockResolvedValue({ data: mockNode });
    mockApi.patch.mockResolvedValue({ data: {} });

    await disconnectNodes(pipelineUuid, sourceNodeUuid, targetNodeUuid, inputKey);

    // Verify GET request to fetch current node
    expect(mockApi.get).toHaveBeenCalledWith(
      `/admin/video_production/pipelines/${pipelineUuid}/nodes/${targetNodeUuid}`
    );

    // Verify PATCH request with updated inputs (source removed from array)
    expect(mockApi.patch).toHaveBeenCalledWith(
      `/admin/video_production/pipelines/${pipelineUuid}/nodes/${targetNodeUuid}`,
      {
        node: {
          inputs: {
            segments: ["other-source-123"] // source-456 removed
          }
        }
      }
    );
  });

  it("should remove single string input", async () => {
    const pipelineUuid = "pipeline-123";
    const sourceNodeUuid = "source-456";
    const targetNodeUuid = "target-789";
    const inputKey = "audio";

    // Mock the target node with single string input
    const mockNode = {
      node: {
        uuid: targetNodeUuid,
        inputs: {
          audio: "source-456"
        }
      }
    };

    mockApi.get.mockResolvedValue({ data: mockNode });
    mockApi.patch.mockResolvedValue({ data: {} });

    await disconnectNodes(pipelineUuid, sourceNodeUuid, targetNodeUuid, inputKey);

    // Verify PATCH request with input set to undefined
    expect(mockApi.patch).toHaveBeenCalledWith(
      `/admin/video_production/pipelines/${pipelineUuid}/nodes/${targetNodeUuid}`,
      {
        node: {
          inputs: {
            audio: undefined // single value removed
          }
        }
      }
    );
  });

  it("should do nothing if connection not found in array", async () => {
    const pipelineUuid = "pipeline-123";
    const sourceNodeUuid = "non-existent-source";
    const targetNodeUuid = "target-789";
    const inputKey = "segments";

    // Mock the target node with array input that doesn't contain the source
    const mockNode = {
      node: {
        uuid: targetNodeUuid,
        inputs: {
          segments: ["other-source-123", "another-source-456"]
        }
      }
    };

    mockApi.get.mockResolvedValue({ data: mockNode });

    await disconnectNodes(pipelineUuid, sourceNodeUuid, targetNodeUuid, inputKey);

    // Should only call GET, not PATCH (since connection not found)
    expect(mockApi.get).toHaveBeenCalledTimes(1);
    expect(mockApi.patch).not.toHaveBeenCalled();
  });

  it("should do nothing if single string input doesn't match", async () => {
    const pipelineUuid = "pipeline-123";
    const sourceNodeUuid = "wrong-source";
    const targetNodeUuid = "target-789";
    const inputKey = "audio";

    // Mock the target node with different single string input
    const mockNode = {
      node: {
        uuid: targetNodeUuid,
        inputs: {
          audio: "different-source-456"
        }
      }
    };

    mockApi.get.mockResolvedValue({ data: mockNode });

    await disconnectNodes(pipelineUuid, sourceNodeUuid, targetNodeUuid, inputKey);

    // Should only call GET, not PATCH (since connection not found)
    expect(mockApi.get).toHaveBeenCalledTimes(1);
    expect(mockApi.patch).not.toHaveBeenCalled();
  });

  it("should handle empty array input", async () => {
    const pipelineUuid = "pipeline-123";
    const sourceNodeUuid = "source-456";
    const targetNodeUuid = "target-789";
    const inputKey = "segments";

    // Mock the target node with single item array
    const mockNode = {
      node: {
        uuid: targetNodeUuid,
        inputs: {
          segments: ["source-456"]
        }
      }
    };

    mockApi.get.mockResolvedValue({ data: mockNode });
    mockApi.patch.mockResolvedValue({ data: {} });

    await disconnectNodes(pipelineUuid, sourceNodeUuid, targetNodeUuid, inputKey);

    // Verify PATCH request with empty array
    expect(mockApi.patch).toHaveBeenCalledWith(
      `/admin/video_production/pipelines/${pipelineUuid}/nodes/${targetNodeUuid}`,
      {
        node: {
          inputs: {
            segments: [] // array now empty after removing only element
          }
        }
      }
    );
  });
});