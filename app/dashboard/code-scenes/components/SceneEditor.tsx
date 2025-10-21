"use client";

import { useState } from "react";
import type { SceneConfig, Action, TypeAction, PauseAction } from "@/lib/remotion/types";
import Button from "@/components/ui/button/Button";
import ActionEditor from "./ActionEditor";
import CodePreview from "./CodePreview";

interface SceneEditorProps {
  config: SceneConfig;
  onChange: (config: SceneConfig) => void;
}

export default function SceneEditor({ config, onChange }: SceneEditorProps) {
  const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(null);

  const addAction = (type: "type" | "pause") => {
    const newAction: Action = type === "type" 
      ? {
          type: "type",
          code: "",
          speed: "normal",
          language: "javascript"
        }
      : {
          type: "pause",
          duration: 1.0
        };

    const newActions = [...config.actions, newAction];
    onChange({ ...config, actions: newActions });
    setSelectedActionIndex(newActions.length - 1);
  };

  const updateAction = (index: number, action: Action) => {
    const newActions = [...config.actions];
    newActions[index] = action;
    onChange({ ...config, actions: newActions });
  };

  const deleteAction = (index: number) => {
    const newActions = config.actions.filter((_, i) => i !== index);
    onChange({ ...config, actions: newActions });
    if (selectedActionIndex === index) {
      setSelectedActionIndex(null);
    } else if (selectedActionIndex !== null && selectedActionIndex > index) {
      setSelectedActionIndex(selectedActionIndex - 1);
    }
  };

  const moveAction = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === config.actions.length - 1)
    ) {
      return;
    }

    const newActions = [...config.actions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    [newActions[index], newActions[targetIndex]] = [newActions[targetIndex], newActions[index]];
    
    onChange({ ...config, actions: newActions });
    
    if (selectedActionIndex === index) {
      setSelectedActionIndex(targetIndex);
    } else if (selectedActionIndex === targetIndex) {
      setSelectedActionIndex(index);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAction("type")}
            >
              + Type
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAction("pause")}
            >
              + Pause
            </Button>
          </div>
        </div>

        {config.actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No actions yet. Add your first action above.
          </div>
        ) : (
          <div className="space-y-2">
            {config.actions.map((action, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedActionIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedActionIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                          action.type === "type"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {action.type}
                      </span>
                      <span className="text-sm text-gray-700">
                        {action.type === "type" 
                          ? (action as TypeAction).code.slice(0, 50) + (action.code.length > 50 ? "..." : "")
                          : `${(action as PauseAction).duration}s pause`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAction(index, "up");
                      }}
                      disabled={index === 0}
                      className="text-xs px-2 py-1"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAction(index, "down");
                      }}
                      disabled={index === config.actions.length - 1}
                      className="text-xs px-2 py-1"
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAction(index);
                      }}
                      className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Editor */}
      {selectedActionIndex !== null && (
        <ActionEditor
          action={config.actions[selectedActionIndex]}
          onChange={(action) => updateAction(selectedActionIndex, action)}
          onClose={() => setSelectedActionIndex(null)}
        />
      )}

      {/* Code Preview */}
      <CodePreview config={config} />
    </div>
  );
}