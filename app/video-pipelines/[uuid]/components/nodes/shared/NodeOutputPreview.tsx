/**
 * Node Output Preview Component
 *
 * Displays node output based on type (image, video, audio, text, or placeholder)
 */

"use client";

import type { Node } from "@/lib/nodes/types";
import Image from "next/image";
import { getOutputPreviewUrl, getOutputDataType } from "@/lib/nodes/display-helpers";
import { getToken } from "@/lib/auth/storage";

interface NodeOutputPreviewProps {
  node: Node;
}

export default function NodeOutputPreview({ node }: NodeOutputPreviewProps) {
  // For asset nodes, check node.asset.source first
  let previewUrl: string | null = null;
  const dataType = getOutputDataType(node);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (node.type === "asset" && node.asset != null) {
    previewUrl = node.asset.source ?? null;
    // Asset type is already reflected in dataType via getOutputDataType
  } else {
    // For other nodes, check output
    previewUrl = getOutputPreviewUrl(node.output ?? null);
  }

  const hasPreview = previewUrl !== null && previewUrl !== "";

  // Determine if video/audio is ready to play
  const isCompleted = node.status === "completed";

  // For videos/audio, construct API URL with auth token
  const pipelineUuid = node.pipeline_uuid;
  const token = getToken();
  const apiVideoUrl =
    isCompleted && (dataType === "video" || dataType === "audio") && token
      ? `/api/videos/${pipelineUuid}/${node.uuid}?token=${encodeURIComponent(token)}`
      : null;

  if (!hasPreview) {
    return (
      <div className="w-full h-24 bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-t border-gray-200">
        <span className="text-2xl mb-1">📦</span>
        <span className="text-xs">No outputs to display</span>
      </div>
    );
  }

  // Helper function to get file type label
  const getFileTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      json: "JSON",
      text: "Text",
      markdown: "Markdown",
      image: "Image",
      video: "Video",
      audio: "Audio"
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  return (
    <div className="border-t border-gray-200">
      {dataType === "image" && previewUrl != null ? (
        <Image src={previewUrl} alt="Output preview" className="w-full object-cover" width={400} height={200} />
      ) : dataType === "video" && apiVideoUrl && isCompleted ? (
        <video src={apiVideoUrl} controls muted className="w-full bg-black" style={{ maxHeight: "200px" }}>
          Your browser does not support video playback.
        </video>
      ) : dataType === "video" ? (
        <div className="w-full h-32 bg-gray-100 flex flex-col items-center justify-center gap-1">
          <span className="text-4xl">🎬</span>
          <span className="text-xs text-gray-600">
            {node.status === "pending" && "Pending"}
            {node.status === "in_progress" && "Processing..."}
            {node.status === "failed" && "Failed"}
          </span>
        </div>
      ) : dataType === "audio" && apiVideoUrl && isCompleted ? (
        <div className="w-full bg-gray-100 p-4">
          <audio src={apiVideoUrl} controls className="w-full">
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : dataType === "audio" ? (
        <div className="w-full h-16 bg-gray-100 flex flex-col items-center justify-center gap-1">
          <span className="text-2xl">🎵</span>
          <span className="text-xs text-gray-600">
            {node.status === "pending" && "Pending"}
            {node.status === "in_progress" && "Processing..."}
            {node.status === "failed" && "Failed"}
          </span>
        </div>
      ) : (
        <div className="w-full h-16 bg-gray-100 flex flex-col items-center justify-center gap-1">
          <span className="text-2xl">📄</span>
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {node.type === "asset" && node.asset != null && (
            <span className="text-xs text-gray-600">{getFileTypeLabel(node.asset.type)}</span>
          )}
        </div>
      )}
    </div>
  );
}
