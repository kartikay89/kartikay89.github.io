import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabaseConfigured } from "@/lib/supabase";
import { SyncCoordinator } from "@/db/sync/SyncCoordinator";
import { ChevronDown, LogOut, RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff, LogIn } from "lucide-react";
import { cn } from "@/lib/cn";

const SYNC_LABELS: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  synced: { label: "Synced", cls: "text-green-600", icon: CheckCircle },
  syncing: { label: "Syncing…", cls: "text-blue-600", icon: RefreshCw },
  failed: { label: "Sync failed", cls: "text-red-500", icon: AlertCircle },
  offline: { label: "Offline", cls: "text-gray-400", icon: WifiOff },
  idle: { label: "Local only", cls: "text-gray-400", icon: Wifi },
};

export function ProfileMenu({ onSignIn }: { onSignIn?: () => void }) {
  const { user, session, syncStatus, lastSynced, signOut } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSyncNow = async () => {
    if (user) await SyncCoordinator.sync(user.id);
  };

  const initials = (user?.user_metadata?.full_name as string ?? user?.email ?? "KS")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const statusInfo = SYNC_LABELS[syncStatus] ?? SYNC_LABELS.idle;
  const StatusIcon = statusInfo.icon;

  // Not configured — static display
  if (!supabaseConfigured) {
    return (
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">KS</div>
        <span className="text-xs font-medium text-gray-800 flex-1 truncate">Kartikay Singh</span>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="px-4 py-3 border-t border-gray-100">
        <button
          onClick={onSignIn}
          className="w-full flex items-center gap-2 text-xs text-[#1463ff] font-medium hover:opacity-80 transition-opacity"
        >
          <LogIn size={14} />
          Sign in to sync
        </button>
      </div>
    );
  }

  // Signed in
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 border-t border-gray-100 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img src={avatarUrl} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" alt="Avatar" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium text-gray-800 truncate">
            {(user?.user_metadata?.full_name as string) || user?.email}
          </p>
          <p className={cn("text-[10px] flex items-center gap-1", statusInfo.cls)}>
            <StatusIcon size={10} className={syncStatus === "syncing" ? "animate-spin" : ""} />
            {statusInfo.label}
          </p>
        </div>
        <ChevronDown size={13} className={cn("text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50">
          {/* User info */}
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {(user?.user_metadata?.full_name as string) || "Signed in"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            {lastSynced && (
              <p className="text-[10px] text-gray-300 mt-1">
                Last synced {new Date(lastSynced).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Sync now */}
          <button
            onClick={handleSyncNow}
            disabled={syncStatus === "syncing"}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncStatus === "syncing" ? "animate-spin" : ""} />
            Sync now
          </button>

          {/* Sign out */}
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
