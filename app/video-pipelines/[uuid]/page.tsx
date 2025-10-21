"use client";

import Link from "next/link";
import { useEffect, useState, use, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { getPipeline } from "@/lib/api/video-pipelines";
import type { VideoProductionPipeline } from "@/lib/api/video-pipelines";
import type { Node } from "@/lib/nodes/types";
import { toEditorNode } from "@/lib/nodes/types";
import PipelineLayout from "./components/PipelineLayout";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function PipelinePage({ params }: PageProps) {
  const { uuid } = use(params);
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  const [pipeline, setPipeline] = useState<VideoProductionPipeline | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (!hasCheckedAuth) {
      void checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  // Redirect if not authenticated
  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [hasCheckedAuth, isAuthenticated, router]);

  // Load pipeline data
  const loadPipeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get pipeline from admin API
      const data = await getPipeline(uuid);
      setPipeline(data.pipeline);
      // Convert admin VideoProductionNode types to editor Node types
      setNodes(data.nodes.map(toEditorNode));
    } catch (err) {
      console.error("Error loading pipeline from API:", err);
      setError(err instanceof Error ? err.message : "Unknown API error");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    if (!isAuthenticated || !hasCheckedAuth) {
      return;
    }

    void loadPipeline();
  }, [uuid, isAuthenticated, hasCheckedAuth, loadPipeline]);

  // Show loading while checking auth
  if (!hasCheckedAuth) {
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

  // Refresh handler for pipeline data
  const handleRefresh = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      setError(null);
      const data = await getPipeline(uuid);
      setPipeline(data.pipeline);
      setNodes(data.nodes.map(toEditorNode));
    } catch (err) {
      console.error("Error refreshing pipeline:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh pipeline");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <PipelineLayout 
        pipelineUuid={uuid} 
        pipeline={pipeline} 
        nodes={nodes} 
        onRefresh={handleRefresh}
      />
    </div>
  );
}
