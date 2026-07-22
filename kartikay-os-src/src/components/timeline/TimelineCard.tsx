import { User, MoreVertical, Timer } from "lucide-react";
import type { Task, LifeArea } from "@/types";
import { cn } from "@/lib/cn";
import { formatDateLabel } from "@/lib/time";

const AREA_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  cyan: "bg-cyan-100 text-cyan-700",
  emerald: "bg-emerald-100 text-emerald-700",
  orange: "bg-orange-100 text-orange-700",
  gray: "bg-gray-100 text-gray-600",
};

const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  urgent: { label: "Urgent", cls: "bg-red-50 text-red-600 border border-red-200" },
  important: { label: "Important", cls: "bg-orange-50 text-orange-600 border border-orange-200" },
  normal: { label: "Scheduled", cls: "bg-green-50 text-green-700 border border-green-200" },
  low: { label: "Low", cls: "bg-green-50 text-green-700 border border-green-200" },
};

interface Props {
  task: Task;
  area?: LifeArea;
  isSelected: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onStartTimer: () => void;
  showDate?: boolean;
  plannedDuration?: string;
}

export function TimelineCard({
  task,
  area,
  isSelected,
  onSelect,
  plannedDuration,
  showDate,
}: Props) {
  const areaColor = area ? (AREA_COLORS[area.color] ?? AREA_COLORS.gray) : AREA_COLORS.gray;
  const badge = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.normal;
  const badgeLabel =
    (task.priority === "normal" || task.priority === "low") && task.scheduledDate
      ? "Scheduled"
      : badge.label;
  const badgeCls =
    (task.priority === "normal" || task.priority === "low") && task.scheduledDate
      ? "bg-green-50 text-green-700 border border-green-200"
      : badge.cls;

  return (
    <div className="flex gap-3 items-start">
      {/* Date column */}
      <div className="w-16 flex-shrink-0 flex flex-col items-end pt-3">
        {showDate && task.scheduledDate && (
          <>
            <span className="text-sm font-semibold text-gray-700">
              {formatDateLabel(task.scheduledDate)}
            </span>
            {plannedDuration && (
              <span className="text-[11px] text-gray-400">{plannedDuration}</span>
            )}
          </>
        )}
      </div>

      {/* Timeline dot + connector */}
      <div className="flex flex-col items-center pt-4 flex-shrink-0">
        <div className="w-3 h-3 bg-[#1463ff] rounded-full border-2 border-white ring-2 ring-[#1463ff]" />
        <div className="w-px bg-gray-200 flex-1 mt-1 min-h-[40px]" />
      </div>

      {/* Card */}
      <button
        onClick={onSelect}
        className={cn(
          "flex-1 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-3 text-left w-full transition-all",
          isSelected && "ring-2 ring-[#1463ff] border-[#1463ff]/20"
        )}
        aria-current={isSelected}
      >
        {/* Row 1: title + area pill + badge + overflow */}
        <div className="flex items-start gap-2">
          <span className="flex-1 font-medium text-gray-900 text-sm leading-5">{task.title}</span>
          {area && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                areaColor
              )}
            >
              {area.name}
            </span>
          )}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
              badgeCls
            )}
          >
            {badgeLabel}
          </span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded flex-shrink-0 -mr-1"
            aria-label="More options"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Row 2: pomodoro progress + tags */}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <User size={11} />
            Pomodoro {task.completedPomodoros} of {task.pomodoroGoal}
          </span>
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md"
            >
              <Timer size={10} />
              {tag}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
