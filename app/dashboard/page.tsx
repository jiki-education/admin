"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasCheckedAuth) {
      void checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, hasCheckedAuth, router]);

  if (!hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
          Welcome to Jiki Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administrative dashboard for platform management, user administration, content moderation, and system monitoring.
        </p>
      </div>
    </div>
  );
}