"use client";

import { useState } from "react";

interface NodeTitleEditorProps {
  node: any; // Using any for now to match existing pattern
  pipelineUuid: string;
  onUpdate: (pipelineUuid: string, nodeUuid: string, updates: any) => Promise<void>;
}

export default function NodeTitleEditor({ node, pipelineUuid, onUpdate }: NodeTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (title.trim() === node.title) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(pipelineUuid, node.uuid, { title: title.trim() });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the store action
      setTitle(node.title); // Reset to original title on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setTitle(node.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">Node Title</label>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Enter node title..."
            disabled={isUpdating}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUpdating || title.trim() === ""}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-900 font-medium">{node.title}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
