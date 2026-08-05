import React from "react";
import type { ExerciseInsight, InsightType } from "../types";

interface InsightsPanelProps {
  insights: ExerciseInsight[];
}

const TYPE_LABELS: Record<InsightType, string> = {
  difficulty_wall: "Difficulty wall",
  bounce: "Bounce",
  pre_start_dropoff: "Pre-start dropoff",
  fun_crash: "Fun crash",
  ask_jiki_underuse: "Ask Jiki underuse"
};

const SEVERITY_STYLES = {
  high: {
    card: "border-error-500 bg-error-50 dark:bg-error-500/10",
    badge: "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-400"
  },
  medium: {
    card: "border-warning-500 bg-warning-50 dark:bg-warning-500/10",
    badge: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400"
  }
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Insights</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">No issues detected</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Insights</h2>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <InsightCard key={`${insight.lesson_id}-${insight.type}-${index}`} insight={insight} />
        ))}
      </ul>
    </div>
  );
}

function InsightCard({ insight }: { insight: ExerciseInsight }) {
  const styles = SEVERITY_STYLES[insight.severity];

  return (
    <li className={`rounded-lg border-l-4 p-4 ${styles.card}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono font-medium text-gray-800 dark:text-white/90 hover:underline cursor-pointer">
          {insight.slug}
        </span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${styles.badge}`}>
          {humanizeInsightType(insight.type)}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{insight.message}</p>
    </li>
  );
}

function humanizeInsightType(type: InsightType): string {
  // Fall back to humanizing the raw value in case the API adds new insight types
  const label = (TYPE_LABELS as Record<string, string | undefined>)[type];
  return label ?? capitalize(type.replaceAll("_", " "));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
