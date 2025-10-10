"use client";

import { useRequireAuth } from "@/lib/auth/hooks";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  const { logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName} {user.lastName}
              </span>
            )}
            <button
              onClick={() => logout()}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
            <p className="text-gray-600">
              This is a secure admin dashboard. All pages in this application require authentication.
            </p>
            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-900">User Information</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Email: {user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>Verified: {user.isVerified ? "Yes" : "No"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
