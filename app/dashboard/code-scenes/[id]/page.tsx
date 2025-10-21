"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { getCodeScene, updateCodeScene } from "@/lib/api/code-scenes";
import type { CodeScene, UpdateCodeSceneData } from "@/lib/types/code-scenes";
import type { SceneConfig } from "@/lib/remotion/types";
import Button from "@/components/ui/button/Button";
import SceneEditor from "../components/SceneEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCodeScenePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  
  const [scene, setScene] = useState<CodeScene | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState<SceneConfig>({
    title: "",
    theme: "dark",
    actions: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!hasCheckedAuth) {
      void checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [hasCheckedAuth, isAuthenticated, router]);

  // Load scene
  const loadScene = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCodeScene(id);
      setScene(response.scene);
      setTitle(response.scene.title);
      setDescription(response.scene.description || "");
      setConfig(response.scene.config);
    } catch (err) {
      console.error("Error loading scene:", err);
      setError(err instanceof Error ? err.message : "Failed to load scene");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && hasCheckedAuth) {
      void loadScene();
    }
  }, [id, isAuthenticated, hasCheckedAuth]);

  // Update config title when title changes
  useEffect(() => {
    setConfig(prev => ({ ...prev, title }));
  }, [title]);

  // Track changes
  useEffect(() => {
    if (!scene) return;
    
    const changed = 
      title !== scene.title ||
      description !== (scene.description || "") ||
      JSON.stringify(config) !== JSON.stringify(scene.config);
    
    setHasChanges(changed);
  }, [scene, title, description, config]);

  const handleSave = async () => {
    if (!scene) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (config.actions.length === 0) {
      setError("At least one action is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data: UpdateCodeSceneData = {
        title: title.trim(),
        description: description.trim() || undefined,
        config
      };

      const response = await updateCodeScene(scene.id, data);
      setScene(response.scene);
      setHasChanges(false);
    } catch (err) {
      console.error("Error updating scene:", err);
      setError(err instanceof Error ? err.message : "Failed to update scene");
    } finally {
      setSaving(false);
    }
  };

  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Loading scene...</div>
      </div>
    );
  }

  if (error && !scene) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-400 rounded-lg p-6">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-sm text-red-600 mt-2">This will work once the Rails API is implemented.</p>
          <Link href="/dashboard/code-scenes" className="mt-4 inline-block">
            <Button variant="outline">← Back to Scenes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Code Scene</h1>
          <p className="text-gray-600 mt-2">Modify your animated code tutorial</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/code-scenes">
            <Button variant="outline">← Back</Button>
          </Link>
          <Link href={`/dashboard/code-scenes/${id}/preview`}>
            <Button variant="outline">Preview</Button>
          </Link>
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">You have unsaved changes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scene Details */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Scene Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter scene title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  id="theme"
                  value={config.theme || "dark"}
                  onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as "dark" | "light" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  id="backgroundColor"
                  value={config.backgroundColor || "#1e1e1e"}
                  onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              {scene && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <div><strong>Created:</strong> {new Date(scene.createdAt).toLocaleString()}</div>
                    <div><strong>Updated:</strong> {new Date(scene.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scene Editor */}
        <div>
          <SceneEditor
            config={config}
            onChange={setConfig}
          />
        </div>
      </div>
    </div>
  );
}