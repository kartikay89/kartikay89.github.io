import { TaskRow } from "./TaskRow";
import type { Task, LifeArea } from "../../types";
import type { TimerControls } from "../../hooks/usePomodoro";

const PRIORITY_GROUPS = [
  { key: "urgent", label: "URGENT", color: "text-red-600", border: "border-red-200", bg: "bg-red-50" },
  { key: "important", label: "IMPORTANT", color: "text-orange-500", border: "border-orange-200", bg: "bg-orange-50" },
  { key: "normal", label: "NORMAL", color: "text-slate-500", border: "border-slate-200", bg: "bg-slate-50" },
  { key: "low", label: "LOW", color: "text-green-600", border: "border-green-200", bg: "bg-green-50" },
];

interface TaskListProps {
  tasks: Task[];
  areas: LifeArea[];
  selectedTaskId: string | null;
  runningTaskId: string | null;
  timerStatus: TimerControls["status"];
  onSelectTask: (task: Task) => void;
  onToggleTimer: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export function TaskList({ tasks, areas, selectedTaskId, runningTaskId, timerStatus, onSelectTask, onToggleTimer, onToggleComplete }: TaskListProps) {
  const getArea = (areaId: string) => areas.find((a) => a.id === areaId) ?? areas[0];
  const hasUrgentPending = tasks.some((t) => t.priority === "urgent" && t.status !== "completed");

  return (
    <div className="flex flex-col gap-1">
      {hasUrgentPending && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 mb-2">
          <span>ℹ️</span>
          Urgent tasks are shown at the top. Complete them first to stay on track!
        </div>
      )}
      {PRIORITY_GROUPS.map(({ key, label, color }) => {
        const group = tasks.filter((t) => t.priority === key);
        if (group.length === 0) return null;
        return (
          <div key={key} className="mb-2">
            <div className="flex items-center gap-2 px-1 mb-1.5">
              <span className={`text-[11px] font-bold tracking-widest ${color}`}>
                {key === "urgent" ? "⚡" : key === "important" ? "🔥" : key === "low" ? "◇" : ""} {label}
              </span>
              <span className="text-[11px] text-gray-400">{group.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {group.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  area={getArea(task.areaId)}
                  isSelected={task.id === selectedTaskId}
                  isRunning={task.id === runningTaskId && timerStatus === "running"}
                  isPaused={task.id === runningTaskId && timerStatus === "paused"}
                  hasUrgentPending={hasUrgentPending}
                  onSelect={() => onSelectTask(task)}
                  onToggleTimer={() => onToggleTimer(task)}
                  onToggleComplete={() => onToggleComplete(task.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">
          No tasks for today. Add one!
        </div>
      )}
    </div>
  );
}
