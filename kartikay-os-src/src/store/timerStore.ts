import { create } from "zustand";
import { db, saveTimerState, getTimerState } from "@/db/database";
import { TaskRepository } from "@/db/repositories/TaskRepository";
import { PomodoroRepository } from "@/db/repositories/PomodoroRepository";
import type { TimerState } from "@/types";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";

const DEFAULT_DURATION = 1500; // 25 minutes

export interface TimerStore {
  timer: TimerState;
  // Derived (computed in component via ticks)
  tick: number; // increment to trigger re-render

  // Actions
  startTimer: (taskId: string, sessionId?: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  completeTimer: () => Promise<void>;
  loadPersistedTimer: () => Promise<void>;
  setDuration: (seconds: number) => void;
}

function elapsed(timer: TimerState): number {
  if (timer.status === "running" && timer.startedAt !== null) {
    return timer.baseElapsed + Math.floor((Date.now() - timer.startedAt) / 1000);
  }
  return timer.baseElapsed;
}

export function getRemaining(timer: TimerState): number {
  return Math.max(0, timer.durationSeconds - elapsed(timer));
}

export function getProgress(timer: TimerState): number {
  const el = elapsed(timer);
  return Math.min(1, el / timer.durationSeconds);
}

const IDLE_TIMER: TimerState = {
  taskId: null,
  status: "idle",
  startedAt: null,
  baseElapsed: 0,
  durationSeconds: DEFAULT_DURATION,
  sessionId: null,
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: IDLE_TIMER,
  tick: 0,

  setDuration: (seconds) => {
    set((s) => ({ timer: { ...s.timer, durationSeconds: seconds } }));
  },

  loadPersistedTimer: async () => {
    const saved = await getTimerState();
    if (!saved || saved.status === "idle") return;
    set({ timer: saved });
  },

  startTimer: async (taskId, sessionId) => {
    const { timer } = get();

    // If same task paused — resume instead
    if (timer.taskId === taskId && timer.status === "paused") {
      await get().resumeTimer();
      return;
    }

    // Cancel any running/paused session
    if (timer.sessionId && timer.status !== "idle") {
      await PomodoroRepository.update(timer.sessionId, {
        status: "cancelled",
        endedAt: now(),
        actualFocusedSeconds: elapsed(timer),
      });
    }

    const sid = sessionId ?? nanoid();
    await PomodoroRepository.create({
      taskId,
      startedAt: now(),
      durationSeconds: timer.durationSeconds,
      actualFocusedSeconds: 0,
      status: "running",
    }).then((s) => {
      // overwrite the id with the one we want
      void s;
    });

    // Create session
    const session = await PomodoroRepository.create({
      taskId,
      startedAt: new Date().toISOString(),
      durationSeconds: timer.durationSeconds,
      actualFocusedSeconds: 0,
      status: "running",
    });

    // Set task to in_progress
    await TaskRepository.update(taskId, { status: "in_progress" });

    const newTimer: TimerState = {
      taskId,
      status: "running",
      startedAt: Date.now(),
      baseElapsed: 0,
      durationSeconds: timer.durationSeconds,
      sessionId: session.id,
    };
    await saveTimerState(newTimer);
    set({ timer: newTimer });
    void sid;
  },

  pauseTimer: async () => {
    const { timer } = get();
    if (timer.status !== "running") return;
    const el = elapsed(timer);
    const updated: TimerState = {
      ...timer,
      status: "paused",
      startedAt: null,
      baseElapsed: el,
    };
    if (timer.sessionId) {
      await PomodoroRepository.update(timer.sessionId, {
        status: "paused",
        actualFocusedSeconds: el,
      });
    }
    await saveTimerState(updated);
    set({ timer: updated });
  },

  resumeTimer: async () => {
    const { timer } = get();
    if (timer.status !== "paused") return;
    const updated: TimerState = {
      ...timer,
      status: "running",
      startedAt: Date.now(),
    };
    if (timer.sessionId) {
      await PomodoroRepository.update(timer.sessionId, { status: "running" });
    }
    await saveTimerState(updated);
    set({ timer: updated });
  },

  resetTimer: async () => {
    const { timer } = get();
    if (timer.sessionId) {
      await PomodoroRepository.update(timer.sessionId, {
        status: "cancelled",
        endedAt: now(),
        actualFocusedSeconds: elapsed(timer),
      });
    }
    const reset: TimerState = { ...IDLE_TIMER, durationSeconds: timer.durationSeconds };
    await saveTimerState(reset);
    set({ timer: reset });
  },

  completeTimer: async () => {
    const { timer } = get();
    if (!timer.taskId || !timer.sessionId) return;
    const el = elapsed(timer);

    await PomodoroRepository.update(timer.sessionId, {
      status: "completed",
      endedAt: now(),
      actualFocusedSeconds: el,
    });

    const task = await TaskRepository.getById(timer.taskId);
    if (task) {
      await TaskRepository.update(timer.taskId, {
        completedPomodoros: task.completedPomodoros + 1,
        focusedSeconds: task.focusedSeconds + el,
        status: "todo",
      });
    }

    // Refresh liveQuery
    await db.tasks.where("id").equals(timer.taskId).modify((t) => {
      t.completedPomodoros += 1;
      t.focusedSeconds += el;
      t.status = "todo";
    });

    const reset: TimerState = { ...IDLE_TIMER, durationSeconds: timer.durationSeconds };
    await saveTimerState(reset);
    set({ timer: reset });
  },
}));

// Tick engine — runs a setInterval at 1s to drive timer updates
let _tickInterval: ReturnType<typeof setInterval> | null = null;

export function startTickEngine(store: { getState: () => TimerStore; setState: (u: Partial<TimerStore>) => void }) {
  if (_tickInterval) return;
  _tickInterval = setInterval(() => {
    const { timer, completeTimer } = store.getState();
    if (timer.status === "running") {
      const remaining = getRemaining(timer);
      if (remaining <= 0) {
        completeTimer();
      } else {
        store.setState({ tick: store.getState().tick + 1 });
      }
    }
  }, 1000);
}
