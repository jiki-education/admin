"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter } from "next/navigation";
import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import type { VideoProductionPipeline, VideoProductionNode } from "@/lib/api/video-pipelines";
import { getPipeline } from "@/lib/api/video-pipelines";

interface PipelineDetailProps {
  params: Promise<{ uuid: string }>;
}

export default function PipelineDetail({ params }: PipelineDetailProps) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [pipeline, setPipeline] = useState<VideoProductionPipeline | null>(null);
  const [nodes, setNodes] = useState<VideoProductionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadPipeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPipeline(resolvedParams.uuid);
      setPipeline(response.pipeline);
      setNodes(response.nodes);
    } catch (err) {
      console.error("Failed to load pipeline:", err);
      setError(err instanceof Error ? err.message : "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.uuid]);

  useEffect(() => {
    if (resolvedParams.uuid) {
      void loadPipeline();
    }
  }, [resolvedParams.uuid, loadPipeline]);

  const getProgressPercentage = (progress: any) => {
    if (!progress || progress.total === 0) {
      return 0;
    }
    return Math.round((progress.completed / progress.total) * 100);
  };

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Pipeline Details" />
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading pipeline...</div>
        </div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Pipeline Details" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error || "Pipeline not found"}
            </p>
            <Link
              href="/dashboard/video-pipelines"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Pipelines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(pipeline.metadata.progress);

  return (
    <div>
      <PageBreadcrumb pageTitle={`Pipeline: ${pipeline.title}`} />

      <div className="space-y-6">
        {/* Pipeline Overview */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {pipeline.title}
            </h1>
            <Link
              href="/dashboard/video-pipelines"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Pipelines
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Version</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{pipeline.version}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Cost</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${pipeline.metadata.totalCost?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Progress</h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {progressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Progress Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {pipeline.metadata.progress?.completed || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {pipeline.metadata.progress?.in_progress || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {pipeline.metadata.progress?.pending || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {pipeline.metadata.progress?.failed || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {pipeline.metadata.progress?.total || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>

          {/* Storage Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Storage Configuration</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bucket:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{pipeline.config.storage?.bucket || 'N/A'}</span>
                </div>
                {pipeline.config.storage?.prefix && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prefix:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{pipeline.config.storage.prefix}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pipeline Editor Placeholder */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Pipeline Editor</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Visual pipeline editor with node graph will be implemented here.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This will show all {nodes.length || 0} nodes in an interactive flow diagram.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}