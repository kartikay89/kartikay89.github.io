// src/hooks/usePomodoro.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { POMODORO_DURATION } from "../lib/constants";

interface UsePomodoroOptions {
  taskId: string;
  onComplete: () => void;
}

interface PomodoroState {
  status: "idle" | "running" | "paused";
  startedAt: number | null;   // epoch ms when current run began
  baseElapsed: number;        // accumulated seconds from previous pauses only
}

export interface TimerControls {
  status: PomodoroState["status"];
  remainingSeconds: number;
  progress: number; // 0-1
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const STORAGE_KEY = "ff_timer";

function getElapsed(s: PomodoroState): number {
  if (s.status === "running" && s.startedAt !== null) {
    return s.baseElapsed + Math.floor((Date.now() - s.startedAt) / 1000);
  }
  return s.baseElapsed;
}

export function usePomodoro({ taskId, onComplete }: UsePomodoroOptions): TimerControls {
  const [state, setState] = useState<PomodoroState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.taskId === taskId) return parsed.state;
      }
    } catch {}
    return { status: "idle", startedAt: null, baseElapsed: 0 };
  });

  const [, setTick] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (state.status !== "running") return;
    const interval = setInterval(() => {
      const elapsed = getElapsed(state);
      if (elapsed >= POMODORO_DURATION) {
        onCompleteRef.current();
        setState({ status: "idle", startedAt: null, baseElapsed: 0 });
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setTick((t) => t + 1);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [state.status, state.startedAt, state.baseElapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ taskId, state }));
  }, [taskId, state]);

  const elapsed = getElapsed(state);
  const remainingSeconds = Math.max(0, POMODORO_DURATION - elapsed);
  const progress = Math.min(1, elapsed / POMODORO_DURATION);

  const start = useCallback(() => {
    setState((prev) => ({
      status: "running",
      startedAt: Date.now(),
      baseElapsed: prev.status === "paused" ? prev.baseElapsed : 0,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "running" || prev.startedAt === null) return prev;
      return {
        status: "paused",
        startedAt: null,
        baseElapsed: prev.baseElapsed + Math.floor((Date.now() - prev.startedAt) / 1000),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", startedAt: null, baseElapsed: 0 });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { status: state.status, remainingSeconds, progress, start, pause, reset };
}
