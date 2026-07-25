import { getSupabase } from "@/lib/supabase";
import type { ILifeAreaRepository } from "../interfaces";
import type { LifeArea } from "@/types";
import type { DbLifeArea } from "@/lib/supabaseTypes";
import { now } from "@/lib/time";
import { nanoid } from "@/lib/nanoid";

function toApp(row: DbLifeArea): LifeArea {
  return {
    id: row.id, userId: row.user_id, name: row.name, icon: row.icon, color: row.color,
    archived: row.archived, createdAt: row.created_at, updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined, version: row.version, syncStatus: "synced",
  };
}

export class SupabaseLifeAreaRepository implements ILifeAreaRepository {
  private get sb() { return getSupabase(); }
  private get table() { return this.sb.from("life_areas"); }

  async getAll(): Promise<LifeArea[]> {
    const { data, error } = await this.table.select("*").is("deleted_at", null).order("created_at");
    if (error) throw new Error(`SupabaseLifeAreas.getAll: ${error.message}`);
    return (data ?? []).map(toApp);
  }

  async getById(id: string): Promise<LifeArea | undefined> {
    const { data, error } = await this.table.select("*").eq("id", id).single();
    if (error) return undefined;
    return data ? toApp(data) : undefined;
  }

  async create(partial: Omit<LifeArea, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<LifeArea> {
    const user = (await this.sb.auth.getUser()).data.user;
    const row: DbLifeArea = {
      id: nanoid(), user_id: user?.id ?? "local-user", name: partial.name,
      icon: partial.icon, color: partial.color, archived: partial.archived,
      created_at: now(), updated_at: now(), deleted_at: null, version: 1,
    };
    const { data, error } = await this.table.insert(row).select().single();
    if (error) throw new Error(`SupabaseLifeAreas.create: ${error.message}`);
    return toApp(data!);
  }

  async update(id: string, changes: Partial<LifeArea>): Promise<LifeArea> {
    const db: Partial<DbLifeArea> = {};
    if (changes.name !== undefined) db.name = changes.name;
    if (changes.icon !== undefined) db.icon = changes.icon;
    if (changes.color !== undefined) db.color = changes.color;
    if (changes.archived !== undefined) db.archived = changes.archived;
    if ("deletedAt" in changes) db.deleted_at = changes.deletedAt ?? null;
    db.updated_at = now();
    const { data, error } = await this.table.update(db).eq("id", id).select().single();
    if (error) throw new Error(`SupabaseLifeAreas.update: ${error.message}`);
    return toApp(data!);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.table.update({ deleted_at: now() }).eq("id", id);
    if (error) throw new Error(`SupabaseLifeAreas.delete: ${error.message}`);
  }
}
