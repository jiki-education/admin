"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createConcept } from "@/lib/api/concepts";
import ConceptForm from "../components/ConceptForm";
import type { CreateConceptData } from "../types";

export default function NewConcept() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSaveConcept = useCallback(
    async (conceptData: CreateConceptData) => {
      try {
        setError(null);
        const newConcept = await createConcept(conceptData);

        // Redirect to the new concept's detail page
        router.push(`/dashboard/concepts/${newConcept.id}`);
      } catch (error) {
        console.error("Failed to create concept:", error);
        setError(error instanceof Error ? error.message : "Failed to create concept");

        // Re-throw error so form can handle it
        throw error;
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push("/dashboard/concepts");
  }, [router]);

  return (
    <div>
      <PageBreadcrumb pageTitle="New Concept" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Create New Concept</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a new programming concept to the platform. This will include instructional content and optional
                videos.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <ConceptForm mode="create" onSave={handleSaveConcept} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
