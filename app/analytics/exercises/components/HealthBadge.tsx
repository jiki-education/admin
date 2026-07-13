import React from "react";
import { Badge } from "@/components/ui/badge/Badge";

interface HealthBadgeProps {
  score: number | null;
  lowSample: boolean;
}

export default function HealthBadge({ score, lowSample }: HealthBadgeProps) {
  if (score == null || lowSample) {
    return (
      <span title="Fewer than 30 classifiable sessions" className="text-gray-400 dark:text-gray-500">
        n/a
      </span>
    );
  }

  return (
    <Badge size="sm" color={colorForScore(score)}>
      {score}
    </Badge>
  );
}

function colorForScore(score: number): "success" | "warning" | "error" {
  if (score >= 80) {
    return "success";
  }
  if (score >= 60) {
    return "warning";
  }
  return "error";
}
