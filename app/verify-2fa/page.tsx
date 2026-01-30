"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TwoFactorVerifyForm from "./components/TwoFactorVerifyForm";

export default function Verify2FAPage() {
  const router = useRouter();
  const { twoFactorPending, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!twoFactorPending) {
      router.push(isAuthenticated ? "/dashboard" : "/signin");
    }
  }, [twoFactorPending, isAuthenticated, router]);

  if (!twoFactorPending) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <TwoFactorVerifyForm />
      </div>
    </div>
  );
}
