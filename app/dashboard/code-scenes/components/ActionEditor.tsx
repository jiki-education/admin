"use client";

import type { Action, TypingSpeed } from "@/lib/remotion/types";
import Button from "@/components/ui/button/Button";

interface ActionEditorProps {
  action: Action;
  onChange: (action: Action) => void;
  onClose: () => void;
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "scala",
  "html",
  "css",
  "json",
  "sql",
  "bash",
  "yaml"
];

const TYPING_SPEEDS: { value: TypingSpeed; label: string; description: string }[] = [
  { value: "slow", label: "Slow", description: "10 chars/sec - for emphasis" },
  { value: "normal", label: "Normal", description: "15 chars/sec - default speed" },
  { value: "fast", label: "Fast", description: "25 chars/sec - for boilerplate" }
];

export default function ActionEditor({ action, onChange, onClose }: ActionEditorProps) {
  if (action.type === "type") {
    const typeAction = action;

    const handleCodeChange = (code: string) => {
      onChange({ ...typeAction, code });
    };

    const handleSpeedChange = (speed: TypingSpeed) => {
      onChange({ ...typeAction, speed });
    };

    const handleLanguageChange = (language: string) => {
      onChange({ ...typeAction, language });
    };

    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Type Action</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <textarea
              id="code"
              value={typeAction.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter your code here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language"
                value={typeAction.language || "javascript"}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="speed" className="block text-sm font-medium text-gray-700 mb-1">
                Typing Speed
              </label>
              <select
                id="speed"
                value={Array.isArray(typeAction.speed) ? "normal" : typeAction.speed}
                onChange={(e) => handleSpeedChange(e.target.value as TypingSpeed)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TYPING_SPEEDS.map((speed) => (
                  <option key={speed.value} value={speed.value}>
                    {speed.label} - {speed.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (action.type === "pause") {
    const pauseAction = action;

    const handleDurationChange = (duration: number) => {
      onChange({ ...pauseAction, duration });
    };

    return (
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Pause Action</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              id="duration"
              value={pauseAction.duration}
              onChange={(e) => handleDurationChange(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.0"
            />
            <p className="text-sm text-gray-500 mt-1">
              How long to pause before the next action
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}