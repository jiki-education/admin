"use client";

import { useCallback } from "react";
import PipelineHeader from "./PipelineHeader";
import PipelineEditor from "./PipelineEditor";

interface PipelineLayoutProps {
  pipelineUuid: string;
  onRefresh?: () => void;
}

export default function PipelineLayout({ pipelineUuid, onRefresh }: PipelineLayoutProps) {
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
      <PipelineEditor />
    </>
  );
}
