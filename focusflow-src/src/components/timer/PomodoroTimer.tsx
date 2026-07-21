import { Pause, Play, RotateCcw } from "lucide-react";
import { TimerRing } from "./TimerRing";
import { formatTimerDisplay } from "../../lib/time";
import type { TimerControls } from "../../hooks/usePomodoro";
import type { Task } from "../../types";

interface PomodoroTimerProps {
  task: Task;
  timer: TimerControls;
}

export function PomodoroTimer({ task, timer }: PomodoroTimerProps) {
  const { status, remainingSeconds, progress, start, pause, reset } = timer;
  const isRunning = status === "running";

  return (
    <div className="flex flex-col items-center gap-5">
      <TimerRing progress={progress} size={200} strokeWidth={10}>
        <span className="text-4xl font-bold text-gray-900 tabular-nums">{formatTimerDisplay(remainingSeconds)}</span>
        <span className="text-sm text-gray-500 mt-1">Focus Time</span>
      </TimerRing>

      <div className="flex items-center gap-4">
        <button
          onClick={isRunning ? pause : start}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center w-12 h-12 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-gray-500">
          Pomodoro <span className="font-semibold text-gray-800">{task.completedPomodoros} of {task.pomodoroGoal}</span>
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: task.pomodoroGoal }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-colors ${i < task.completedPomodoros ? "bg-blue-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
