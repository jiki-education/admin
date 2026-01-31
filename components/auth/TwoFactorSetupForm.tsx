"use client";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import OTPInput from "@/components/auth/OTPInput";
import QRCodeDisplay from "@/components/auth/QRCodeDisplay";

interface TwoFactorSetupFormProps {
  provisioningUri: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorSetupForm({
  provisioningUri,
  onSuccess,
  onCancel
}: TwoFactorSetupFormProps) {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setup2FA } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await setup2FA(otpCode);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
      setOtpCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Set Up Two-Factor Authentication
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Scan the QR code with your authenticator app, then enter the code to verify
        </p>
      </div>

      <QRCodeDisplay uri={provisioningUri} />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
              {error}
            </div>
          )}

          <OTPInput value={otpCode} onChange={setOtpCode} disabled={isSubmitting} />

          <button
            type="submit"
            disabled={isSubmitting || otpCode.length !== 6}
            className="w-full inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel and sign in again
          </button>
        </div>
      </form>
    </div>
  );
}
