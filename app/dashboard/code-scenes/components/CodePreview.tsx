"use client";

import { useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { SceneConfig, TypeAction } from "@/lib/remotion/types";

interface CodePreviewProps {
  config: SceneConfig;
}

export default function CodePreview({ config }: CodePreviewProps) {
  const finalCode = useMemo(() => {
    const typeActions = config.actions.filter((action) => action.type === "type") as TypeAction[];
    return typeActions.map((action) => action.code).join("\n");
  }, [config.actions]);

  const firstTypeAction = config.actions.find((action) => action.type === "type") as TypeAction | undefined;
  const language = firstTypeAction?.language || "javascript";
  const theme = config.theme || "dark";

  if (!finalCode.trim()) {
    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Preview</h3>
        <div className="text-center py-8 text-gray-500">
          No code to preview. Add a type action to see the code.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Preview</h3>
      <div 
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: config.backgroundColor || "#1e1e1e" }}
      >
        <SyntaxHighlighter
          language={language}
          style={theme === "dark" ? vscDarkPlus : prism}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            backgroundColor: "transparent",
            fontSize: "14px",
            lineHeight: 1.5
          }}
          showLineNumbers={true}
        >
          {finalCode}
        </SyntaxHighlighter>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span><strong>Language:</strong> {language}</span>
          <span><strong>Theme:</strong> {theme}</span>
          <span><strong>Actions:</strong> {config.actions.length}</span>
        </div>
      </div>
    </div>
  );
}