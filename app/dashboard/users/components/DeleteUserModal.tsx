"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { User } from "../types";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  loading?: boolean;
}

export default function DeleteUserModal({ isOpen, onClose, onConfirm, user, loading = false }: DeleteUserModalProps) {
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmailConfirmation("");
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!user) {
      return;
    }

    if (emailConfirmation !== user.email) {
      setError("Email address does not match. Please type the exact email address.");
      return;
    }

    setError(null);
    onConfirm();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailConfirmation(e.target.value);
    if (error) {
      setError(null); // Clear error when user starts typing
    }
  };

  const isEmailMatching = user && emailConfirmation === user.email;

  if (!user) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete User</h3>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white mb-1">{user.name || "Unnamed User"}</div>
            <div className="text-gray-600 dark:text-gray-400">{user.email}</div>
            <div className="mt-2">
              {user.admin && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Admin
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ml-2">
                {user.locale.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To confirm deletion, please type the user&apos;s email address:
          </label>
          <input
            type="email"
            value={emailConfirmation}
            onChange={handleEmailChange}
            placeholder={user.email}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
          disabled={!isEmailMatching || loading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Deleting..." : "Delete User"}
        </Button>
      </div>
    </Modal>
  );
}
