"use client";
import React from "react";
import Button from "@/components/ui/button/Button";

interface LessonErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface LessonErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class LessonErrorBoundary extends React.Component<LessonErrorBoundaryProps, LessonErrorBoundaryState> {
  constructor(props: LessonErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LessonErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LessonErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-red-400">
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Something went wrong</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>An error occurred while loading the lesson data. This might be a temporary issue.</p>
                {this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                      Show error details
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.handleRetry}
                  className="text-red-600 border-red-300 hover:bg-red-100 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/30"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
