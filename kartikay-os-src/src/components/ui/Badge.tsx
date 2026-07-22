import { cn } from "@/lib/cn";
import type { Priority } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "scheduled" | "priority" | "area";
  priority?: Priority;
  className?: string;
}

export function Badge({ children, variant = "default", priority, className }: BadgeProps) {
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
  const variants = {
    default: "bg-slate-100 text-slate-600",
    scheduled: "badge-scheduled",
    priority: priority ? `priority-badge-${priority}` : "bg-slate-100 text-slate-600",
    area: "bg-blue-100 text-blue-700",
  };
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
