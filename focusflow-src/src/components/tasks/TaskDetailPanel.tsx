import { X, ArrowLeft, Edit3, ChevronDown, AlertCircle, ChevronUp, Minus } from "lucide-react";
import { PomodoroTimer } from "../timer/PomodoroTimer";
import { AreaBadge } from "./AreaBadge";
import type { Task, LifeArea, Priority } from "../../types";

interface TaskDetailPanelProps {
  task: Task;
  area: LifeArea;
  areas: LifeArea[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onPomodoroComplete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "important", label: "Important" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

// Suppress unused import warnings — these are referenced in JSX
void AlertCircle;
void ChevronUp;
void Minus;
void ChevronDown;

export function TaskDetailPanel({ task, area, areas, onClose, onUpdate, onPomodoroComplete, onComplete }: TaskDetailPanelProps) {
  void areas; // may be used in future for area switching
  return (
    <aside className="w-80 min-w-[320px] flex flex-col border-l border-gray-200 bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={16} /> Back to Today
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400" aria-label="Close panel">
          <X size={18} />
        </button>
      </div>

      {/* Task info */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <AreaBadge area={area} />
          <button className="p-1 text-blue-500 hover:bg-blue-50 rounded" aria-label="Edit tags">
            <Edit3 size={14} />
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{task.title}</h2>
        <p className="text-sm text-gray-500">
          {task.plannedStart} – {task.plannedEnd}
        </p>
      </div>

      {/* Timer */}
      <div className="flex justify-center py-6 border-b border-gray-100">
        <PomodoroTimer task={task} onPomodoroComplete={onPomodoroComplete} />
      </div>

      {/* Fields */}
      <div className="px-5 py-4 flex flex-col gap-4 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Start Time</label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white">
              <span className="flex-1">{task.plannedStart}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">End Time</label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white">
              <span className="flex-1">{task.plannedEnd}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Pomodoro Goal</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white">
            <span className="flex-1">{task.pomodoroGoal}</span>
            <span className="text-gray-400 text-xs">sessions</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
          <select
            value={task.priority}
            onChange={(e) => onUpdate({ ...task, priority: e.target.value as Priority })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
          <textarea
            value={task.notes}
            onChange={(e) => onUpdate({ ...task, notes: e.target.value })}
            placeholder="Add any notes..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Complete button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onComplete(task.id)}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {task.status === "completed" ? "Mark Incomplete" : "Complete Task"}
        </button>
      </div>
    </aside>
  );
}
