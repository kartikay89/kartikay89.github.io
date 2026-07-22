import { db, saveSettings, getSettings } from "./database";
import {
  SEED_AREAS, SEED_TASKS, SEED_NOTES, SEED_POMODORO_SESSIONS,
  DEFAULT_SETTINGS, SEED_USER,
} from "@/data/seed";
import { getTimerState, saveTimerState } from "./database";

const INITIALIZED_KEY = "kartikay-os-initialized-v1";

export async function initializeDatabase(): Promise<void> {
  const alreadyInit = localStorage.getItem(INITIALIZED_KEY);
  if (alreadyInit) return;

  // Seed user profile
  const existingUser = await db.userProfile.get("local-user");
  if (!existingUser) {
    await db.userProfile.add(SEED_USER);
  }

  // Seed settings
  const existingSettings = await getSettings();
  if (!existingSettings) {
    await saveSettings(DEFAULT_SETTINGS);
  }

  // Seed areas
  const existingAreas = await db.lifeAreas.count();
  if (existingAreas === 0) {
    await db.lifeAreas.bulkAdd(SEED_AREAS);
  }

  // Seed tasks
  const existingTasks = await db.tasks.count();
  if (existingTasks === 0) {
    await db.tasks.bulkAdd(SEED_TASKS);
  }

  // Seed notes
  const existingNotes = await db.notes.count();
  if (existingNotes === 0) {
    await db.notes.bulkAdd(SEED_NOTES);
  }

  // Seed pomodoro sessions
  const existingSessions = await db.pomodoroSessions.count();
  if (existingSessions === 0) {
    await db.pomodoroSessions.bulkAdd(SEED_POMODORO_SESSIONS);
  }

  // Ensure timer state exists
  const timerState = await getTimerState();
  if (!timerState) {
    await saveTimerState({
      taskId: null,
      status: "idle",
      startedAt: null,
      baseElapsed: 0,
      durationSeconds: DEFAULT_SETTINGS.pomodoroDuration,
      sessionId: null,
    });
  }

  localStorage.setItem(INITIALIZED_KEY, "1");
}
