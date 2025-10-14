"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { EmailTemplate } from "../types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  template: EmailTemplate | null;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  template,
  loading = false
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete template:", error);
      // Error handling could be improved with proper error display
    }
  };

  if (!template) { return null };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="text-center">
        {/* Warning Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Delete Email Template
        </h3>

        {/* Description */}
        <div className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Are you sure you want to delete this email template?</p>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-left">
            <div className="font-medium text-gray-800 dark:text-white/90">
              #{template.id} - {template.subject}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Type: <span className="font-mono">{template.type}</span> |
              Slug: <span className="font-mono">{template.slug}</span> |
              Locale: <span className="font-mono">{template.locale.toUpperCase()}</span>
            </div>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-600 dark:hover:border-red-700"
          >
            {loading ? "Deleting..." : "Delete Template"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}