import { getSupabase } from "@/lib/supabase";
import type { IPomodoroRepository } from "../interfaces";
import type { PomodoroSession } from "@/types";
import type { DbPomodoroSession } from "@/lib/supabaseTypes";
import { now } from "@/lib/time";
import { nanoid } from "@/lib/nanoid";

function toApp(row: DbPomodoroSession): PomodoroSession {
  return {
    id: row.id, userId: row.user_id, taskId: row.task_id,
    startedAt: row.started_at, endedAt: row.ended_at ?? undefined,
    durationSeconds: row.duration_seconds, actualFocusedSeconds: row.actual_focused_seconds,
    status: row.status as PomodoroSession["status"],
    createdAt: row.created_at, updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined, version: row.version, syncStatus: "synced",
  };
}

export class SupabasePomodoroRepository implements IPomodoroRepository {
  private get sb() { return getSupabase(); }
  private get table() { return this.sb.from("pomodoro_sessions"); }

  async getByTask(taskId: string): Promise<PomodoroSession[]> {
    const { data, error } = await this.table.select("*").eq("task_id", taskId).is("deleted_at", null);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toApp);
  }

  async getRunning(): Promise<PomodoroSession | undefined> {
    const { data } = await this.table.select("*").in("status", ["running", "paused"]).limit(1).maybeSingle();
    return data ? toApp(data) : undefined;
  }

  async getByDateRange(startDate: string, endDate: string): Promise<PomodoroSession[]> {
    const { data, error } = await this.table.select("*")
      .gte("started_at", startDate)
      .lte("started_at", endDate + "T23:59:59Z")
      .eq("status", "completed")
      .is("deleted_at", null);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toApp);
  }

  async getWeeklyFocus(weekStart: string, weekEnd: string): Promise<{ date: string; seconds: number }[]> {
    const sessions = await this.getByDateRange(weekStart, weekEnd);
    const map = new Map<string, number>();
    for (const s of sessions) {
      const date = s.startedAt.slice(0, 10);
      map.set(date, (map.get(date) ?? 0) + s.actualFocusedSeconds);
    }
    return Array.from(map.entries()).map(([date, seconds]) => ({ date, seconds }));
  }

  async create(partial: Omit<PomodoroSession, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<PomodoroSession> {
    const user = (await this.sb.auth.getUser()).data.user;
    const row: DbPomodoroSession = {
      id: nanoid(), user_id: user?.id ?? "local-user", task_id: partial.taskId,
      started_at: partial.startedAt, ended_at: partial.endedAt ?? null,
      duration_seconds: partial.durationSeconds, actual_focused_seconds: partial.actualFocusedSeconds,
      status: partial.status, created_at: now(), updated_at: now(), deleted_at: null, version: 1,
    };
    const { data, error } = await this.table.insert(row).select().single();
    if (error) throw new Error(error.message);
    return toApp(data!);
  }

  async update(id: string, changes: Partial<PomodoroSession>): Promise<void> {
    const db: Partial<DbPomodoroSession> = {};
    if (changes.status !== undefined) db.status = changes.status;
    if ("endedAt" in changes) db.ended_at = changes.endedAt ?? null;
    if (changes.actualFocusedSeconds !== undefined) db.actual_focused_seconds = changes.actualFocusedSeconds;
    db.updated_at = now();
    const { error } = await this.table.update(db).eq("id", id);
    if (error) throw new Error(error.message);
  }
}
