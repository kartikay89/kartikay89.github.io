import { useTimerStore, getRemaining, getProgress } from "@/store/timerStore";
import { formatTimer } from "@/lib/time";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

interface PomodoroRingProps {
  taskId: string;
  pomodoroGoal: number;
  completedPomodoros: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function PomodoroRing({
  taskId,
  pomodoroGoal,
  completedPomodoros,
  onStart,
  onPause,
  onResume,
  onReset,
}: PomodoroRingProps) {
  const timer = useTimerStore((s) => s.timer);
  // re-render on tick
  useTimerStore((s) => s.tick);

  const isThisTask = timer.taskId === taskId;
  const isRunning = isThisTask && timer.status === "running";
  const isPaused = isThisTask && timer.status === "paused";

  const remaining = isThisTask ? getRemaining(timer) : timer.durationSeconds;
  const progress = isThisTask ? getProgress(timer) : 0;

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 84;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress);

  const dots = Math.min(pomodoroGoal, 5);

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Ring */}
      <div className={cn("relative", isRunning && "timer-running")}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`${formatTimer(remaining)} remaining`}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1463ff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 0.5s linear" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 tabular-nums">
            {formatTimer(remaining)}
          </span>
          <span className="text-xs text-gray-400 mt-1">Focus Time</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning && !isPaused ? (
          <button
            onClick={onStart}
            className="w-14 h-14 bg-[#1463ff] rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-[#0f55dc] transition-colors"
            aria-label="Start Pomodoro"
          >
            <Play size={22} fill="white" />
          </button>
        ) : isRunning ? (
          <button
            onClick={onPause}
            className="w-14 h-14 bg-[#1463ff] rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-[#0f55dc] transition-colors"
            aria-label="Pause Pomodoro"
          >
            <Pause size={22} fill="white" />
          </button>
        ) : (
          <button
            onClick={onResume}
            className="w-14 h-14 bg-[#1463ff] rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-[#0f55dc] transition-colors"
            aria-label="Resume Pomodoro"
          >
            <Play size={22} fill="white" />
          </button>
        )}
        <button
          onClick={onReset}
          className="w-11 h-11 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Pomodoro count + dots */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">
          Pomodoro {completedPomodoros} of {pomodoroGoal}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: dots }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full",
                i < completedPomodoros ? "bg-[#1463ff]" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
