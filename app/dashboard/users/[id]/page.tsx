"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  getUser,
  deleteUser,
  resetUserPassword,
  resetUserOtp,
  updateUser
} from "@/lib/api/users";
import type { User } from "../types";

type ActionState = { kind: "idle" } | { kind: "running"; action: string } | { kind: "error"; message: string };

export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [action, setAction] = useState<ActionState>({ kind: "idle" });
  const [notice, setNotice] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const loadUser = useCallback(async () => {
    if (!userId || isNaN(userId)) {
      setLoadError("Invalid user ID");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError(null);
      const fetched = await getUser(userId);
      setUser(fetched);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const runAction = useCallback(
    async (label: string, fn: () => Promise<User | void>, successMessage: string) => {
      setAction({ kind: "running", action: label });
      setNotice(null);
      try {
        const result = await fn();
        if (result) {
          setUser(result);
        }
        setNotice(successMessage);
        setAction({ kind: "idle" });
      } catch (err) {
        setAction({ kind: "error", message: err instanceof Error ? err.message : `${label} failed` });
      }
    },
    []
  );

  const handleToggleAdmin = useCallback(() => {
    if (!user) {
      return;
    }
    const next = !user.admin;
    if (!window.confirm(`${next ? "Grant" : "Revoke"} admin access for ${user.email}?`)) {
      return;
    }
    void runAction(
      "Update admin",
      () => updateUser(user.id, { admin: next }),
      `${next ? "Granted" : "Revoked"} admin access`
    );
  }, [user, runAction]);

  const handleResetOtp = useCallback(() => {
    if (!user) {
      return;
    }
    if (!window.confirm(`Disable 2FA for ${user.email}? They'll need to set it up again on next login.`)) {
      return;
    }
    void runAction("Reset 2FA", () => resetUserOtp(user.id), "2FA disabled");
  }, [user, runAction]);

  const handleDelete = useCallback(() => {
    if (!user) {
      return;
    }
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) {
      return;
    }
    setAction({ kind: "running", action: "Delete user" });
    setNotice(null);
    deleteUser(user.id)
      .then(() => router.push("/dashboard/users"))
      .catch((err: unknown) => {
        setAction({ kind: "error", message: err instanceof Error ? err.message : "Delete failed" });
      });
  }, [user, router]);

  const handlePasswordSubmit = useCallback(
    (newPassword: string) => {
      if (!user) {
        return;
      }
      void runAction(
        "Reset password",
        async () => {
          await resetUserPassword(user.id, newPassword);
        },
        "Password reset"
      ).then(() => setPasswordModalOpen(false));
    },
    [user, runAction]
  );

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-gray-600 dark:text-gray-400">Loading user...</div>
        </div>
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div>
        <PageBreadcrumb pageTitle="User" />
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-red-700 dark:text-red-400">{loadError ?? "User not found"}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push("/dashboard/users")}>
              Back to users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isRunning = action.kind === "running";

  return (
    <div>
      <PageBreadcrumb pageTitle={`User #${user.id}`} />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {user.name || "Unnamed User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard/users")}>
              Back
            </Button>
          </div>

          {notice && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">{notice}</p>
            </div>
          )}

          {action.kind === "error" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{action.message}</p>
            </div>
          )}

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Field label="ID" value={`#${user.id}`} />
            <Field label="Email" value={user.email} />
            <Field label="Name" value={user.name || "—"} />
            <Field label="Locale" value={user.locale.toUpperCase()} />
            <Field label="Admin" value={user.admin ? "Yes" : "No"} />
          </dl>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
              Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setPasswordModalOpen(true)} disabled={isRunning}>
                Reset password
              </Button>
              <Button variant="outline" onClick={handleResetOtp} disabled={isRunning}>
                Reset 2FA
              </Button>
              <Button variant="outline" onClick={handleToggleAdmin} disabled={isRunning}>
                {user.admin ? "Revoke admin" : "Make admin"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isRunning}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                Delete user
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ResetPasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        loading={action.kind === "running" && action.action === "Reset password"}
        userEmail={user.email}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  loading: boolean;
  userEmail: string;
}

function ResetPasswordModal({ isOpen, onClose, onSubmit, loading, userEmail }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    onSubmit(password);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reset password</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Set a new password for {userEmail}. They&apos;ll need to use this to log in next time.
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) {
              setError(null);
            }
          }}
          disabled={loading}
          autoFocus
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 8 characters.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleSubmit} disabled={password.length < 8 || loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </div>
    </Modal>
  );
}
