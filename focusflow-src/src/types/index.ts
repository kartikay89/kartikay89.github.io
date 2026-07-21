export type Priority = "urgent" | "important" | "normal" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type CaptureType = "thought" | "task" | "idea";

export interface Task {
  id: string;
  title: string;
  areaId: string;
  tags: string[];
  scheduledDate: string;
  plannedStart: string;
  plannedEnd: string;
  priority: Priority;
  status: TaskStatus;
  pomodoroGoal: number;
  completedPomodoros: number;
  focusedSeconds: number;
  notes: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: "running" | "paused" | "completed" | "cancelled";
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  taskCount?: number;
}

export interface TimerState {
  taskId: string | null;
  status: "idle" | "running" | "paused";
  startedAt: number | null;
  pausedAt: number | null;
  elapsedSeconds: number;
  pomodoroSeconds: number; // 25 * 60 by default
}
