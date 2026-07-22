import Dexie, { type Table } from "dexie";
import type {
  Task, LifeArea, Note, PomodoroSession, CaptureItem,
  TimerState, AppSettings, UserProfile, CalendarConnection,
} from "@/types";

export class KartikayOSDatabase extends Dexie {
  tasks!: Table<Task>;
  lifeAreas!: Table<LifeArea>;
  notes!: Table<Note>;
  pomodoroSessions!: Table<PomodoroSession>;
  captureItems!: Table<CaptureItem>;
  timerState!: Table<TimerState & { _id: number }>;
  settings!: Table<AppSettings & { _id: number }>;
  userProfile!: Table<UserProfile>;
  calendarConnections!: Table<CalendarConnection>;

  constructor() {
    super("KartikayOS");
    this.version(1).stores({
      tasks: "id, status, priority, areaId, scheduledDate, syncStatus, deletedAt",
      lifeAreas: "id, archived",
      notes: "id, folder, type, archived",
      pomodoroSessions: "id, taskId, status, startedAt",
      captureItems: "id, type, archived",
      timerState: "_id",
      settings: "_id",
      userProfile: "id",
      calendarConnections: "id, provider",
    });
  }
}

export const db = new KartikayOSDatabase();

// Singleton timer accessor
export async function getTimerState(): Promise<TimerState | null> {
  const row = await db.timerState.get(1);
  if (!row) return null;
  const { _id: _unused, ...state } = row;
  void _unused;
  return state;
}

export async function saveTimerState(state: TimerState): Promise<void> {
  await db.timerState.put({ ...state, _id: 1 });
}

export async function getSettings(): Promise<AppSettings | null> {
  const row = await db.settings.get(1);
  if (!row) return null;
  const { _id: _unused, ...settings } = row;
  void _unused;
  return settings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await db.settings.put({ ...settings, _id: 1 });
}
