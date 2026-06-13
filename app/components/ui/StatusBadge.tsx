import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    DRAFT: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-200",
    },
    CONFIRMED: {
      bg: "bg-[#eef7f3]",
      text: "text-[#176b5d]",
      border: "border-[#c9dbd5]",
    },
    DELIVERED: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    RECEIVED: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    CANCELLED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    READY: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    WAITING_MATERIALS: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    IN_PROGRESS: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    COMPLETED: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    BUY: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
    },
    MANUFACTURE: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    FINISHED_GOOD: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
    },
    RAW_MATERIAL: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    READY_TO_DELIVER: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    WAITING_INVENTORY: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
  };

  const colors = colorMap[normalizedStatus] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
