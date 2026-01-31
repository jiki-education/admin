"use client";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TwoFactorVerifyForm from "./components/TwoFactorVerifyForm";

export default function Verify2FAPage() {
  const router = useRouter();
  const { twoFactorPending, isAuthenticated } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!twoFactorPending && !isRedirecting) {
      setIsRedirecting(true);
      router.push(isAuthenticated ? "/dashboard" : "/signin");
    }
  }, [twoFactorPending, isAuthenticated, router, isRedirecting]);

  if (!twoFactorPending || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <TwoFactorVerifyForm />
      </div>
    </div>
  );
}
