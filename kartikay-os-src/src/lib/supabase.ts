import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseTypes";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = supabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "kartikay-os-auth",
      },
    })
  : null;

// Returns the client typed as `any` so callers don't fight the Database generic constraint.
// Type safety is maintained through explicit toApp()/toDb() conversion functions in each repository.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): any {
  if (!supabase) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
  return supabase;
}
