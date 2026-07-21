import { AlertCircle, ChevronUp, Minus, ChevronDown } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { Priority } from "../../types";

const config: Record<Priority, { icon: React.ReactNode; label: string; className: string }> = {
  urgent: { icon: <AlertCircle size={10} />, label: "Urgent", className: "text-red-600 bg-red-50 border-red-200" },
  important: { icon: <ChevronUp size={10} />, label: "Important", className: "text-orange-600 bg-orange-50 border-orange-200" },
  normal: { icon: <Minus size={10} />, label: "Normal", className: "text-slate-500 bg-slate-50 border-slate-200" },
  low: { icon: <ChevronDown size={10} />, label: "Low", className: "text-green-600 bg-green-50 border-green-200" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = config[priority];
  return <Badge className={c.className}>{c.icon}{c.label}</Badge>;
}
