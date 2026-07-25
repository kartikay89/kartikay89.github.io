import { getSupabase } from "@/lib/supabase";
import type { ITaskRepository } from "../interfaces";
import type { Task, TaskStatus } from "@/types";
import type { DbTask } from "@/lib/supabaseTypes";
import { now } from "@/lib/time";
import { nanoid } from "@/lib/nanoid";

function toApp(row: DbTask): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    areaId: row.area_id ?? "",
    tags: row.tags ?? [],
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    scheduledDate: row.scheduled_date ?? undefined,
    plannedStart: row.planned_start ?? undefined,
    plannedEnd: row.planned_end ?? undefined,
    pomodoroGoal: row.pomodoro_goal,
    completedPomodoros: row.completed_pomodoros,
    focusedSeconds: row.focused_seconds,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    version: row.version,
    syncStatus: "synced",
  };
}

function toDb(task: Partial<Task> & { userId?: string }): Partial<DbTask> {
  const db: Partial<DbTask> = {};
  if (task.userId !== undefined) db.user_id = task.userId;
  if (task.title !== undefined) db.title = task.title;
  if ("description" in task) db.description = task.description ?? null;
  if (task.areaId !== undefined) db.area_id = task.areaId || null;
  if (task.tags !== undefined) db.tags = task.tags;
  if (task.status !== undefined) db.status = task.status;
  if (task.priority !== undefined) db.priority = task.priority;
  if ("scheduledDate" in task) db.scheduled_date = task.scheduledDate ?? null;
  if ("plannedStart" in task) db.planned_start = task.plannedStart ?? null;
  if ("plannedEnd" in task) db.planned_end = task.plannedEnd ?? null;
  if (task.pomodoroGoal !== undefined) db.pomodoro_goal = task.pomodoroGoal;
  if (task.completedPomodoros !== undefined) db.completed_pomodoros = task.completedPomodoros;
  if (task.focusedSeconds !== undefined) db.focused_seconds = task.focusedSeconds;
  if (task.notes !== undefined) db.notes = task.notes;
  if ("deletedAt" in task) db.deleted_at = task.deletedAt ?? null;
  if ("completedAt" in task) db.completed_at = task.completedAt ?? null;
  if (task.version !== undefined) db.version = task.version;
  return db;
}

export class SupabaseTaskRepository implements ITaskRepository {
  private get sb() { return getSupabase(); }
  private get table() { return this.sb.from("tasks"); }

  async getAll(): Promise<Task[]> {
    const { data, error } = await this.table
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`SupabaseTasks.getAll: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async getById(id: string): Promise<Task | undefined> {
    const { data, error } = await this.table.select("*").eq("id", id).single();
    if (error) return undefined;
    return data ? toApp(data) : undefined;
  }

  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const { data, error } = await this.table
      .select("*")
      .eq("status", status)
      .is("deleted_at", null);
    if (error) throw new Error(`SupabaseTasks.getByStatus: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async getScheduled(date: string): Promise<Task[]> {
    const { data, error } = await this.table
      .select("*")
      .eq("scheduled_date", date)
      .is("deleted_at", null);
    if (error) throw new Error(`SupabaseTasks.getScheduled: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async getByArea(areaId: string): Promise<Task[]> {
    const { data, error } = await this.table
      .select("*")
      .eq("area_id", areaId)
      .is("deleted_at", null);
    if (error) throw new Error(`SupabaseTasks.getByArea: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async create(partial: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<Task> {
    const user = this.sb.auth.getUser ? (await this.sb.auth.getUser()).data.user : null;
    const userId = user?.id ?? "local-user";
    const row: DbTask = {
      id: nanoid(),
      user_id: userId,
      title: partial.title,
      description: partial.description ?? null,
      area_id: partial.areaId || null,
      tags: partial.tags ?? [],
      status: partial.status,
      priority: partial.priority,
      scheduled_date: partial.scheduledDate ?? null,
      planned_start: partial.plannedStart ?? null,
      planned_end: partial.plannedEnd ?? null,
      pomodoro_goal: partial.pomodoroGoal,
      completed_pomodoros: partial.completedPomodoros,
      focused_seconds: partial.focusedSeconds,
      notes: partial.notes ?? "",
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
      completed_at: null,
      version: 1,
    };
    const { data, error } = await this.table.insert(row).select().single();
    if (error) throw new Error(`SupabaseTasks.create: ${error.message}`);
    return toApp(data!);
  }

  async update(id: string, changes: Partial<Task>): Promise<Task> {
    const dbChanges = toDb(changes);
    dbChanges.updated_at = now();
    const { data, error } = await this.table.update(dbChanges).eq("id", id).select().single();
    if (error) throw new Error(`SupabaseTasks.update: ${error.message}`);
    return toApp(data!);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table.update({ deleted_at: now() }).eq("id", id);
    if (error) throw new Error(`SupabaseTasks.delete: ${error.message}`);
  }
}
