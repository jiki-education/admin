/**
 * Smart Node Positioning System
 *
 * Provides intelligent node placement logic for the video production pipeline editor.
 * Finds optimal positions for new nodes while avoiding overlaps and considering
 * viewport, zoom level, and existing node layout.
 */

import type { Node } from "./types";

// Constants for positioning calculations
const NODE_WIDTH = 280;
const NODE_HEIGHT = 240;
const GRID_SIZE = 50;
const MIN_SPACING = 80;
const CANVAS_CENTER_X = 0;
const CANVAS_CENTER_Y = 0;
const SEARCH_RADIUS_INCREMENT = 150;
const MAX_SEARCH_RADIUS = 1200;

export interface Position {
  x: number;
  y: number;
}

export interface PositioningOptions {
  centerX?: number;
  centerY?: number;
  gridSnap?: boolean;
  minSpacing?: number;
  preferredDirection?: "right" | "down" | "left" | "up";
}

/**
 * Snap position to grid alignment
 */
export function snapToGrid(position: Position, gridSize: number = GRID_SIZE): Position {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}

/**
 * Check if two rectangles overlap
 */
function rectanglesOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Check if a position would cause overlap with existing nodes
 */
function isPositionValid(
  position: Position,
  existingNodes: Node[],
  nodePositions: Record<string, Position>,
  minSpacing: number = MIN_SPACING
): boolean {
  const candidateRect = {
    x: position.x - NODE_WIDTH / 2,
    y: position.y - NODE_HEIGHT / 2,
    width: NODE_WIDTH + minSpacing,
    height: NODE_HEIGHT + minSpacing
  };

  for (const node of existingNodes) {
    const nodePosition = nodePositions[node.uuid];
    if (nodePosition) {
      const existingRect = {
        x: nodePosition.x - NODE_WIDTH / 2 - minSpacing / 2,
        y: nodePosition.y - NODE_HEIGHT / 2 - minSpacing / 2,
        width: NODE_WIDTH + minSpacing,
        height: NODE_HEIGHT + minSpacing
      };

      if (rectanglesOverlap(candidateRect, existingRect)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generate candidate positions in a spiral pattern around a center point
 */
function* generateSpiralPositions(centerX: number, centerY: number, gridSize: number = GRID_SIZE): Generator<Position> {
  // Start at center
  yield { x: centerX, y: centerY };

  let radius = gridSize;
  while (radius <= MAX_SEARCH_RADIUS) {
    const steps = Math.max(1, Math.floor((2 * Math.PI * radius) / gridSize));
    const angleStep = (2 * Math.PI) / steps;

    for (let i = 0; i < steps; i++) {
      const angle = i * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      yield snapToGrid({ x, y }, gridSize);
    }

    radius += SEARCH_RADIUS_INCREMENT;
  }
}

/**
 * Generate candidate positions in preferred direction from center
 */
function* generateDirectionalPositions(
  centerX: number,
  centerY: number,
  direction: "right" | "down" | "left" | "up",
  gridSize: number = GRID_SIZE
): Generator<Position> {
  const spacing = NODE_WIDTH + MIN_SPACING;
  let distance = spacing;

  while (distance <= MAX_SEARCH_RADIUS) {
    let positions: Position[] = [];

    switch (direction) {
      case "right":
        positions = [
          { x: centerX + distance, y: centerY },
          { x: centerX + distance, y: centerY - spacing },
          { x: centerX + distance, y: centerY + spacing }
        ];
        break;
      case "down":
        positions = [
          { x: centerX, y: centerY + distance },
          { x: centerX - spacing, y: centerY + distance },
          { x: centerX + spacing, y: centerY + distance }
        ];
        break;
      case "left":
        positions = [
          { x: centerX - distance, y: centerY },
          { x: centerX - distance, y: centerY - spacing },
          { x: centerX - distance, y: centerY + spacing }
        ];
        break;
      case "up":
        positions = [
          { x: centerX, y: centerY - distance },
          { x: centerX - spacing, y: centerY - distance },
          { x: centerX + spacing, y: centerY - distance }
        ];
        break;
    }

    for (const pos of positions) {
      yield snapToGrid(pos, gridSize);
    }

    distance += spacing;
  }
}

/**
 * Calculate optimal position for a new node
 *
 * Uses intelligent placement algorithms to find the best position:
 * 1. If preferredDirection is specified, search in that direction first
 * 2. Otherwise, use spiral search pattern from center
 * 3. Ensures no overlaps with existing nodes
 * 4. Snaps to grid for consistent alignment
 */
export function calculateNodePosition(
  existingNodes: Node[],
  nodePositions: Record<string, Position>,
  options: PositioningOptions = {}
): Position {
  const {
    centerX = CANVAS_CENTER_X,
    centerY = CANVAS_CENTER_Y,
    gridSnap = true,
    minSpacing = MIN_SPACING,
    preferredDirection
  } = options;

  const gridSize = gridSnap ? GRID_SIZE : 1;

  // If no existing nodes, place at center
  if (existingNodes.length === 0) {
    return snapToGrid({ x: centerX, y: centerY }, gridSize);
  }

  // Calculate the actual center of existing nodes if not explicitly provided
  let effectiveCenterX = centerX;
  let effectiveCenterY = centerY;

  if (centerX === CANVAS_CENTER_X && centerY === CANVAS_CENTER_Y) {
    const positions = existingNodes.map((node) => nodePositions[node.uuid]).filter(Boolean);

    if (positions.length > 0) {
      effectiveCenterX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
      effectiveCenterY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
    }
  }

  // Generate candidate positions
  const positionGenerator = preferredDirection
    ? generateDirectionalPositions(effectiveCenterX, effectiveCenterY, preferredDirection, gridSize)
    : generateSpiralPositions(effectiveCenterX, effectiveCenterY, gridSize);

  // Find first valid position
  for (const position of positionGenerator) {
    if (isPositionValid(position, existingNodes, nodePositions, minSpacing)) {
      return position;
    }
  }

  // Fallback: place far to the right if no position found
  return snapToGrid(
    {
      x: effectiveCenterX + MAX_SEARCH_RADIUS,
      y: effectiveCenterY
    },
    gridSize
  );
}

/**
 * Suggest the best direction to place a new node based on existing layout
 */
export function suggestPlacementDirection(
  existingNodes: Node[],
  nodePositions: Record<string, Position>
): "right" | "down" | "left" | "up" | undefined {
  if (existingNodes.length === 0) {
    return undefined; // No preference for first node
  }

  const positions = existingNodes.map((node) => nodePositions[node.uuid]).filter(Boolean);

  if (positions.length === 0) {
    return undefined;
  }

  // Calculate bounding box of existing nodes
  const minX = Math.min(...positions.map((p) => p.x));
  const maxX = Math.max(...positions.map((p) => p.x));
  const minY = Math.min(...positions.map((p) => p.y));
  const maxY = Math.max(...positions.map((p) => p.y));

  const width = maxX - minX;
  const height = maxY - minY;

  // If layout is wider than tall, prefer placing vertically
  if (width > height * 1.5) {
    return "down";
  }

  // If layout is taller than wide, prefer placing horizontally
  if (height > width * 1.5) {
    return "right";
  }

  // For roughly square layouts, prefer right (left-to-right flow)
  return "right";
}

/**
 * Calculate position for a new node near a specific existing node
 * Useful for inserting nodes into an existing pipeline flow
 */
export function calculatePositionNearNode(
  targetNodeUuid: string,
  existingNodes: Node[],
  nodePositions: Record<string, Position>,
  options: PositioningOptions = {}
): Position | null {
  const targetPosition = nodePositions[targetNodeUuid];
  if (!targetPosition) {
    return null;
  }

  const direction = options.preferredDirection || "right";
  const spacing = NODE_WIDTH + (options.minSpacing || MIN_SPACING);

  let candidatePosition: Position;

  switch (direction) {
    case "right":
      candidatePosition = { x: targetPosition.x + spacing, y: targetPosition.y };
      break;
    case "down":
      candidatePosition = { x: targetPosition.x, y: targetPosition.y + spacing };
      break;
    case "left":
      candidatePosition = { x: targetPosition.x - spacing, y: targetPosition.y };
      break;
    case "up":
      candidatePosition = { x: targetPosition.x, y: targetPosition.y - spacing };
      break;
  }

  if (options.gridSnap !== false) {
    candidatePosition = snapToGrid(candidatePosition);
  }

  // Check if position is valid, if not, fall back to general positioning
  if (isPositionValid(candidatePosition, existingNodes, nodePositions, options.minSpacing)) {
    return candidatePosition;
  }

  // Fallback to general positioning algorithm
  return calculateNodePosition(existingNodes, nodePositions, {
    ...options,
    centerX: targetPosition.x,
    centerY: targetPosition.y
  });
}
