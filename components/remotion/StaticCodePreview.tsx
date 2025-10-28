"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SceneConfig } from "@/lib/remotion/types";
import { calculateActionTimings } from "@/lib/remotion/timing";

interface StaticCodePreviewProps {
  config: SceneConfig;
  width?: number;
  height?: number;
  className?: string;
}

export function StaticCodePreview({ config, width = 640, height = 360, className = "" }: StaticCodePreviewProps) {
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [visibleCode, setVisibleCode] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const fps = 30;
  const timings = useMemo(() => calculateActionTimings(config.actions, fps), [config.actions]);

  // Get all type actions (ignore pauses)
  const typeActions = useMemo(() => config.actions.filter((action) => action.type === "type"), [config.actions]);

  // Auto-cycle through actions for preview
  useEffect(() => {
    if (typeActions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentActionIndex((prev) => (prev + 1) % typeActions.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [typeActions.length]);

  // Simulate typing animation for current action
  useEffect(() => {
    if (typeActions.length === 0) return;

    const currentAction = typeActions[currentActionIndex];
    if (!currentAction || currentAction.type !== "type") return;

    setIsAnimating(true);
    setVisibleCode("");

    const fullCode = currentAction.code;
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullCode.length) {
        setVisibleCode(fullCode.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsAnimating(false);
        clearInterval(typeInterval);
      }
    }, 50); // 50ms per character for smooth preview

    return () => clearInterval(typeInterval);
  }, [currentActionIndex, typeActions]);

  if (typeActions.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-white text-center p-4">
          <div className="text-gray-400 mb-2">No Code Actions</div>
          <div className="text-sm opacity-75">Add type actions to see preview</div>
        </div>
      </div>
    );
  }

  const currentAction = typeActions[currentActionIndex];
  if (!currentAction || currentAction.type !== "type") return null;

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
      {/* Header showing action info */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center text-xs text-gray-400 bg-black/20 rounded px-2 py-1">
        <span>
          Action {currentActionIndex + 1} of {typeActions.length}
        </span>
        <span>{currentAction.language || "javascript"}</span>
      </div>

      {/* Code preview */}
      <div className="h-full flex items-center justify-center p-4 pt-8">
        <div className="w-full h-full overflow-hidden">
          <SyntaxHighlighter
            language={currentAction.language ?? "javascript"}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              backgroundColor: "transparent",
              fontSize: "12px",
              lineHeight: 1.4,
              height: "100%",
              overflow: "hidden"
            }}
            showLineNumbers={true}
          >
            {visibleCode || " "}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Typing indicator */}
      {isAnimating && <div className="absolute bottom-2 right-2 w-2 h-4 bg-white animate-pulse"></div>}

      {/* Background theme */}
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: config.backgroundColor ?? "#1e1e1e" }} />
    </div>
  );
}
