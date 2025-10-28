import type { SceneConfig } from "@/lib/remotion/types";

export interface ExportedScene {
  version: "1.0";
  title: string;
  description?: string;
  config: SceneConfig;
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: "jiki-admin";
  };
}

/**
 * Export a scene configuration to JSON
 */
export function exportScene(
  title: string,
  config: SceneConfig,
  description?: string,
  exportedBy: string = "unknown"
): string {
  const exportData: ExportedScene = {
    version: "1.0",
    title,
    description,
    config,
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy,
      source: "jiki-admin"
    }
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import a scene configuration from JSON string
 */
export function importScene(jsonString: string): {
  success: boolean;
  data?: ExportedScene;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString) as ExportedScene;

    // Validate the structure
    if (!data.version || !data.title || !data.config) {
      return {
        success: false,
        error: "Invalid scene file format. Missing required fields."
      };
    }

    if (data.version !== "1.0") {
      return {
        success: false,
        error: `Unsupported scene file version: ${data.version}. Expected version 1.0.`
      };
    }

    // Validate config structure
    if (!data.config.title || !Array.isArray(data.config.actions)) {
      return {
        success: false,
        error: "Invalid scene configuration. Missing title or actions."
      };
    }

    // Validate actions
    for (let i = 0; i < data.config.actions.length; i++) {
      const action = data.config.actions[i];
      if (!action.type || (action.type !== "type" && action.type !== "pause")) {
        return {
          success: false,
          error: `Invalid action type at position ${i + 1}: ${action.type}`
        };
      }

      if (action.type === "type") {
        if (typeof action.code !== "string" || !action.speed) {
          return {
            success: false,
            error: `Invalid type action at position ${i + 1}: missing code or speed`
          };
        }
      }

      if (action.type === "pause") {
        if (typeof action.duration !== "number" || action.duration <= 0) {
          return {
            success: false,
            error: `Invalid pause action at position ${i + 1}: invalid duration`
          };
        }
      }
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse JSON"
    };
  }
}

/**
 * Download a scene configuration as a JSON file
 */
export function downloadSceneFile(title: string, config: SceneConfig, description?: string, exportedBy?: string): void {
  const jsonContent = exportScene(title, config, description, exportedBy);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9-_]/g, "_")}_scene.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Trigger file picker to import a scene
 */
export function pickSceneFile(): Promise<{
  success: boolean;
  data?: ExportedScene;
  error?: string;
}> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({
          success: false,
          error: "No file selected"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = importScene(content);
        resolve(result);
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: "Failed to read file"
        });
      };

      reader.readAsText(file);
    };

    input.oncancel = () => {
      resolve({
        success: false,
        error: "File selection cancelled"
      });
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}
