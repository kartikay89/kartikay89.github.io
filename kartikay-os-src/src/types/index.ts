// ─── Base sync fields ───────────────────────────────────────────────────────

export type SyncStatus = "synced" | "pending" | "failed";

export interface SyncBase {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
  syncStatus: SyncStatus;
}

// ─── Priority & Status ───────────────────────────────────────────────────────

export type Priority = "urgent" | "important" | "normal" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed";

// ─── Task ────────────────────────────────────────────────────────────────────

export interface Task extends SyncBase {
  title: string;
  description?: string;
  areaId: string;
  tags: string[];
  status: TaskStatus;
  priority: Priority;
  scheduledDate?: string;  // YYYY-MM-DD
  plannedStart?: string;   // HH:mm
  plannedEnd?: string;     // HH:mm
  pomodoroGoal: number;
  completedPomodoros: number;
  focusedSeconds: number;
  notes: string;
  completedAt?: string;
}

// ─── Life Area ───────────────────────────────────────────────────────────────

export interface LifeArea extends SyncBase {
  name: string;
  icon: string;
  color: string;
  archived: boolean;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export type NoteType = "text" | "markdown" | "code";
export type NoteFolder = "all" | "ideas" | "journal" | "code";

export interface Note extends SyncBase {
  title: string;
  type: NoteType;
  language?: string;
  content: string;
  tags: string[];
  folder: NoteFolder;
  archived: boolean;
}

// ─── Pomodoro ────────────────────────────────────────────────────────────────

export type PomodoroStatus = "running" | "paused" | "completed" | "cancelled";

export interface PomodoroSession extends SyncBase {
  taskId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  actualFocusedSeconds: number;
  status: PomodoroStatus;
}

export interface TimerState {
  taskId: string | null;
  status: "idle" | "running" | "paused";
  startedAt: number | null;       // epoch ms when last started/resumed
  baseElapsed: number;            // seconds accumulated before current run
  durationSeconds: number;        // total pomodoro duration (default 1500)
  sessionId: string | null;
}

// ─── Quick Capture ───────────────────────────────────────────────────────────

export type CaptureType = "task" | "thought" | "idea" | "note";

export interface CaptureItem extends SyncBase {
  text: string;
  type: CaptureType;
  areaId?: string;
  priority?: Priority;
  scheduledDate?: string;
  convertedTaskId?: string;
  convertedNoteId?: string;
  archived: boolean;
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  color?: string;
  source: "local" | "google" | "apple";
}

export interface CalendarConnection {
  id: string;
  provider: "google" | "apple";
  connected: boolean;
  lastSynced?: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  userId: string;
  displayName: string;
  timezone: string;
  firstDayOfWeek: 0 | 1; // 0=Sun, 1=Mon
  use24Hour: boolean;
  defaultLandingPage: string;
  pomodoroDuration: number;       // seconds
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreak: boolean;
  autoStartNextSession: boolean;
  notificationSound: boolean;
  defaultPriority: Priority;
  defaultPomodoroGoal: number;
  defaultAreaId: string;
  colorMode: "light" | "dark" | "system";
  accentColor: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}
