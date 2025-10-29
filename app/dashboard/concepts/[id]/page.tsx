"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { marked } from "marked";
import { getAdminConcept, deleteConcept } from "@/lib/api/concepts";
import type { AdminConcept } from "../types";

export default function ConceptDetail() {
  const router = useRouter();
  const params = useParams();
  const conceptId = parseInt(params.id as string);

  const [concept, setConcept] = useState<AdminConcept | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [contentHtml, setContentHtml] = useState("");

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
      
      // Parse markdown content to HTML
      if (conceptData.content_markdown) {
        try {
          const html = await marked.parse(conceptData.content_markdown);
          setContentHtml(html);
        } catch (parseErr) {
          console.error("Failed to parse markdown:", parseErr);
          setContentHtml("<p>Error parsing markdown content</p>");
        }
      }
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

  const handleBack = useCallback(() => {
    router.push("/dashboard/concepts");
  }, [router]);

  const handleEdit = useCallback(() => {
    router.push(`/dashboard/concepts/${conceptId}/edit`);
  }, [router, conceptId]);

  const handleDelete = useCallback(async () => {
    if (!concept) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the concept "${concept.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await deleteConcept(conceptId);
      toast.success(`Concept "${concept.title}" deleted successfully!`);
      router.push("/dashboard/concepts");
    } catch (err) {
      console.error("Failed to delete concept:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete concept";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  }, [concept, conceptId, router]);

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Concept Details" />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading concept...</div>
        </div>
      </div>
    );
  }

  if (error || !concept) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Concept Details" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Concept not found"}</p>
            <Button variant="outline" onClick={handleBack}>
              Back to Concepts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Concept: ${concept.title}`} />

      <div className="space-y-6">
        {/* Concept Overview */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{concept.title}</h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                disabled={deleting}
                className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
              <Button variant="outline" onClick={handleBack}>
                Back to Concepts
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">ID</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">#{concept.id}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</h3>
              <p className="text-lg font-mono text-gray-900 dark:text-white">{concept.slug}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Videos</h3>
              <div className="space-y-1">
                {concept.standard_video_provider && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Standard: {concept.standard_video_provider}
                  </span>
                )}
                {concept.premium_video_provider && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    Premium: {concept.premium_video_provider}
                  </span>
                )}
                {!concept.standard_video_provider && !concept.premium_video_provider && (
                  <span className="text-gray-400 text-sm">No videos</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{concept.description}</p>
            </div>
          </div>

          {/* Content Markdown */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Content</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              {contentHtml ? (
                <div
                  className="markdown-preview text-gray-900 dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="text-gray-400 italic">No content available</p>
              )}
            </div>
          </div>

          {/* Video Details */}
          {(concept.standard_video_provider || concept.premium_video_provider) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Video Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {concept.standard_video_provider && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Standard Video</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Provider: <span className="font-mono">{concept.standard_video_provider}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Video ID: <span className="font-mono">{concept.standard_video_id}</span>
                    </p>
                  </div>
                )}

                {concept.premium_video_provider && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Premium Video</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Provider: <span className="font-mono">{concept.premium_video_provider}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Video ID: <span className="font-mono">{concept.premium_video_id}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}