"use client";

import { useRedirectIfAuthenticated } from "@/lib/auth/hooks";
import { useState } from "react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignupForm";

export default function HomePage() {
  const { isLoading } = useRedirectIfAuthenticated();
  const [showSignUp, setShowSignUp] = useState(false);

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

  // Show authentication forms for non-authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Jiki Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">Administrative dashboard for the Jiki learning platform</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="mb-6">
            <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                onClick={() => setShowSignUp(false)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  !showSignUp
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  showSignUp
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {showSignUp ? <SignUpForm /> : <SignInForm />}
        </div>
      </div>
    </div>
  );
}
