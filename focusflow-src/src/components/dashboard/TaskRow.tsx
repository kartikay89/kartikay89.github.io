import { Play, Pause, MoreHorizontal, Check } from "lucide-react";
import { PriorityBadge } from "../tasks/PriorityBadge";
import { AreaBadge } from "../tasks/AreaBadge";
import { Badge } from "../ui/Badge";
import { formatFocusedTime } from "../../lib/time";
import type { Task, LifeArea } from "../../types";
import { clsx } from "clsx";

interface TaskRowProps {
  task: Task;
  area: LifeArea;
  isSelected: boolean;
  isRunning: boolean;
  hasUrgentPending: boolean;
  onSelect: () => void;
  onToggleTimer: () => void;
  onToggleComplete: () => void;
}

export function TaskRow({ task, area, isSelected, isRunning, onSelect, onToggleTimer, onToggleComplete }: TaskRowProps) {
  const isCompleted = task.status === "completed";

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTimer();
  };

  const handleCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete();
  };

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer group transition-all",
        isSelected
          ? "border-blue-300 bg-blue-50/50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckbox}
        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        className={clsx(
          "flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
          isCompleted ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"
        )}
      >
        {isCompleted && <Check size={12} className="text-white" />}
      </button>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className={clsx("font-medium text-sm truncate", isCompleted ? "line-through text-gray-400" : "text-gray-900")}>
          {task.title}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {task.plannedStart} – {task.plannedEnd}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <AreaBadge area={area} />
        {task.tags.map((tag) => (
          <Badge key={tag} className="text-blue-700 bg-blue-50 border-blue-200">{tag}</Badge>
        ))}
      </div>

      {/* Priority */}
      <div className="flex-shrink-0">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Pomodoros */}
      <div className="flex-shrink-0 text-right w-16">
        <div className="text-xs font-medium text-gray-700">{task.completedPomodoros}/{task.pomodoroGoal}</div>
        <div className="text-xs text-gray-400">{formatFocusedTime(task.focusedSeconds)}</div>
      </div>

      {/* Timer button */}
      <button
        onClick={handleTimerClick}
        aria-label={isRunning ? "Pause" : "Start"}
        className={clsx(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          isRunning ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
        )}
      >
        {isRunning ? <Pause size={14} /> : <Play size={14} />}
      </button>

      {/* Overflow */}
      <button
        onClick={(e) => e.stopPropagation()}
        aria-label="More options"
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}
