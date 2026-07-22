import { db } from "../database";
import type { Task, TaskStatus } from "@/types";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";

const USER_ID = "local-user";

export const TaskRepository = {
  async getAll(): Promise<Task[]> {
    return db.tasks.filter((t) => !t.deletedAt).toArray();
  },

  async getById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  },

  async getScheduled(date: string): Promise<Task[]> {
    return db.tasks
      .where("scheduledDate")
      .equals(date)
      .filter((t) => !t.deletedAt)
      .toArray();
  },

  async getByArea(areaId: string): Promise<Task[]> {
    return db.tasks
      .where("areaId")
      .equals(areaId)
      .filter((t) => !t.deletedAt)
      .toArray();
  },

  async getByStatus(status: TaskStatus): Promise<Task[]> {
    return db.tasks
      .where("status")
      .equals(status)
      .filter((t) => !t.deletedAt)
      .toArray();
  },

  async create(partial: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<Task> {
    const task: Task = {
      id: nanoid(),
      userId: USER_ID,
      createdAt: now(),
      updatedAt: now(),
      version: 1,
      syncStatus: "pending",
      ...partial,
    };
    await db.tasks.add(task);
    return task;
  },

  async update(id: string, changes: Partial<Task>): Promise<Task> {
    const updated = { ...changes, updatedAt: now(), syncStatus: "pending" as const };
    await db.tasks.update(id, updated);
    const task = await db.tasks.get(id);
    if (!task) throw new Error(`Task ${id} not found`);
    return task;
  },

  async delete(id: string): Promise<void> {
    await db.tasks.update(id, { deletedAt: now(), syncStatus: "pending" });
  },

  async hardDelete(id: string): Promise<void> {
    await db.tasks.delete(id);
  },
};
