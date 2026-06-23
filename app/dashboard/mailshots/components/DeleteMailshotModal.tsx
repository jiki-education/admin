"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { Mailshot } from "../types";

interface DeleteMailshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mailshot: Mailshot | null;
  loading?: boolean;
  error?: string | null;
}

export default function DeleteMailshotModal({
  isOpen,
  onClose,
  onConfirm,
  mailshot,
  loading = false,
  error = null
}: DeleteMailshotModalProps) {
  const [slugConfirmation, setSlugConfirmation] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSlugConfirmation("");
      setLocalError(null);
    }
  }, [isOpen]);

  if (!mailshot) {
    return null;
  }

  const isSlugMatching = slugConfirmation === mailshot.slug;

  const handleConfirm = () => {
    if (!isSlugMatching) {
      setLocalError("Slug does not match. Please type the exact slug.");
      return;
    }
    setLocalError(null);
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Mailshot</h3>
      </div>

      <div className="mb-6">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this draft mailshot? This action cannot be undone.
        </p>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="text-sm">
            <div className="mb-1 font-medium text-gray-900 dark:text-white">{mailshot.slug}</div>
            <div className="text-gray-600 dark:text-gray-400">{mailshot.subject || "No subject"}</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            To confirm deletion, please type the mailshot&apos;s slug:
          </label>
          <input
            type="text"
            value={slugConfirmation}
            onChange={(e) => {
              setSlugConfirmation(e.target.value);
              if (localError) {
                setLocalError(null);
              }
            }}
            placeholder={mailshot.slug}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        {(localError || error) && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">{localError || error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleConfirm}
          disabled={!isSlugMatching || loading}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          {loading ? "Deleting..." : "Delete Mailshot"}
        </Button>
      </div>
    </Modal>
  );
}
