import type React from "react";

// Simplified audio component that doesn't require runtime audio generation
// Audio will be added during the actual video production pipeline

interface KeypressSoundsProps {
  frames: number[];
}

export const KeypressSounds: React.FC<KeypressSoundsProps> = ({ frames: _frames }) => {
  // For preview purposes, we don't need actual audio
  // Audio will be handled by the video production pipeline
  return null;
};
