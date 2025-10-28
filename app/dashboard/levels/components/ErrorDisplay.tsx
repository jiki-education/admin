import React from "react";
import Button from "@/components/ui/button/Button";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
  onGoBack,
  className = ""
}: ErrorDisplayProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 text-red-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-medium text-red-800 dark:text-red-400">{title}</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{message}</p>
          </div>
          {(onRetry || onGoBack) && (
            <div className="mt-4 flex items-center gap-3">
              {onRetry && (
                <Button size="sm" onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white">
                  Try Again
                </Button>
              )}
              {onGoBack && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onGoBack}
                  className="text-red-600 border-red-300 hover:bg-red-100 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
                >
                  Go Back
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
