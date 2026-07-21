import { useState, useEffect, useCallback, useRef } from "react";
import { POMODORO_DURATION } from "../lib/constants";

interface UsePomodoroOptions {
  taskId: string;
  onComplete: () => void;
}

interface PomodoroState {
  status: "idle" | "running" | "paused";
  startedAt: number | null;
  pausedAt: number | null;
  elapsedSeconds: number;
}

const STORAGE_KEY = "ff_timer";

export function usePomodoro({ taskId, onComplete }: UsePomodoroOptions) {
  const [state, setState] = useState<PomodoroState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.taskId === taskId) return parsed.state;
      }
    } catch {}
    return { status: "idle", startedAt: null, pausedAt: null, elapsedSeconds: 0 };
  });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const remainingSeconds = Math.max(0, POMODORO_DURATION - state.elapsedSeconds);
  const progress = state.elapsedSeconds / POMODORO_DURATION;

  useEffect(() => {
    if (state.status !== "running") return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "running" || !prev.startedAt) return prev;
        const now = Date.now();
        const elapsed = Math.floor((now - prev.startedAt) / 1000) + (prev.elapsedSeconds ?? 0);
        if (elapsed >= POMODORO_DURATION) {
          onCompleteRef.current();
          return { status: "idle", startedAt: null, pausedAt: null, elapsedSeconds: 0 };
        }
        return { ...prev, elapsedSeconds: elapsed };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [state.status]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ taskId, state }));
  }, [taskId, state]);

  const start = useCallback(() => {
    setState((prev) => ({
      status: "running",
      startedAt: Date.now(),
      pausedAt: null,
      elapsedSeconds: prev.status === "paused" ? prev.elapsedSeconds : 0,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, status: "paused", pausedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", startedAt: null, pausedAt: null, elapsedSeconds: 0 });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { status: state.status, remainingSeconds, progress, start, pause, reset };
}
