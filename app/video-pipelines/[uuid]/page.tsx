"use client";

import Link from "next/link";
import { useEffect, use } from "react";
import { useRequireAuth } from "@/lib/auth/hooks";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/stores/pipeline";
import PipelineLayout from "./components/PipelineLayout";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function PipelinePage({ params }: PageProps) {
  const { uuid } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();

  const { pipeline, loading, error, loadPipeline, resetStore } = usePipelineStore();

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    void loadPipeline(uuid);

    // Cleanup store when component unmounts
    return () => {
      resetStore();
    };
  }, [uuid, isAuthenticated, authLoading, loadPipeline, resetStore]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading pipeline...</div>
      </div>
    );
  }

  if (error !== null || pipeline === null) {
    return (
      <div className="h-screen flex flex-col">
        <header className="bg-gray-800 text-white px-6 py-4 flex items-center">
          <Link href="/dashboard/video-pipelines" className="text-white hover:text-gray-300">
            ← Back to Pipelines
          </Link>
          <h1 className="flex-1 text-center font-semibold">Pipeline: {uuid}</h1>
          <div className="w-16"></div>
        </header>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-red-50 border border-red-400 rounded-lg p-6 max-w-2xl">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
            <p className="text-sm text-red-600 mt-2">This will work once the Rails API is implemented.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <PipelineLayout pipelineUuid={uuid} onRefresh={() => loadPipeline(uuid)} />
    </div>
  );
}
