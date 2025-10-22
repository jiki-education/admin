/**
 * Status Badge Component
 *
 * Displays node execution status with color coding
 */

interface StatusBadgeProps {
  status: string;
  onExecute?: () => void;
}

export default function StatusBadge({ status, onExecute }: StatusBadgeProps) {
  const colors = {
    pending: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-700 animate-pulse",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700"
  };

  const labels = {
    pending: "PENDING",
    in_progress: "PROCESSING",
    completed: "DONE",
    failed: "FAILED"
  };

  // Show execute button for pending or failed status when onExecute is provided
  const showExecuteButton = onExecute && (status === "pending" || status === "failed");

  if (showExecuteButton) {
    return (
      <div className="flex items-center gap-1">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colors[status as keyof typeof colors] || colors.pending}`}
        >
          {labels[status as keyof typeof labels] || status.toUpperCase()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent node selection when clicking execute
            onExecute();
          }}
          className="flex items-center justify-center w-4 h-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors"
          title="Execute this node"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colors[status as keyof typeof colors] || colors.pending}`}
    >
      {labels[status as keyof typeof labels] || status.toUpperCase()}
    </span>
  );
}
