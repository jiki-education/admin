"use client";
import React from "react";
import TextArea from "@/components/form/input/TextArea";

interface TextBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  hint?: string;
}

export default function TextBodyEditor({
  value,
  onChange,
  placeholder = "Enter plain text template content...",
  error = false,
  hint
}: TextBodyEditorProps) {
  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lineCount = value.split('\n').length;

  return (
    <div className="space-y-2">
      <TextArea
        placeholder={placeholder}
        rows={8}
        value={value}
        onChange={onChange}
        error={error}
        hint={hint}
        className="font-mono text-sm"
      />
      
      {/* Stats and Help */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>{characterCount} characters</span>
          <span>{wordCount} words</span>
          <span>{lineCount} lines</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Plain text for email clients without HTML support</span>
        </div>
      </div>

      {/* Template Variables Help */}
      {value.includes('{{') || value.includes('%') && (
        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          💡 Template variables detected. Common patterns: {'{{'}{'{'}variable{'}}'}{'}'}, %variable%, ${'{'}variable{'}'}, etc.
        </div>
      )}
    </div>
  );
}