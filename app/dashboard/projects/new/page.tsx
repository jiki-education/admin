"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createProject } from "@/lib/api/projects";
import ProjectForm from "../components/ProjectForm";
import type { CreateProjectData } from "../types";

export default function NewProject() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSaveProject = useCallback(
    async (projectData: CreateProjectData) => {
      try {
        setError(null);
        const newProject = await createProject(projectData);

        // Redirect to the new project's detail page
        router.push(`/dashboard/projects/${newProject.id}`);
      } catch (error) {
        console.error("Failed to create project:", error);
        setError(error instanceof Error ? error.message : "Failed to create project");

        // Re-throw error so form can handle it
        throw error;
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push("/dashboard/projects");
  }, [router]);

  return (
    <div>
      <PageBreadcrumb pageTitle="New Project" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Create New Project</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a new Brain Buster project to the platform. Projects are async exercises that get unlocked when main lesson exercises are completed.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <ProjectForm mode="create" onSave={handleSaveProject} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}