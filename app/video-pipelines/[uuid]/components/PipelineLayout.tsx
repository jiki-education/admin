"use client";

import { useCallback } from "react";
import type { Node } from "@/lib/nodes/types";
import type { VideoProductionPipeline } from "@/lib/api/video-pipelines";
import PipelineHeader from "./PipelineHeader";
import PipelineEditor from "./PipelineEditor";

interface PipelineLayoutProps {
  pipelineUuid: string;
  pipeline: VideoProductionPipeline;
  nodes: Node[];
  onRefresh?: () => void;
}

export default function PipelineLayout({ pipelineUuid, pipeline, nodes, onRefresh }: PipelineLayoutProps) {
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const handleRelayout = useCallback(() => {
    // This is just a pass-through - the actual logic is in PipelineEditor
  }, []);

  return (
    <>
      <PipelineHeader pipelineUuid={pipelineUuid} onRefresh={handleRefresh} onRelayout={handleRelayout} />
      <PipelineEditor pipeline={pipeline} nodes={nodes} onRefresh={handleRefresh} onRelayout={handleRelayout} />
    </>
  );
}
