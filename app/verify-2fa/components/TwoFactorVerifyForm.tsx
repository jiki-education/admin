"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OTPInput from "@/components/auth/OTPInput";

export default function TwoFactorVerifyForm() {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { verify2FA, clear2FAState } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await verify2FA(otpCode);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtpCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clear2FAState();
    router.push("/signin");
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Two-Factor Authentication
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter the 6-digit code from your authenticator app</p>
      </div>

      <form onSubmit={handleSubmit}>
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
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Cancel and sign in again
          </button>
        </div>
      </form>
    </div>
  );
}
