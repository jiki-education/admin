"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { SEGMENTS } from "../types";
import type { Mailshot, Segment } from "../types";

interface SendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mailshot: Mailshot;
  segment: Segment;
  loading?: boolean;
  error?: string | null;
}

export default function SendConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  mailshot,
  segment,
  loading = false,
  error = null
}: SendConfirmModalProps) {
  const segmentLabel = SEGMENTS.find((s) => s.value === segment)?.label ?? segment;
  const alreadySent = mailshot.sent_to_audiences.includes(segment);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send mailshot</h3>
      </div>

      <div className="mb-6">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Send <span className="font-medium text-gray-900 dark:text-white">{mailshot.subject || mailshot.slug}</span> to{" "}
          <span className="font-medium text-gray-900 dark:text-white">{segmentLabel}</span>?
        </p>

        <p className="mb-4 text-sm text-gray-500 dark:text-gray-500">
          Users who have already received this mailshot are skipped automatically, so overlapping segments never
          double-send.
        </p>

        {alreadySent && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              This mailshot has already been sent to <strong>{segmentLabel}</strong>. Sending again is a no-op and will
              reach no new users.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </Button>
      </div>
    </Modal>
  );
}
