import { getSupabase } from "@/lib/supabase";
import type { INoteRepository } from "../interfaces";
import type { Note, NoteFolder, NoteType } from "@/types";
import type { DbNote } from "@/lib/supabaseTypes";
import { now } from "@/lib/time";
import { nanoid } from "@/lib/nanoid";

function toApp(row: DbNote): Note {
  return {
    id: row.id, userId: row.user_id, title: row.title,
    type: row.type as NoteType, language: row.language ?? undefined,
    content: row.content, tags: row.tags ?? [], folder: row.folder as NoteFolder,
    archived: row.archived, createdAt: row.created_at, updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined, version: row.version, syncStatus: "synced",
  };
}

export class SupabaseNoteRepository implements INoteRepository {
  private get sb() { return getSupabase(); }
  private get table() { return this.sb.from("notes"); }

  async getAll(): Promise<Note[]> {
    const { data, error } = await this.table.select("*").is("deleted_at", null).eq("archived", false).order("updated_at", { ascending: false });
    if (error) throw new Error(`SupabaseNotes.getAll: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async getById(id: string): Promise<Note | undefined> {
    const { data, error } = await this.table.select("*").eq("id", id).single();
    if (error) return undefined;
    return data ? toApp(data) : undefined;
  }

  async getByFolder(folder: string): Promise<Note[]> {
    if (folder === "all") return this.getAll();
    const { data, error } = await this.table.select("*").eq("folder", folder).is("deleted_at", null).eq("archived", false);
    if (error) throw new Error(`SupabaseNotes.getByFolder: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async create(partial: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<Note> {
    const user = (await this.sb.auth.getUser()).data.user;
    const row: DbNote = {
      id: nanoid(), user_id: user?.id ?? "local-user", title: partial.title,
      type: partial.type, language: partial.language ?? null, content: partial.content,
      tags: partial.tags ?? [], folder: partial.folder, archived: partial.archived,
      created_at: now(), updated_at: now(), deleted_at: null, version: 1,
    };
    const { data, error } = await this.table.insert(row).select().single();
    if (error) throw new Error(`SupabaseNotes.create: ${error.message}`);
    return toApp(data!);
  }

  async update(id: string, changes: Partial<Note>): Promise<Note> {
    const db: Partial<DbNote> = {};
    if (changes.title !== undefined) db.title = changes.title;
    if (changes.content !== undefined) db.content = changes.content;
    if (changes.type !== undefined) db.type = changes.type;
    if (changes.language !== undefined) db.language = changes.language ?? null;
    if (changes.tags !== undefined) db.tags = changes.tags;
    if (changes.folder !== undefined) db.folder = changes.folder;
    if (changes.archived !== undefined) db.archived = changes.archived;
    if ("deletedAt" in changes) db.deleted_at = changes.deletedAt ?? null;
    db.updated_at = now();
    const { data, error } = await this.table.update(db).eq("id", id).select().single();
    if (error) throw new Error(`SupabaseNotes.update: ${error.message}`);
    return toApp(data!);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table.update({ deleted_at: now() }).eq("id", id);
    if (error) throw new Error(`SupabaseNotes.delete: ${error.message}`);
  }
}
