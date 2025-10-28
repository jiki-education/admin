/**
 * Render Code Node Details Component
 *
 * Specialized detail view for render-code nodes with code scene selection and configuration.
 */

"use client";

import { useState, useEffect } from "react";
import type { RenderCodeNode } from "@/lib/nodes/types";
import type { CodeScene } from "@/lib/types/code-scenes";
import Button from "@/components/ui/button/Button";
import { StaticCodePreview } from "@/components/remotion/StaticCodePreview";
import { SCENE_CATEGORIES } from "@/lib/scene-templates";
import { analyzeSceneComplexity, validateSceneForRendering } from "@/lib/code-scene-pipeline-integration";

interface RenderCodeNodeDetailsProps {
  node: RenderCodeNode;
  pipelineUuid: string;
  onRefresh: () => void;
  onUpdate?: (pipelineUuid: string, nodeUuid: string, updates: Partial<RenderCodeNode>) => Promise<void>;
}

export default function RenderCodeNodeDetails({
  node,
  pipelineUuid: _pipelineUuid,
  onRefresh,
  onUpdate: _onUpdate
}: RenderCodeNodeDetailsProps) {
  const [scenes, setScenes] = useState<CodeScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get the currently configured scene ID from node config
  const configuredSceneId = node.config.sceneId as string | undefined;
  const selectedScene = scenes.find((scene) => scene.id === configuredSceneId);

  // Load available code scenes
  useEffect(() => {
    // TODO: Load scenes from video pipeline backend when API is available
    setLoading(false);
    setError("Scene management will be integrated into the video pipeline once the backend API is available.");
    setScenes([]); // Mock empty scenes for now
  }, []);

  // Filter scenes based on search and category
  const filteredScenes = scenes.filter((scene) => {
    const matchesSearch =
      !searchQuery.trim() ||
      scene.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || scene.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSceneSelect = (sceneId: string) => {
    try {
      // TODO: Implement API call to update node configuration
      // This would call something like updateNodeConfig(pipelineUuid, node.uuid, { sceneId })

      // For now, show a message that this will be implemented with the backend
      alert(
        `Scene selection will be implemented when the backend API is available.\n\nSelected scene: ${sceneId}\nNode: ${node.uuid}`
      );

      onRefresh();
    } catch (err) {
      console.error("Error updating node configuration:", err);
      alert("Failed to update node configuration");
    }
  };

  const handleCreateScene = () => {
    // TODO: Implement inline scene creation when backend API is available
    alert("Scene creation will be available inline once the backend API is implemented.");
  };

  const handleEditScene = (sceneId: string) => {
    // TODO: Implement inline scene editing when backend API is available
    alert(`Scene editing will be available inline once the backend API is implemented.\n\nScene ID: ${sceneId}`);
  };

  return (
    <div className="space-y-6">
      {/* Current Configuration */}
      {selectedScene ? (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Current Scene</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{selectedScene.title}</h4>
                {selectedScene.description && <p className="text-sm text-gray-600 mt-1">{selectedScene.description}</p>}
                {selectedScene.category && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {selectedScene.category}
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => handleEditScene(selectedScene.id)}>
                Edit Scene
              </Button>
            </div>

            {/* Scene Analysis */}
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              {(() => {
                const analysis = analyzeSceneComplexity(selectedScene.config);
                const validation = validateSceneForRendering(selectedScene.config);

                return (
                  <>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-medium text-gray-700">Duration</div>
                      <div className="text-gray-600">~{analysis.estimatedDuration}s</div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-medium text-gray-700">Complexity</div>
                      <div
                        className={`capitalize ${
                          analysis.complexityScore === "simple"
                            ? "text-green-600"
                            : analysis.complexityScore === "moderate"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {analysis.complexityScore}
                      </div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-medium text-gray-700">Actions</div>
                      <div className="text-gray-600">{analysis.totalActions}</div>
                    </div>
                    <div className="bg-white rounded p-2 border">
                      <div className="font-medium text-gray-700">Status</div>
                      <div className={validation.valid ? "text-green-600" : "text-red-600"}>
                        {validation.valid ? "✓ Ready" : "⚠ Issues"}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Validation Errors */}
            {(() => {
              const validation = validateSceneForRendering(selectedScene.config);
              return (
                !validation.valid && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-red-800 text-xs font-medium mb-1">Scene Issues:</div>
                    <ul className="text-red-700 text-xs space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )
              );
            })()}

            {/* Preview */}
            <div className="mt-4">
              <StaticCodePreview config={selectedScene.config} width={320} height={180} className="mx-auto" />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Scene Configuration</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">No scene configured. Select a scene below or create a new one.</p>
          </div>
        </div>
      )}

      {/* Scene Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Available Scenes</h3>
          <Button size="sm" onClick={handleCreateScene}>
            Create New Scene
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-1">Scene selection will work once the Rails API is implemented.</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading scenes...</div>
          </div>
        ) : scenes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No code scenes found</div>
            <Button onClick={handleCreateScene}>Create your first scene</Button>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scenes..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {SCENE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scene List */}
            {filteredScenes.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-500 text-sm">No scenes match your filters</div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-blue-600 hover:text-blue-700 underline text-sm mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredScenes.map((scene) => (
                  <div
                    key={scene.id}
                    className={`border rounded-lg p-3 ${
                      scene.id === configuredSceneId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{scene.title}</h4>
                        {scene.description && <p className="text-xs text-gray-600 mt-1">{scene.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {scene.category && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {scene.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{scene.config.actions.length} action(s)</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-3">
                        {scene.id === configuredSceneId ? (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                            Selected
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSceneSelect(scene.id)}
                            className="text-xs px-2 py-1"
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Under the Hood Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Under the Hood</h3>

        {/* Config */}
        <Section title="Configuration">
          {Object.keys(node.config).length === 0 ? (
            <p className="text-sm text-gray-500">No configuration</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(node.config).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-semibold text-gray-700">{key}:</span>{" "}
                  <span className="text-gray-600">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Metadata */}
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <Section title="Metadata">
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
              {JSON.stringify(node.metadata, null, 2)}
            </pre>
          </Section>
        )}

        {/* Output */}
        {node.output && Object.keys(node.output).length > 0 && (
          <Section title="Output">
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(node.output, null, 2)}</pre>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}
