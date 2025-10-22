import type { SceneConfig } from "@/lib/remotion/types";

export interface CodeScene {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  config: SceneConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCodeSceneData {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  config: SceneConfig;
}

export interface UpdateCodeSceneData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  config?: SceneConfig;
}

export interface CodeScenesResponse {
  scenes: CodeScene[];
  total: number;
  page: number;
  limit: number;
}

export interface CodeSceneResponse {
  scene: CodeScene;
}