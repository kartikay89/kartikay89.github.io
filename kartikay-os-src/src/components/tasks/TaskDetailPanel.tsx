import { ArrowLeft, X, Pencil } from "lucide-react";
import type { Task, LifeArea } from "@/types";
import { cn } from "@/lib/cn";
import { PomodoroRing } from "@/components/timer/PomodoroRing";
import { WeeklyFocusChart } from "@/components/charts/WeeklyFocusChart";
import { useTimerStore } from "@/store/timerStore";
import { useUiStore } from "@/store/uiStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { getWeekBounds, addDays } from "@/lib/time";
import { AREA_COLORS } from "@/lib/areaColors";

function formatTime(t?: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

interface Props {
  task: Task;
  area?: LifeArea;
  onClose: () => void;
}

export function TaskDetailPanel({ task, area, onClose }: Props) {
  const { startTimer, pauseTimer, resumeTimer, resetTimer } = useTimerStore();
  // addToast available for future use
  void useUiStore((s) => s.addToast);

  const today = new Date().toLocaleDateString("en-CA");
  const { start: weekStart } = getWeekBounds();

  const sessions =
    useLiveQuery(
      () =>
        db.pomodoroSessions
          .where("startedAt")
          .between(weekStart, weekStart.slice(0, 4) + "-12-31")
          .filter((s) => s.status === "completed")
          .toArray(),
      [weekStart]
    ) ?? [];

  // Build Mon–Sun weekly chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayLabel = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    const seconds = sessions
      .filter((s) => s.startedAt.startsWith(date))
      .reduce((sum, s) => sum + s.actualFocusedSeconds, 0);
    return { date, label: dayLabel, seconds };
  });

  const totalWeekSeconds = weekData.reduce((sum, d) => sum + d.seconds, 0);

  const areaColor = area
    ? (AREA_COLORS[area.color] ?? AREA_COLORS.gray)
    : AREA_COLORS.gray;

  const timeLabel =
    task.plannedStart && task.plannedEnd
      ? `${formatTime(task.plannedStart)} – ${formatTime(task.plannedEnd)}`
      : null;

  return (
    <aside className="w-80 min-w-[320px] flex flex-col border-l border-gray-200 bg-white h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={14} />
          Back to Today
        </button>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Edit task"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Area pill */}
        {area && (
          <span
            className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium",
              areaColor
            )}
          >
            {area.name}
          </span>
        )}

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mt-2 mb-1 leading-tight">
          {task.title}
        </h2>

        {/* Time range */}
        {timeLabel && (
          <p className="text-xs text-gray-400 mb-4">{timeLabel}</p>
        )}

        {/* Pomodoro ring */}
        <PomodoroRing
          taskId={task.id}
          pomodoroGoal={task.pomodoroGoal}
          completedPomodoros={task.completedPomodoros}
          onStart={() => startTimer(task.id)}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
        />

        {/* Weekly focus chart */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <WeeklyFocusChart
            data={weekData}
            todayDate={today}
            totalSeconds={totalWeekSeconds}
          />
        </div>

        {/* Notes preview */}
        {task.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Notes
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {task.notes}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
