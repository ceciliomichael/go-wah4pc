type StatusVariant = "pending" | "completed" | "failed" | "supported" | "planned";

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
}

const statusStyles: Record<StatusVariant, { bg: string; text: string; border: string }> = {
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
  },
  failed: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  supported: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  planned: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

const defaultLabels: Record<StatusVariant, string> = {
  pending: "PENDING",
  completed: "COMPLETED",
  failed: "FAILED",
  supported: "Supported",
  planned: "Planned",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = statusStyles[status];
  const displayLabel = label || defaultLabels[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {displayLabel}
    </span>
  );
}

interface StatusCardProps {
  status: StatusVariant;
  description: string;
}

export function StatusCard({ status, description }: StatusCardProps) {
  const styles = statusStyles[status];
  const label = defaultLabels[status];

  return (
    <div className={`rounded-lg border p-4 ${styles.border} ${styles.bg}`}>
      <span className={`font-mono text-sm font-bold ${styles.text}`}>
        {label}
      </span>
      <p className={`${styles.text.replace("800", "700")} text-xs mt-1`}>
        {description}
      </p>
    </div>
  );
}