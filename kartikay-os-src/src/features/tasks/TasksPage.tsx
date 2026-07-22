import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { TaskRepository } from "@/db/repositories/TaskRepository";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Plus, Search, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import type { Task, TaskStatus, Priority, LifeArea } from "@/types";
import { formatDateLabel } from "@/lib/time";
import { AREA_COLORS } from "@/lib/areaColors";
import { useState } from "react";

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
  low: 3,
};

const PRIORITY_BADGE: Record<Priority, string> = {
  urgent: "bg-red-50 text-red-600 border border-red-200",
  important: "bg-orange-50 text-orange-600 border border-orange-200",
  normal: "bg-gray-50 text-gray-500 border border-gray-200",
  low: "bg-green-50 text-green-600 border border-green-200",
};

const STATUS_COLS: { status: TaskStatus; label: string; cls: string }[] = [
  { status: "todo", label: "To Do", cls: "border-gray-200" },
  { status: "in_progress", label: "In Progress", cls: "border-orange-200" },
  { status: "completed", label: "Completed", cls: "border-green-200" },
];

// Mobile shows In Progress first so the active task is immediately visible
const MOBILE_STATUS_ORDER: TaskStatus[] = ["in_progress", "todo", "completed"];

function TaskCard({
  task,
  area,
  onStatusChange,
  onSelect,
  isSelected,
}: {
  task: Task;
  area?: LifeArea;
  onStatusChange: (status: TaskStatus) => void;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const areaColor = area
    ? (AREA_COLORS[area.color] ?? AREA_COLORS.gray)
    : AREA_COLORS.gray;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-2 transition-all hover:shadow-md",
        isSelected && "ring-2 ring-[#1463ff]"
      )}
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(
              task.status === "completed" ? "todo" : "completed"
            );
          }}
          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border border-gray-300 flex items-center justify-center hover:border-[#1463ff] transition-colors"
          aria-label={
            task.status === "completed" ? "Mark incomplete" : "Mark complete"
          }
        >
          {task.status === "completed" && (
            <CheckSquare size={12} className="text-[#1463ff]" />
          )}
        </button>
        <span
          className={cn(
            "flex-1 text-sm font-medium",
            task.status === "completed" && "line-through text-gray-400"
          )}
        >
          {task.title}
        </span>
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0",
            PRIORITY_BADGE[task.priority]
          )}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {/* Meta pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {area && (
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded-md font-medium",
              areaColor
            )}
          >
            {area.name}
          </span>
        )}
        {task.scheduledDate && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={10} />
            {formatDateLabel(task.scheduledDate)}
          </span>
        )}
        {task.pomodoroGoal > 0 && (
          <span className="text-xs text-gray-400">
            {task.completedPomodoros}/{task.pomodoroGoal} 🍅
          </span>
        )}
      </div>

      {/* Status selector */}
      <select
        value={task.status}
        onChange={(e) => {
          e.stopPropagation();
          onStatusChange(e.target.value as TaskStatus);
        }}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        aria-label="Task status"
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </button>
  );
}

export default function TasksPage() {
  const { setShowNewTask, selectedTaskId, setSelectedTaskId } = useUiStore();
  const [search, setSearch] = useState("");
  const [filterAreaId, setFilterAreaId] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [wipWarning, setWipWarning] = useState<{ targetId: string } | null>(
    null
  );

  const tasks =
    useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).toArray(), []) ??
    [];
  const areas = useLiveQuery(() => db.lifeAreas.toArray(), []) ?? [];

  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);

  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const hasWip = inProgress.length >= 1;

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterAreaId && t.areaId !== filterAreaId) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (
      status === "in_progress" &&
      hasWip &&
      task.status !== "in_progress"
    ) {
      setWipWarning({ targetId: task.id });
      return;
    }
    await TaskRepository.update(task.id, { status });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowNewTask(true)}
        >
          <Plus size={16} /> New Task
        </Button>
      </div>

      {/* Search & filters */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Area filter */}
        <select
          value={filterAreaId}
          onChange={(e) => setFilterAreaId(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by area"
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* WIP warning modal */}
      {wipWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-orange-500" />
              <h3 className="font-bold text-gray-900">
                Another task is already in progress.
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Finish it, pause it, or move it back to To Do before starting
              another task.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setSelectedTaskId(inProgress[0]?.id ?? null);
                  setWipWarning(null);
                }}
              >
                View active task
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setWipWarning(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: Kanban (3 columns) ── */}
      <div className="flex-1 overflow-x-auto">
        <div className="hidden md:flex gap-4 p-6 h-full min-h-full">
          {STATUS_COLS.map(({ status, label, cls }) => {
            const colTasks = sorted.filter((t) => t.status === status);
            return (
              <div key={status} className="flex-1 min-w-[240px] flex flex-col">
                {/* Column header */}
                <div
                  className={cn(
                    "flex items-center gap-2 mb-3 pb-2 border-b-2",
                    cls
                  )}
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {status === "in_progress" ? (
                      <>In Progress ⚡</>
                    ) : (
                      label
                    )}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                    {colTasks.length}
                  </span>
                  {status === "in_progress" && hasWip && (
                    <span className="ml-auto text-xs text-orange-500 font-medium">
                      WIP limit: 1
                    </span>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {colTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-300">
                      {status === "todo"
                        ? "No pending tasks"
                        : status === "in_progress"
                        ? "Start a task"
                        : "No completed tasks"}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        area={getArea(task.areaId)}
                        onStatusChange={(s) => handleStatusChange(task, s)}
                        onSelect={() => setSelectedTaskId(task.id)}
                        isSelected={selectedTaskId === task.id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: vertical grouped list (In Progress first) ── */}
        <div className="md:hidden flex flex-col p-4 gap-4">
          {MOBILE_STATUS_ORDER.map((status) => {
            const col = STATUS_COLS.find((c) => c.status === status)!;
            const colTasks = sorted.filter((t) => t.status === status);
            if (colTasks.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  {col.label} ({colTasks.length})
                </h2>
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    area={getArea(task.areaId)}
                    onStatusChange={(s) => handleStatusChange(task, s)}
                    onSelect={() => setSelectedTaskId(task.id)}
                    isSelected={selectedTaskId === task.id}
                  />
                ))}
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
              No tasks found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
