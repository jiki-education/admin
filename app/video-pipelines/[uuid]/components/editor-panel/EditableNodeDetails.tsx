"use client";

import { useState } from "react";
import Section from "./Section";
import type { Node } from "@/lib/nodes/types";

interface EditableNodeDetailsProps {
  node: Node;
  pipelineUuid: string;
  onUpdate: (pipelineUuid: string, nodeUuid: string, updates: Partial<Node>) => Promise<void>;
}

export default function EditableNodeDetails({ node, pipelineUuid, onUpdate }: EditableNodeDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<'inputs' | 'config' | 'asset' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    inputs: JSON.stringify(node.inputs, null, 2),
    config: JSON.stringify(node.config, null, 2),
    asset: node.asset ? JSON.stringify(node.asset, null, 2) : ''
  });

  const handleEdit = (field: 'inputs' | 'config' | 'asset') => {
    setIsEditing(true);
    setEditingField(field);
    // Reset form data to current node values
    setFormData({
      inputs: JSON.stringify(node.inputs, null, 2),
      config: JSON.stringify(node.config, null, 2),
      asset: node.asset ? JSON.stringify(node.asset, null, 2) : ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingField(null);
    // Reset form data
    setFormData({
      inputs: JSON.stringify(node.inputs, null, 2),
      config: JSON.stringify(node.config, null, 2),
      asset: node.asset ? JSON.stringify(node.asset, null, 2) : ''
    });
  };

  const handleSave = async () => {
    if (!editingField) {
      return;
    }

    setIsUpdating(true);
    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(formData[editingField]);
      } catch (parseError) {
        throw new Error(`Invalid JSON format for ${editingField}`);
      }

      const updates: Partial<Node> = {};
      updates[editingField] = parsedValue;

      await onUpdate(pipelineUuid, node.uuid, updates);
      setIsEditing(false);
      setEditingField(null);
    } catch (error) {
      // Error handling is done in the store action, but we can show field-specific feedback
      console.error(`Failed to update ${editingField}:`, error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFormChange = (field: 'inputs' | 'config' | 'asset', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderEditableField = (
    title: string,
    field: 'inputs' | 'config' | 'asset',
    data: any,
    showAsset: boolean = true
  ) => {
    if (!showAsset && field === 'asset' && (!node.asset || Object.keys(node.asset).length === 0)) {
      return null;
    }

    const isEmpty = field === 'asset' ? !data : Object.keys(data || {}).length === 0;
    const isCurrentlyEditing = isEditing && editingField === field;

    return (
      <Section title={title}>
        {isCurrentlyEditing ? (
          <div className="space-y-3">
            <textarea
              value={formData[field]}
              onChange={(e) => handleFormChange(field, e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-mono"
              placeholder={`Enter ${field} JSON...`}
              disabled={isUpdating}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isUpdating}
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
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {isEmpty ? (
                  <p className="text-sm text-gray-500">No {field}</p>
                ) : field === 'inputs' ? (
                  <div className="space-y-2">
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-semibold text-gray-700">{key}:</span>{" "}
                        {Array.isArray(value) ? (
                          <div className="ml-4 mt-1 space-y-1">
                            {(value as string[]).map((id, idx) => (
                              <div key={idx} className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {id}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">{String(value)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
              <button
                onClick={() => handleEdit(field)}
                disabled={isEditing}
                className="ml-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </Section>
    );
  };

  return (
    <>
      {/* Inputs */}
      {renderEditableField("Inputs", "inputs", node.inputs)}

      {/* Config */}
      {renderEditableField("Configuration", "config", node.config)}

      {/* Asset (for asset nodes) */}
      {node.type === "asset" && renderEditableField("Asset", "asset", node.asset)}

      {/* Metadata (read-only) */}
      {node.metadata && Object.keys(node.metadata).length > 0 && (
        <Section title="Metadata">
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(node.metadata, null, 2)}</pre>
        </Section>
      )}

      {/* Output (read-only) */}
      {node.output && Object.keys(node.output).length > 0 && (
        <Section title="Output">
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(node.output, null, 2)}</pre>
        </Section>
      )}
    </>
  );
}