import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export type SyncIndicatorStatus = "synced" | "syncing" | "offline" | "failed" | "idle";

export interface AuthStore {
  session: Session | null;
  user: User | null;
  loading: boolean;
  syncStatus: SyncIndicatorStatus;
  lastSynced: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<string>;
  signOut: () => Promise<void>;
  setSyncStatus: (s: SyncIndicatorStatus) => void;
  setLastSynced: (iso: string) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  syncStatus: "idle",
  lastSynced: null,

  setSyncStatus: (s) => set({ syncStatus: s }),
  setLastSynced: (iso) => set({ lastSynced: iso }),

  initialize: async () => {
    if (!supabaseConfigured || !supabase) {
      set({ loading: false });
      return;
    }

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signInWithGoogle: async () => {
    const sb = supabase;
    if (!sb) throw new Error("Supabase not configured");
    const redirectTo = `${window.location.origin}/kartikay-os/`;
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
  },

  signInWithMagicLink: async (email: string) => {
    const sb = supabase;
    if (!sb) throw new Error("Supabase not configured");
    const redirectTo = `${window.location.origin}/kartikay-os/`;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
    return email;
  },

  signOut: async () => {
    const sb = supabase;
    if (!sb) return;
    await sb.auth.signOut();
    set({ session: null, user: null, syncStatus: "idle", lastSynced: null });
  },
}));
