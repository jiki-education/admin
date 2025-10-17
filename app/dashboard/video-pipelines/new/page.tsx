"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createPipeline } from "@/lib/api/video-pipelines";
import type { CreatePipelineData } from "../types";

export default function CreatePipeline() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState<CreatePipelineData>({
    title: "",
    version: "1.0",
    config: {
      storage: {
        bucket: "jiki-videos",
        prefix: ""
      }
    },
    metadata: {
      totalCost: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCheckedAuth) {
      void checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, hasCheckedAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.config.storage.bucket.trim()) {
      setError("Storage bucket is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pipeline = await createPipeline(formData);
      router.push(`/dashboard/video-pipelines/${pipeline.uuid}`);
    } catch (err) {
      console.error("Failed to create pipeline:", err);
      setError(err instanceof Error ? err.message : "Failed to create pipeline");
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "title") {
      setFormData(prev => ({ ...prev, title: value }));
    } else if (field === "version") {
      setFormData(prev => ({ ...prev, version: value }));
    } else if (field === "bucket") {
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          storage: {
            ...prev.config.storage,
            bucket: value
          }
        }
      }));
    } else if (field === "prefix") {
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          storage: {
            ...prev.config.storage,
            prefix: value
          }
        }
      }));
    }
  };

  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Pipeline" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create New Video Pipeline
            </h1>
            <Link
              href="/dashboard/video-pipelines"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pipeline Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Ruby Course Introduction"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="1.0"
                />
              </div>
            </div>

            {/* Storage Configuration */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Storage Configuration</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Storage Bucket *
                </label>
                <input
                  type="text"
                  value={formData.config.storage.bucket}
                  onChange={(e) => handleInputChange("bucket", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="jiki-videos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Storage Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={formData.config.storage.prefix || ""}
                  onChange={(e) => handleInputChange("prefix", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="lessons/ruby-intro/"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Optional path prefix for organizing files within the bucket
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard/video-pipelines"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Pipeline"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}