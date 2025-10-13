"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailTemplates() {
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
      <PageBreadcrumb pageTitle="Email Templates" />

      <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Email Templates Management
          </h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Template
          </button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Email template management system
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Create, edit, and manage email templates with MJML and text formats.
          </p>
        </div>
      </div>
    </div>
  );
}