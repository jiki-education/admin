"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs")
        .then((Sentry) => {
          Sentry.captureException(error);
        })
        .catch(() => {});
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">Something went wrong</h1>
          <p className="mb-6 text-gray-700 dark:text-gray-400">We encountered an unexpected error. Sorry about that!</p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
