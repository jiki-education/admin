"use client";

import { useRedirectIfAuthenticated } from "@/lib/auth/hooks";
import SignInForm from "@/components/auth/SignInForm";

export default function HomePage() {
  const { isLoading } = useRedirectIfAuthenticated();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in form for non-authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Jiki Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">Administrative dashboard for the Jiki learning platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
