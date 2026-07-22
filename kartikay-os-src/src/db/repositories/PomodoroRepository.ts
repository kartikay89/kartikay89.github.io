import { db } from "../database";
import type { PomodoroSession } from "@/types";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";

const USER_ID = "local-user";

export const PomodoroRepository = {
  async getByTask(taskId: string): Promise<PomodoroSession[]> {
    return db.pomodoroSessions
      .where("taskId")
      .equals(taskId)
      .filter((s) => !s.deletedAt)
      .toArray();
  },

  async getByDateRange(startDate: string, endDate: string): Promise<PomodoroSession[]> {
    return db.pomodoroSessions
      .where("startedAt")
      .between(startDate, endDate + "￿")
      .filter((s) => s.status === "completed" && !s.deletedAt)
      .toArray();
  },

  async getRunning(): Promise<PomodoroSession | undefined> {
    return db.pomodoroSessions
      .filter((s) => s.status === "running" || s.status === "paused")
      .first();
  },

  async create(partial: Omit<PomodoroSession, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<PomodoroSession> {
    const session: PomodoroSession = {
      id: nanoid(),
      userId: USER_ID,
      createdAt: now(),
      updatedAt: now(),
      version: 1,
      syncStatus: "pending",
      ...partial,
    };
    await db.pomodoroSessions.add(session);
    return session;
  },

  async update(id: string, changes: Partial<PomodoroSession>): Promise<void> {
    await db.pomodoroSessions.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
  },

  async getWeeklyFocus(weekStart: string, weekEnd: string): Promise<{ date: string; seconds: number }[]> {
    const sessions = await this.getByDateRange(weekStart, weekEnd);
    const map = new Map<string, number>();
    for (const s of sessions) {
      const date = s.startedAt.slice(0, 10);
      map.set(date, (map.get(date) ?? 0) + s.actualFocusedSeconds);
    }
    return Array.from(map.entries()).map(([date, seconds]) => ({ date, seconds }));
  },
};
