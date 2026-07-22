import { db } from "@/db/database";
import { SyncCoordinator } from "./SyncCoordinator";
import type { Task, LifeArea, Note } from "@/types";

const MIGRATION_KEY = "kartikay-os-migration-complete-v1";

export interface LocalDataSummary {
  taskCount: number;
  noteCount: number;
  areaCount: number;
  sessionCount: number;
}

export const MigrationService = {
  hasMigrated(): boolean {
    return !!localStorage.getItem(MIGRATION_KEY);
  },

  markMigrated(): void {
    localStorage.setItem(MIGRATION_KEY, "1");
  },

  async getLocalSummary(): Promise<LocalDataSummary> {
    const [taskCount, noteCount, areaCount, sessionCount] = await Promise.all([
      db.tasks.filter((t) => !t.deletedAt).count(),
      db.notes.filter((n) => !n.deletedAt).count(),
      db.lifeAreas.filter((a) => !a.deletedAt).count(),
      db.pomodoroSessions.count(),
    ]);
    return { taskCount, noteCount, areaCount, sessionCount };
  },

  async hasLocalData(): Promise<boolean> {
    const summary = await this.getLocalSummary();
    return summary.taskCount > 0 || summary.noteCount > 0;
  },

  /** Import all local records to Supabase, re-assigning userId */
  async importLocalToCloud(userId: string): Promise<{ imported: number; errors: number }> {
    const tasks = await db.tasks.filter((t) => !t.deletedAt).toArray();
    const areas = await db.lifeAreas.filter((a) => !a.deletedAt).toArray();
    const notes = await db.notes.filter((n) => !n.deletedAt).toArray();
    const sessions = await db.pomodoroSessions.toArray();

    let imported = 0;
    let errors = 0;

    // Re-stamp userId on all local records so they are owned by the authenticated user
    for (const area of areas) {
      const updated: LifeArea = { ...area, userId };
      await db.lifeAreas.put(updated);
      try {
        await SyncCoordinator.pushArea(updated, userId);
        imported++;
      } catch { errors++; }
    }

    for (const task of tasks) {
      const updated: Task = { ...task, userId };
      await db.tasks.put(updated);
      try {
        await SyncCoordinator.pushTask(updated, userId);
        imported++;
      } catch { errors++; }
    }

    for (const note of notes) {
      const updated: Note = { ...note, userId };
      await db.notes.put(updated);
      try {
        await SyncCoordinator.pushNote(updated, userId);
        imported++;
      } catch { errors++; }
    }

    // Pomodoro sessions — mark pending for bulk sync
    for (const s of sessions) {
      await db.pomodoroSessions.update(s.id, { userId, syncStatus: "pending" });
    }

    MigrationService.markMigrated();
    return { imported, errors };
  },

  /** Skip import — keep cloud data, clear local-only records */
  async keepCloudData(userId: string): Promise<void> {
    // Pull fresh cloud data
    await SyncCoordinator.syncDown(userId);
    MigrationService.markMigrated();
  },
};
