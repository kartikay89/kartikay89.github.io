import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { DailySummary } from "@/components/dashboard/DailySummary";
import { TimelineCard } from "@/components/timeline/TimelineCard";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/uiStore";
import { Plus, Info, CalendarDays } from "lucide-react";
import { formatDurationShort, formatFullDate } from "@/lib/time";
import { Link } from "react-router-dom";

function calcDuration(start?: string, end?: string): string | undefined {
  if (!start || !end) return undefined;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return undefined;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function TodayPage() {
  const { selectedTaskId, setSelectedTaskId, setShowNewTask } = useUiStore();

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  const tasks =
    useLiveQuery(
      () => db.tasks.filter((t) => !!t.scheduledDate && !t.deletedAt).toArray(),
      []
    ) ?? [];

  const areas = useLiveQuery(() => db.lifeAreas.toArray(), []) ?? [];

  const pomodoroSessions =
    useLiveQuery(
      () => db.pomodoroSessions.filter((s) => s.status === "completed").toArray(),
      []
    ) ?? [];

  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);

  // Sort by scheduledDate then plannedStart
  const sorted = [...tasks].sort((a, b) => {
    const da = (a.scheduledDate ?? "") + (a.plannedStart ?? "00:00");
    const db2 = (b.scheduledDate ?? "") + (b.plannedStart ?? "00:00");
    return da.localeCompare(db2);
  });

  // Today's focus seconds from completed pomodoro sessions today
  const todayFocusSeconds = pomodoroSessions
    .filter((s) => s.startedAt.startsWith(today))
    .reduce((sum, s) => sum + s.actualFocusedSeconds, 0);

  const totalFocusSeconds = tasks
    .filter((t) => !!t.scheduledDate)
    .reduce((sum, t) => sum + t.focusedSeconds, 0);

  const completedCount = tasks.filter(
    (t) => t.status === "completed" && t.scheduledDate
  ).length;

  // Track which dates have already had their label rendered
  const seenDates = new Set<string>();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatFullDate(today)}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowNewTask(true)}>
          <Plus size={16} /> New Task
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Daily Summary */}
        <DailySummary
          scheduledCount={tasks.filter((t) => !!t.scheduledDate).length}
          focusSeconds={todayFocusSeconds || totalFocusSeconds}
          completedCount={completedCount}
        />

        {/* Timeline header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900">Today Timeline</h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              aria-label="Timeline info"
            >
              <Info size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Scheduled tasks for today only. Unscheduled tasks stay in Tasks.
          </p>
        </div>

        {/* Timeline or empty state */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays size={48} className="text-gray-200 mb-4" />
            <p className="text-lg font-semibold text-gray-400 mb-1">
              No tasks are scheduled for today.
            </p>
            <Link to="/tasks" className="text-sm text-[#1463ff] hover:underline">
              Open Tasks to schedule one
            </Link>
          </div>
        ) : (
          <div className="relative">
            {sorted.map((task) => {
              const isFirst = !seenDates.has(task.scheduledDate ?? "");
              if (task.scheduledDate) seenDates.add(task.scheduledDate);
              return (
                <TimelineCard
                  key={task.id}
                  task={task}
                  area={getArea(task.areaId)}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => setSelectedTaskId(task.id)}
                  onToggleComplete={() => {}}
                  onStartTimer={() => {}}
                  showDate={isFirst}
                  plannedDuration={calcDuration(task.plannedStart, task.plannedEnd)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {sorted.length > 0 && (
        <div className="border-t border-gray-100 bg-white px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <CalendarDays size={13} />
          <span>{sorted.length} scheduled items</span>
          <span>•</span>
          <span>Total focus time: {formatDurationShort(totalFocusSeconds)}</span>
        </div>
      )}
    </div>
  );
}
