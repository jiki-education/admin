"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAdminConcept, updateConcept } from "@/lib/api/concepts";
import ConceptForm from "../../components/ConceptForm";
import type { AdminConcept, UpdateConceptData } from "../../types";

export default function EditConcept() {
  const router = useRouter();
  const params = useParams();
  const conceptId = parseInt(params.id as string);

  const [concept, setConcept] = useState<AdminConcept | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConcept = useCallback(async () => {
    if (!conceptId || isNaN(conceptId)) {
      setError("Invalid concept ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const conceptData = await getAdminConcept(conceptId);
      setConcept(conceptData);
    } catch (err) {
      console.error("Failed to load concept:", err);
      setError(err instanceof Error ? err.message : "Failed to load concept");
    } finally {
      setLoading(false);
    }
  }, [conceptId]);

  useEffect(() => {
    void loadConcept();
  }, [loadConcept]);

  const handleSaveConcept = useCallback(
    async (conceptData: UpdateConceptData) => {
      try {
        setError(null);
        const updatedConcept = await updateConcept(conceptId, conceptData);

        // Redirect to the concept's detail page
        router.push(`/dashboard/concepts/${updatedConcept.id}`);
      } catch (error) {
        console.error("Failed to update concept:", error);
        setError(error instanceof Error ? error.message : "Failed to update concept");

        // Re-throw error so form can handle it
        throw error;
      }
    },
    [conceptId, router]
  );

  const handleCancel = useCallback(() => {
    router.push(`/dashboard/concepts/${conceptId}`);
  }, [router, conceptId]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Concept" />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading concept...</div>
        </div>
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Concept" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Concept not found"}</p>
            <button
              onClick={() => router.push("/dashboard/concepts")}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Concepts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit: ${concept.title}`} />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Edit Concept</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update the concept information. Make sure to review all fields before saving.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <ConceptForm 
            mode="edit" 
            initialData={concept} 
            onSave={handleSaveConcept} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
}