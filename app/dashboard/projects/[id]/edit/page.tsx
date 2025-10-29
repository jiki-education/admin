"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAdminProject, updateProject } from "@/lib/api/projects";
import ProjectForm from "../../components/ProjectForm";
import type { AdminProject, UpdateProjectData } from "../../types";

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSaveProject = useCallback(
    async (projectData: UpdateProjectData) => {
      try {
        setError(null);
        const updatedProject = await updateProject(projectId, projectData);

        // Redirect to the project's detail page
        router.push(`/dashboard/projects/${updatedProject.id}`);
      } catch (error) {
        console.error("Failed to update project:", error);
        setError(error instanceof Error ? error.message : "Failed to update project");

        // Re-throw error so form can handle it
        throw error;
      }
    },
    [projectId, router]
  );

  const handleCancel = useCallback(() => {
    router.push(`/dashboard/projects/${projectId}`);
  }, [router, projectId]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Project" />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading project...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Project" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Project not found"}</p>
            <button
              onClick={() => router.push("/dashboard/projects")}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit: ${project.title}`} />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Edit Project</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update the project information. Make sure to review all fields before saving.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <ProjectForm 
            mode="edit" 
            initialData={project} 
            onSave={handleSaveProject} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
}