"use client";
import Link from "next/link";
import type { Pipeline } from "../types";

interface PipelineTableProps {
  pipelines: Pipeline[];
  loading: boolean;
  onDelete: (pipeline: Pipeline) => void;
}

export default function PipelineTable({ pipelines, loading, onDelete }: PipelineTableProps) {
  const getProgressPercentage = (progress: any) => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Version</th>
              <th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3">Cost</th>
              <th className="px-6 py-3">Last Updated</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No pipelines found</p>
        <Link
          href="/dashboard/video-pipelines/new"
          className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          Create Your First Pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Version</th>
            <th className="px-6 py-3">Progress</th>
            <th className="px-6 py-3">Cost</th>
            <th className="px-6 py-3">Last Updated</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pipelines.map((pipeline) => {
            const progressPercentage = getProgressPercentage(pipeline.metadata.progress);
            
            return (
              <tr
                key={pipeline.uuid}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <Link
                    href={`/dashboard/video-pipelines/${pipeline.uuid}`}
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {pipeline.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {pipeline.version}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-10">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {pipeline.metadata.progress.completed}/{pipeline.metadata.progress.total} nodes
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  ${pipeline.metadata.totalCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {formatDate(pipeline.updated_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/video-pipelines/${pipeline.uuid}`}
                      className="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 font-medium text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => onDelete(pipeline)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}