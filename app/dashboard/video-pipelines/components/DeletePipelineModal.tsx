"use client";
import { useEffect } from "react";
import type { Pipeline } from "../types";

interface DeletePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pipeline: Pipeline | null;
  loading: boolean;
}

export default function DeletePipelineModal({
  isOpen,
  onClose,
  onConfirm,
  pipeline,
  loading
}: DeletePipelineModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen || !pipeline) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Pipeline</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Are you sure you want to delete the pipeline &quot;{pipeline.title}&quot;?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              This action cannot be undone. All associated nodes and data will be permanently removed.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <div className="flex justify-between">
                <span>Pipeline ID:</span>
                <span className="font-mono text-xs">{pipeline.uuid}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Total Nodes:</span>
                <span>{pipeline.metadata.progress?.total || 0}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Total Cost:</span>
                <span>${pipeline.metadata.totalCost?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Pipeline"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
