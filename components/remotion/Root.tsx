import React from "react";
import { Composition } from "remotion";
import { CodeScene, type CodeSceneProps } from "./CodeScene";
import { calculateSceneDuration } from "@/lib/remotion/timing";
import type { SceneConfig } from "@/lib/remotion/types";

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  
  // Example scene configuration
  const exampleConfig: SceneConfig = {
    title: "Basic Variable Example",
    theme: "dark",
    actions: [
      {
        type: "type",
        code: "let greeting = \"Hello World\";",
        speed: "normal",
        language: "javascript"
      }
    ]
  };

  const defaultProps: CodeSceneProps = {
    config: exampleConfig
  };

  return (
    <>
      <Composition
        id="example-basic"
        component={CodeScene}
        durationInFrames={calculateSceneDuration(exampleConfig.actions, fps)}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
