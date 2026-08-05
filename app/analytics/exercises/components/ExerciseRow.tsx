import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ExerciseAnalytics } from "../types";
import { NULL_DISPLAY, formatNumber, formatPct } from "../utils/format";
import HealthBadge from "./HealthBadge";

// Thresholds above/below which a cell gets a subtle red highlight
const BAD_ABANDON_PCT = 8;
const BAD_BOUNCE_PCT = 15;
const BAD_AVG_FUN = 3.3;

const CELL_CLASSES = "px-5 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap";
const BAD_CELL_CLASSES = "px-5 py-3 text-sm text-error-600 dark:text-error-500 whitespace-nowrap";
const MUTED_CLASSES = "text-gray-400 dark:text-gray-500";

interface ExerciseRowProps {
  exercise: ExerciseAnalytics;
}

export default function ExerciseRow({ exercise }: ExerciseRowProps) {
  const isBadBounce = exercise.bounce_pct != null && exercise.bounce_pct >= BAD_BOUNCE_PCT;
  const isBadAbandon = exercise.abandon_pct != null && exercise.abandon_pct >= BAD_ABANDON_PCT;
  const isBadFun = exercise.avg_fun != null && exercise.avg_fun <= BAD_AVG_FUN;

  return (
    <TableRow className={exercise.low_sample ? "opacity-60" : undefined}>
      <TableCell className={CELL_CLASSES}>
        <div className="font-mono font-medium text-gray-800 dark:text-white/90">{exercise.slug}</div>
      </TableCell>
      <TableCell className={CELL_CLASSES}>
        <HealthBadge score={exercise.health_score} lowSample={exercise.low_sample} />
      </TableCell>
      <TableCell className={CELL_CLASSES}>
        {exercise.num_starts}
        {exercise.num_in_progress > 0 && (
          <span className={`ml-1 text-theme-xs ${MUTED_CLASSES}`}>+{exercise.num_in_progress} active</span>
        )}
      </TableCell>
      <TableCell className={CELL_CLASSES}>{formatPct(exercise.completion_pct)}</TableCell>
      <TableCell className={isBadBounce ? BAD_CELL_CLASSES : CELL_CLASSES}>{formatPct(exercise.bounce_pct)}</TableCell>
      <TableCell className={isBadAbandon ? BAD_CELL_CLASSES : CELL_CLASSES}>
        {formatPct(exercise.abandon_pct)}
      </TableCell>
      <TableCell className={CELL_CLASSES}>{formatPct(exercise.reach_start_pct)}</TableCell>
      <TableCell className={CELL_CLASSES}>
        {formatNumber(exercise.completer_median_attempts)}
        {exercise.completer_p90_attempts != null && (
          <span className={`ml-1 text-theme-xs ${MUTED_CLASSES}`}>/ p90 {exercise.completer_p90_attempts}</span>
        )}
      </TableCell>
      <TableCell className={CELL_CLASSES}>{formatNumber(exercise.struggle_ratio, 2)}</TableCell>
      <TableCell className={CELL_CLASSES}>{formatNumber(exercise.median_minutes_to_complete, 1)}</TableCell>
      <TableCell className={isBadFun ? BAD_CELL_CLASSES : CELL_CLASSES}>
        {exercise.avg_difficulty == null && exercise.avg_fun == null
          ? NULL_DISPLAY
          : `${formatNumber(exercise.avg_difficulty, 2)} / ${formatNumber(exercise.avg_fun, 2)}`}
      </TableCell>
      <TableCell className={CELL_CLASSES}>{formatPct(exercise.ask_jiki_pct)}</TableCell>
    </TableRow>
  );
}
