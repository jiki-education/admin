"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Player } from "@remotion/player";
import { bundle } from "@remotion/bundler";
import { CodeScene, type CodeSceneProps } from "./CodeScene";
import { calculateSceneDuration } from "@/lib/remotion/timing";
import type { SceneConfig } from "@/lib/remotion/types";

interface RemotionPreviewProps {
  config: SceneConfig;
  width?: number;
  height?: number;
  className?: string;
}

export function RemotionPreview({ 
  config, 
  width = 640, 
  height = 360, 
  className = "" 
}: RemotionPreviewProps) {
  const [bundleUrl, setBundleUrl] = useState<string | null>(null);
  const [bundling, setBundling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fps = 30;
  const durationInFrames = useMemo(() => 
    calculateSceneDuration(config.actions, fps), 
    [config.actions, fps]
  );

  const inputProps: CodeSceneProps = useMemo(() => ({
    config
  }), [config]);

  useEffect(() => {
    let cancelled = false;

    async function createBundle() {
      try {
        setBundling(true);
        setError(null);

        const bundleLocation = await bundle({
          entryPoint: require.resolve("./index.ts"),
          webpackOverride: (config) => {
            // Ensure we can resolve the components
            return {
              ...config,
              resolve: {
                ...config.resolve,
                alias: {
                  ...config.resolve?.alias,
                  "@": process.cwd(),
                },
              },
            };
          },
        });

        if (!cancelled) {
          setBundleUrl(bundleLocation);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error bundling Remotion:", err);
          setError(err instanceof Error ? err.message : "Failed to bundle");
        }
      } finally {
        if (!cancelled) {
          setBundling(false);
        }
      }
    }

    void createBundle();

    return () => {
      cancelled = true;
    };
  }, []);

  if (bundling) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading preview...</div>
        </div>
      </div>
    );
  }

  if (error || !bundleUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-white text-center p-4">
          <div className="text-red-400 mb-2">Preview Error</div>
          <div className="text-sm opacity-75">
            {error || "Failed to load preview"}
          </div>
          <div className="text-xs opacity-50 mt-2">
            Try opening Remotion Studio with: pnpm dev:remotion
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Player
        component={CodeScene}
        compositionWidth={1920}
        compositionHeight={1080}
        durationInFrames={durationInFrames}
        fps={fps}
        style={{
          width,
          height,
          borderRadius: "8px",
          overflow: "hidden",
        }}
        inputProps={inputProps}
        serveUrl={bundleUrl}
        loop
        controls
        showVolumeControls={false}
        clickToPlay
      />
    </div>
  );
}