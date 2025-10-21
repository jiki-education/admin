import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import type { SceneConfig } from "@/lib/remotion/types";
import { calculateActionTimings } from "@/lib/remotion/timing";
import { AnimatedCode } from "./AnimatedCode";

export interface CodeSceneProps {
  config: SceneConfig;
}

export const CodeScene: React.FC<CodeSceneProps> = (props) => {
  const { config } = props;
  const fps = 30;
  const timings = calculateActionTimings(config.actions, fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: config.backgroundColor ?? "#1e1e1e",
        padding: 60,
        fontFamily: "monospace",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* Render each action as a sequence */}
      {timings.map((timing, index) => {
        if (timing.action.type === "pause") {
          // Pause - just hold the current state
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (timing.action.type === "type") {
          return (
            <Sequence key={index} from={timing.startFrame} durationInFrames={timing.endFrame - timing.startFrame}>
              <AnimatedCode action={timing.action} startFrame={timing.startFrame} theme={config.theme} />
            </Sequence>
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
