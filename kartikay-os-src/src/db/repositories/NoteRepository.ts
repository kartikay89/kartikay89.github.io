import { db } from "../database";
import type { Note, NoteFolder } from "@/types";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";

const USER_ID = "local-user";

export const NoteRepository = {
  async getAll(): Promise<Note[]> {
    return db.notes.filter((n) => !n.deletedAt && !n.archived).toArray();
  },

  async getById(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  async getByFolder(folder: NoteFolder): Promise<Note[]> {
    if (folder === "all") return this.getAll();
    return db.notes
      .where("folder")
      .equals(folder)
      .filter((n) => !n.deletedAt && !n.archived)
      .toArray();
  },

  async create(partial: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<Note> {
    const note: Note = {
      id: nanoid(),
      userId: USER_ID,
      createdAt: now(),
      updatedAt: now(),
      version: 1,
      syncStatus: "pending",
      ...partial,
    };
    await db.notes.add(note);
    return note;
  },

  async update(id: string, changes: Partial<Note>): Promise<Note> {
    await db.notes.update(id, { ...changes, updatedAt: now(), syncStatus: "pending" });
    const note = await db.notes.get(id);
    if (!note) throw new Error(`Note ${id} not found`);
    return note;
  },

  async delete(id: string): Promise<void> {
    await db.notes.update(id, { deletedAt: now(), syncStatus: "pending" });
  },
};
