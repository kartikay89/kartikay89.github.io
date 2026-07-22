import { useAuthStore } from "@/store/authStore";
import { supabaseConfigured } from "@/lib/supabase";
import { RefreshCw, CheckCircle, AlertCircle, WifiOff } from "lucide-react";
import { cn } from "@/lib/cn";

const STATUS_MAP = {
  synced: { label: "Synced", cls: "text-green-600 bg-green-50", icon: CheckCircle },
  syncing: { label: "Syncing", cls: "text-blue-600 bg-blue-50", icon: RefreshCw },
  failed: { label: "Failed", cls: "text-red-500 bg-red-50", icon: AlertCircle },
  offline: { label: "Offline", cls: "text-gray-400 bg-gray-100", icon: WifiOff },
  idle: { label: "", cls: "", icon: null },
};

export function SyncBadge() {
  const { syncStatus, session } = useAuthStore();
  if (!supabaseConfigured || !session || syncStatus === "idle") return null;
  const info = STATUS_MAP[syncStatus] ?? STATUS_MAP.idle;
  if (!info.icon) return null;
  const Icon = info.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full", info.cls)}>
      <Icon size={10} className={syncStatus === "syncing" ? "animate-spin" : ""} />
      {info.label}
    </span>
  );
}
