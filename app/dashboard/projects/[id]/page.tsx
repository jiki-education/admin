"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminProject, deleteProject } from "@/lib/api/projects";
import type { AdminProject } from "../types";

export default function ProjectDetail() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId || isNaN(projectId)) {
      setError("Invalid project ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const projectData = await getAdminProject(projectId);
      setProject(projectData);
    } catch (err) {
      console.error("Failed to load project:", err);
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/projects");
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(`/dashboard/projects/${projectId}/edit`);
  }, [router, projectId]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!project) {
      return;
    }

    try {
      setDeleting(true);
      await deleteProject(projectId);
      toast.success(`Project "${project.title}" deleted successfully!`);
      router.push("/dashboard/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete project";
      setError(errorMessage);
      toast.error(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }, [project, projectId, router]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Project Details" />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading project...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Project Details" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Project not found"}</p>
            <Button variant="outline" onClick={handleBack}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Project: ${project.title}`} />

      <div className="space-y-6">
        {/* Project Overview */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{project.title}</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDeleteClick} 
                disabled={deleting}
                className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50"
              >
                Delete
              </Button>
              <Button variant="outline" onClick={handleBack}>
                Back to Projects
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ID</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">#{project.id}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</h3>
              <p className="text-lg font-mono text-gray-900 dark:text-white">{project.slug}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Exercise Slug</h3>
              <p className="text-lg font-mono text-blue-800 dark:text-blue-400">{project.exercise_slug}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
            </div>
          </div>

          {/* Exercise Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Exercise Information</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                This project is linked to the exercise with slug:
              </p>
              <code className="inline-flex items-center px-3 py-2 rounded-md text-sm font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {project.exercise_slug}
              </code>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This async exercise (Brain Buster) becomes available when main lesson exercises are completed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleDeleteCancel} className="max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Project</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the project{" "}
              <span className="font-medium text-gray-900 dark:text-white">"{project?.title}"</span>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This will permanently remove the project and all associated data.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}