"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { getCodeScenes, deleteCodeScene } from "@/lib/api/code-scenes";
import type { CodeScene } from "@/lib/types/code-scenes";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

export default function CodeScenesPage() {
  const router = useRouter();
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  
  const [scenes, setScenes] = useState<CodeScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState<CodeScene | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Load scenes
  const loadScenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCodeScenes();
      setScenes(response.scenes);
    } catch (err) {
      console.error("Error loading code scenes:", err);
      setError(err instanceof Error ? err.message : "Failed to load scenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && hasCheckedAuth) {
      void loadScenes();
    }
  }, [isAuthenticated, hasCheckedAuth]);

  const handleDeleteClick = (scene: CodeScene) => {
    setSceneToDelete(scene);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sceneToDelete) return;

    try {
      setDeleting(true);
      await deleteCodeScene(sceneToDelete.id);
      setScenes((prev) => prev.filter((s) => s.id !== sceneToDelete.id));
      setDeleteModalOpen(false);
      setSceneToDelete(null);
    } catch (err) {
      console.error("Error deleting scene:", err);
      alert("Failed to delete scene");
    } finally {
      setDeleting(false);
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
        <div className="text-gray-500">Loading code scenes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Code Scenes</h1>
          <p className="text-gray-600 mt-2">Create and manage animated code tutorials</p>
        </div>
        <Link href="/dashboard/code-scenes/new">
          <Button>Create Scene</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 rounded-lg p-6 mb-6">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-sm text-red-600 mt-2">This will work once the Rails API is implemented.</p>
        </div>
      )}

      {scenes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No code scenes found</div>
          <Link href="/dashboard/code-scenes/new">
            <Button>Create your first scene</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Theme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scenes.map((scene) => (
                  <tr key={scene.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{scene.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {scene.description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scene.config.theme === "dark"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {scene.config.theme || "dark"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scene.config.actions.length} action(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(scene.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link href={`/dashboard/code-scenes/${scene.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/dashboard/code-scenes/${scene.id}/preview`}>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(scene)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Code Scene"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "{sceneToDelete?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}