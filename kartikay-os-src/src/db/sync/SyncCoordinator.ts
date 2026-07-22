import { db } from "@/db/database";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { now } from "@/lib/time";
import type { Task, LifeArea, Note, PomodoroSession } from "@/types";
import type { DbTask, DbLifeArea, DbNote, DbPomodoroSession } from "@/lib/supabaseTypes";

// ── Task mapping ──────────────────────────────────────────────

function dbTaskToLocal(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    areaId: (row.area_id as string) ?? "",
    tags: (row.tags as string[]) ?? [],
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    scheduledDate: (row.scheduled_date as string) ?? undefined,
    plannedStart: (row.planned_start as string) ?? undefined,
    plannedEnd: (row.planned_end as string) ?? undefined,
    pomodoroGoal: row.pomodoro_goal as number,
    completedPomodoros: row.completed_pomodoros as number,
    focusedSeconds: row.focused_seconds as number,
    notes: (row.notes as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string) ?? undefined,
    completedAt: (row.completed_at as string) ?? undefined,
    version: row.version as number,
    syncStatus: "synced",
  };
}

function localTaskToDb(task: Task, userId: string): DbTask {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description ?? null,
    area_id: task.areaId || null,
    tags: task.tags,
    status: task.status,
    priority: task.priority,
    scheduled_date: task.scheduledDate ?? null,
    planned_start: task.plannedStart ?? null,
    planned_end: task.plannedEnd ?? null,
    pomodoro_goal: task.pomodoroGoal,
    completed_pomodoros: task.completedPomodoros,
    focused_seconds: task.focusedSeconds,
    notes: task.notes,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    deleted_at: task.deletedAt ?? null,
    completed_at: task.completedAt ?? null,
    version: task.version,
  };
}

// ── Area mapping ──────────────────────────────────────────────

function dbAreaToLocal(row: Record<string, unknown>): LifeArea {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    icon: row.icon as string,
    color: row.color as string,
    archived: row.archived as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string) ?? undefined,
    version: row.version as number,
    syncStatus: "synced",
  };
}

function localAreaToDb(area: LifeArea, userId: string): DbLifeArea {
  return {
    id: area.id, user_id: userId, name: area.name, icon: area.icon, color: area.color,
    archived: area.archived, created_at: area.createdAt, updated_at: area.updatedAt,
    deleted_at: area.deletedAt ?? null, version: area.version,
  };
}

// ── Note mapping ──────────────────────────────────────────────

function dbNoteToLocal(row: Record<string, unknown>): Note {
  return {
    id: row.id as string, userId: row.user_id as string, title: row.title as string,
    type: row.type as Note["type"], language: (row.language as string) ?? undefined,
    content: row.content as string, tags: (row.tags as string[]) ?? [],
    folder: row.folder as Note["folder"], archived: row.archived as boolean,
    createdAt: row.created_at as string, updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string) ?? undefined, version: row.version as number,
    syncStatus: "synced",
  };
}

function localNoteToDb(note: Note, userId: string): DbNote {
  return {
    id: note.id, user_id: userId, title: note.title, type: note.type,
    language: note.language ?? null, content: note.content, tags: note.tags,
    folder: note.folder, archived: note.archived, created_at: note.createdAt,
    updated_at: note.updatedAt, deleted_at: note.deletedAt ?? null, version: note.version,
  };
}

// ── Pomodoro mapping ──────────────────────────────────────────

function dbPomoToLocal(row: Record<string, unknown>): PomodoroSession {
  return {
    id: row.id as string, userId: row.user_id as string, taskId: row.task_id as string,
    startedAt: row.started_at as string, endedAt: (row.ended_at as string) ?? undefined,
    durationSeconds: row.duration_seconds as number,
    actualFocusedSeconds: row.actual_focused_seconds as number,
    status: row.status as PomodoroSession["status"],
    createdAt: row.created_at as string, updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string) ?? undefined, version: row.version as number,
    syncStatus: "synced",
  };
}

// ── Sync down (cloud → local) ─────────────────────────────────

async function syncTableDown<T extends { id: string; updatedAt: string }>(
  tableName: string,
  userId: string,
  localTable: { get: (id: string) => Promise<T | undefined>; put: (item: T) => Promise<unknown> },
  toLocal: (row: Record<string, unknown>) => T
) {
  const sb = getSupabase();
  // Cast to any: tableName is a runtime string; type inference would resolve to never
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any).from(tableName).select("*").eq("user_id", userId);

  if (error) {
    console.warn(`SyncDown ${tableName}:`, (error as { message: string }).message);
    return;
  }

  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const existing = await localTable.get(row.id as string);
    const remote = toLocal(row);
    if (!existing || new Date(remote.updatedAt) > new Date(existing.updatedAt)) {
      await localTable.put(remote);
    }
  }
}

// ── Sync up (local → cloud, pending records) ──────────────────

async function syncPendingUp(userId: string) {
  const sb = getSupabase();

  // Tasks
  const pendingTasks = await db.tasks.filter((t) => t.syncStatus === "pending").toArray();
  for (const task of pendingTasks) {
    const { error } = await sb.from("tasks")
      .upsert(localTaskToDb(task, userId), { onConflict: "id" });
    if (!error) {
      await db.tasks.update(task.id, { syncStatus: "synced" });
    } else {
      console.warn(`Sync task ${task.id}:`, error.message);
      await db.tasks.update(task.id, { syncStatus: "failed" });
    }
  }

  // Life Areas
  const pendingAreas = await db.lifeAreas.filter((a) => a.syncStatus === "pending").toArray();
  for (const area of pendingAreas) {
    const { error } = await sb.from("life_areas")
      .upsert(localAreaToDb(area, userId), { onConflict: "id" });
    if (!error) {
      await db.lifeAreas.update(area.id, { syncStatus: "synced" });
    } else {
      console.warn(`Sync area ${area.id}:`, error.message);
    }
  }

  // Notes
  const pendingNotes = await db.notes.filter((n) => n.syncStatus === "pending").toArray();
  for (const note of pendingNotes) {
    const { error } = await sb.from("notes")
      .upsert(localNoteToDb(note, userId), { onConflict: "id" });
    if (!error) {
      await db.notes.update(note.id, { syncStatus: "synced" });
    } else {
      console.warn(`Sync note ${note.id}:`, error.message);
    }
  }

  // Pomodoro sessions
  const pendingPomos = await db.pomodoroSessions.filter((s) => s.syncStatus === "pending").toArray();
  for (const session of pendingPomos) {
    const row: DbPomodoroSession = {
      id: session.id, user_id: userId, task_id: session.taskId,
      started_at: session.startedAt, ended_at: session.endedAt ?? null,
      duration_seconds: session.durationSeconds,
      actual_focused_seconds: session.actualFocusedSeconds,
      status: session.status, created_at: session.createdAt, updated_at: session.updatedAt,
      deleted_at: session.deletedAt ?? null, version: session.version,
    };
    const { error } = await sb.from("pomodoro_sessions")
      .upsert(row, { onConflict: "id" });
    if (!error) {
      await db.pomodoroSessions.update(session.id, { syncStatus: "synced" });
    }
  }
}

// ── Public API ────────────────────────────────────────────────

export const SyncCoordinator = {
  /** Pull all cloud data into IndexedDB */
  async syncDown(userId: string): Promise<void> {
    if (!supabaseConfigured) return;
    const { setSyncStatus, setLastSynced } = useAuthStore.getState();
    setSyncStatus("syncing");
    try {
      await syncTableDown(
        "life_areas", userId,
        { get: (id) => db.lifeAreas.get(id), put: (a) => db.lifeAreas.put(a) },
        dbAreaToLocal
      );
      await syncTableDown(
        "tasks", userId,
        { get: (id) => db.tasks.get(id), put: (t) => db.tasks.put(t) },
        dbTaskToLocal
      );
      await syncTableDown(
        "notes", userId,
        { get: (id) => db.notes.get(id), put: (n) => db.notes.put(n) },
        dbNoteToLocal
      );
      await syncTableDown(
        "pomodoro_sessions", userId,
        { get: (id) => db.pomodoroSessions.get(id), put: (s) => db.pomodoroSessions.put(s) },
        dbPomoToLocal
      );
      setLastSynced(now());
      setSyncStatus("synced");
    } catch (err) {
      console.error("SyncDown failed:", err);
      setSyncStatus("failed");
    }
  },

  /** Push all pending local writes to Supabase */
  async syncUp(userId: string): Promise<void> {
    if (!supabaseConfigured) return;
    const { setSyncStatus, setLastSynced } = useAuthStore.getState();
    setSyncStatus("syncing");
    try {
      await syncPendingUp(userId);
      setLastSynced(now());
      setSyncStatus("synced");
    } catch (err) {
      console.error("SyncUp failed:", err);
      setSyncStatus("failed");
    }
  },

  /** Full bidirectional sync: down first, then up */
  async sync(userId: string): Promise<void> {
    await this.syncDown(userId);
    await this.syncUp(userId);
  },

  /** Upload a single newly created/updated record */
  async pushTask(task: Task, userId: string): Promise<void> {
    if (!supabaseConfigured) return;
    const sb = getSupabase();
    const { error } = await sb.from("tasks")
      .upsert(localTaskToDb(task, userId), { onConflict: "id" });
    if (error) {
      console.warn("pushTask:", error.message);
      await db.tasks.update(task.id, { syncStatus: "failed" });
    } else {
      await db.tasks.update(task.id, { syncStatus: "synced" });
    }
  },

  async pushNote(note: Note, userId: string): Promise<void> {
    if (!supabaseConfigured) return;
    const sb = getSupabase();
    const { error } = await sb.from("notes")
      .upsert(localNoteToDb(note, userId), { onConflict: "id" });
    if (error) {
      await db.notes.update(note.id, { syncStatus: "failed" });
    } else {
      await db.notes.update(note.id, { syncStatus: "synced" });
    }
  },

  async pushArea(area: LifeArea, userId: string): Promise<void> {
    if (!supabaseConfigured) return;
    const sb = getSupabase();
    const { error } = await sb.from("life_areas")
      .upsert(localAreaToDb(area, userId), { onConflict: "id" });
    if (error) {
      await db.lifeAreas.update(area.id, { syncStatus: "failed" });
    } else {
      await db.lifeAreas.update(area.id, { syncStatus: "synced" });
    }
  },
};
