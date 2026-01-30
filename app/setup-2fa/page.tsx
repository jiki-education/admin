"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TwoFactorSetupForm from "./components/TwoFactorSetupForm";

export default function Setup2FAPage() {
  const router = useRouter();
  const { twoFactorPending, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (twoFactorPending !== "setup") {
      router.push(isAuthenticated ? "/dashboard" : "/signin");
    }
  }, [twoFactorPending, isAuthenticated, router]);

  if (twoFactorPending !== "setup") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <TwoFactorSetupForm />
      </div>
    </div>
  );
}
