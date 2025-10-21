"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { getCodeScene, renderCodeScene } from "@/lib/api/code-scenes";
import type { CodeScene } from "@/lib/types/code-scenes";
import Button from "@/components/ui/button/Button";
import { calculateSceneDuration } from "@/lib/remotion/timing";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PreviewCodeScenePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  
  const [scene, setScene] = useState<CodeScene | null>(null);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [id, isAuthenticated, hasCheckedAuth, loadScene]);

  const handleRender = async () => {
    if (!scene) {
      return;
    }

    try {
      setRendering(true);
      const response = await renderCodeScene(scene.id);
      alert(`Render job started with ID: ${response.jobId}`);
    } catch (err) {
      console.error("Error starting render:", err);
      alert("Failed to start render job");
    } finally {
      setRendering(false);
    }
  };

  const openRemotionStudio = () => {
    alert("Run 'pnpm dev:remotion' in your terminal to open Remotion Studio for advanced preview");
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

  if (error || !scene) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-400 rounded-lg p-6">
          <p className="text-red-800">
            <strong>Error:</strong> {error || "Scene not found"}
          </p>
          <p className="text-sm text-red-600 mt-2">This will work once the Rails API is implemented.</p>
          <Link href="/dashboard/code-scenes" className="mt-4 inline-block">
            <Button variant="outline">← Back to Scenes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const duration = calculateSceneDuration(scene.config.actions, 30);
  const durationSeconds = Math.round(duration / 30 * 100) / 100;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preview: {scene.title}</h1>
          <p className="text-gray-600 mt-2">Preview your animated code tutorial</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/code-scenes">
            <Button variant="outline">← Back to Scenes</Button>
          </Link>
          <Link href={`/dashboard/code-scenes/${id}`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button onClick={openRemotionStudio} variant="outline">
            Open Remotion Studio
          </Button>
          <Button onClick={handleRender} disabled={rendering}>
            {rendering ? "Rendering..." : "Render to MP4"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scene Info */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Scene Info</h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Title:</span>
                <p className="text-sm text-gray-900">{scene.title}</p>
              </div>
              
              {scene.description && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <p className="text-sm text-gray-900">{scene.description}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-700">Theme:</span>
                <p className="text-sm text-gray-900">{scene.config.theme || "dark"}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <p className="text-sm text-gray-900">~{durationSeconds}s ({duration} frames)</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Actions:</span>
                <p className="text-sm text-gray-900">{scene.config.actions.length}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Resolution:</span>
                <p className="text-sm text-gray-900">1920×1080 @ 30fps</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Actions</h3>
              <div className="space-y-2">
                {scene.config.actions.map((action, index) => (
                  <div key={index} className="text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded mr-2">
                      {index + 1}.
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded mr-2 ${
                        action.type === "type"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {action.type}
                    </span>
                    <span className="text-gray-600">
                      {action.type === "type" 
                        ? (action.code.slice(0, 30) + (action.code.length > 30 ? "..." : ""))
                        : `${action.duration}s pause`
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            
            {/* Placeholder for Remotion Player */}
            <div 
              className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: scene.config.backgroundColor || "#1e1e1e" }}
            >
              <div className="text-center">
                <div className="text-white mb-4">
                  <div className="text-xl font-bold">Code Scene Preview</div>
                  <div className="text-sm opacity-75">&quot;{scene.title}&quot;</div>
                </div>
                <div className="text-white text-sm opacity-75">
                  Remotion Player integration coming in Phase 3
                </div>
                <div className="mt-4">
                  <Button onClick={openRemotionStudio} size="sm">
                    Open in Remotion Studio
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Note:</strong> To preview this scene with full animation controls, run{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">pnpm dev:remotion</code> in your terminal 
                to open Remotion Studio. The embedded player will be available in Phase 3 of the integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}