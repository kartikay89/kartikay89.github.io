import { db } from "../database";
import type { LifeArea } from "@/types";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";

const USER_ID = "local-user";

export const LifeAreaRepository = {
  async getAll(): Promise<LifeArea[]> {
    return db.lifeAreas.filter((a) => !a.deletedAt).toArray();
  },

  async getById(id: string): Promise<LifeArea | undefined> {
    return db.lifeAreas.get(id);
  },

  async create(partial: Omit<LifeArea, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<LifeArea> {
    const area: LifeArea = {
      id: nanoid(),
      userId: USER_ID,
      createdAt: now(),
      updatedAt: now(),
      version: 1,
      syncStatus: "pending",
      ...partial,
    };
    await db.lifeAreas.add(area);
    return area;
  },

  async update(id: string, changes: Partial<LifeArea>): Promise<LifeArea> {
    await db.lifeAreas.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
    const area = await db.lifeAreas.get(id);
    if (!area) throw new Error(`LifeArea ${id} not found`);
    return area;
  },

  async delete(id: string): Promise<void> {
    await db.lifeAreas.update(id, { deletedAt: now(), syncStatus: "pending" });
  },
};
