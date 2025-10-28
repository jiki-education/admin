"use client";

import type { NodeType } from "@/lib/nodes/types";

interface SimpleNodeAdderProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddNode: (nodeType: NodeType, assetType?: "text" | "image" | "audio" | "video" | "json") => void;
}

const NODE_TYPES: { type: NodeType; label: string; icon: string }[] = [
  { type: "asset", label: "Asset", icon: "📁" },
  { type: "generate-talking-head", label: "Talking Head", icon: "🗣️" },
  { type: "generate-animation", label: "Animation", icon: "🎬" },
  { type: "generate-voiceover", label: "Voiceover", icon: "🎙️" },
  { type: "render-code", label: "Code Render", icon: "💻" },
  { type: "mix-audio", label: "Mix Audio", icon: "🎵" },
  { type: "merge-videos", label: "Merge Videos", icon: "🔗" },
  { type: "compose-video", label: "Compose Video", icon: "🎯" }
];

const ASSET_TYPES = [
  { type: "text" as const, label: "Text", icon: "📝" },
  { type: "image" as const, label: "Image", icon: "🖼️" },
  { type: "audio" as const, label: "Audio", icon: "🎵" },
  { type: "video" as const, label: "Video", icon: "🎥" },
  { type: "json" as const, label: "JSON", icon: "⚙️" }
];

export default function SimpleNodeAdder({ isOpen, onToggle, onAddNode }: SimpleNodeAdderProps) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors"
        title="Add Node"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Add Node</h3>
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition-colors" title="Close">
          ✕
        </button>
      </div>

      {/* Node Types */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {NODE_TYPES.map((nodeType) => (
          <div key={nodeType.type}>
            {nodeType.type === "asset" ? (
              <div>
                <div className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <span>{nodeType.icon}</span>
                  {nodeType.label}
                </div>
                <div className="ml-4 space-y-1">
                  {ASSET_TYPES.map((assetType) => (
                    <button
                      key={assetType.type}
                      onClick={() => onAddNode("asset", assetType.type)}
                      className="w-full flex items-center gap-2 p-2 text-left border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <span>{assetType.icon}</span>
                      <span className="text-sm">{assetType.label} Asset</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => onAddNode(nodeType.type)}
                className="w-full flex items-center gap-2 p-3 text-left border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <span className="text-lg">{nodeType.icon}</span>
                <span className="text-sm font-medium">{nodeType.label}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
