import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { ToastContainer } from "@/components/ui/Toast";
import { NewTaskDialog } from "@/features/tasks/NewTaskDialog";
import { QuickCaptureDialog } from "@/features/quick-capture/QuickCaptureDialog";
import { useTimerStore, startTickEngine } from "@/store/timerStore";
import { useUiStore } from "@/store/uiStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { initializeDatabase } from "@/db/init";
import { useAuthStore } from "@/store/authStore";
import { supabaseConfigured } from "@/lib/supabase";
import { SyncCoordinator } from "@/db/sync/SyncCoordinator";
import { MigrationService, type LocalDataSummary } from "@/db/sync/MigrationService";
import { AuthPage } from "@/features/auth/AuthPage";
import { MigrationDialog } from "@/features/auth/MigrationDialog";

// Lazy-load pages
const TodayPage = lazy(() => import("@/features/tasks/TodayPage"));
const TasksPage = lazy(() => import("@/features/tasks/TasksPage"));
const CalendarPage = lazy(() => import("@/features/calendar/CalendarPage"));
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));
const LifeAreasPage = lazy(() => import("@/features/life-areas/LifeAreasPage"));
const NotesPage = lazy(() => import("@/features/notes/NotesPage"));
const MorePage = lazy(() => import("@/features/mobile/MorePage"));

// Import task detail panel
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";

const AUTH_SKIP_KEY = "kartikay-os-auth-skipped";

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1463ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const { loadPersistedTimer } = useTimerStore();
  const { selectedTaskId, setSelectedTaskId, urgentWarning, setUrgentWarning } = useUiStore();
  const location = useLocation();
  const { user, initialize } = useAuthStore();

  const [showAuth, setShowAuth] = useState(false);
  const [migrationSummary, setMigrationSummary] = useState<LocalDataSummary | null>(null);

  useEffect(() => {
    async function boot() {
      await initializeDatabase();
      await loadPersistedTimer();
      if (supabaseConfigured) {
        await initialize();
        const { session } = useAuthStore.getState();
        if (!session && !localStorage.getItem(AUTH_SKIP_KEY)) {
          setShowAuth(true);
        }
      }
      setReady(true);
    }
    boot();
    startTickEngine(useTimerStore);
  }, []);

  // When user signs in (or returns from OAuth redirect), check migration then sync
  useEffect(() => {
    if (!ready || !user) return;
    setShowAuth(false);

    async function onSignIn() {
      if (!MigrationService.hasMigrated()) {
        const hasLocal = await MigrationService.hasLocalData();
        if (hasLocal) {
          const summary = await MigrationService.getLocalSummary();
          setMigrationSummary(summary);
          return;
        }
        MigrationService.markMigrated();
      }
      await SyncCoordinator.sync(user!.id);
    }

    onSignIn();
  }, [ready, user?.id]);

  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).toArray(), []) ?? [];
  const areas = useLiveQuery(() => db.lifeAreas.toArray(), []) ?? [];

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const selectedArea = selectedTask ? areas.find((a) => a.id === selectedTask.areaId) : undefined;

  const showDetailPanel =
    selectedTask &&
    selectedArea &&
    !location.pathname.startsWith("/notes") &&
    !location.pathname.startsWith("/settings") &&
    !location.pathname.startsWith("/areas") &&
    !location.pathname.startsWith("/more");

  const urgentTask = tasks.find((t) => t.priority === "urgent" && t.status !== "completed");

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1463ff] flex items-center justify-center">
            <span className="text-white font-bold">K</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#1463ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <AuthPage
        onSkip={() => {
          localStorage.setItem(AUTH_SKIP_KEY, "1");
          setShowAuth(false);
        }}
      />
    );
  }

  return (
    <div className="flex h-dvh bg-white overflow-hidden" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar onSignIn={() => setShowAuth(true)} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<TodayPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/areas" element={<LifeAreasPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/more" element={<MorePage />} />
            </Routes>
          </Suspense>
        </div>

        {/* Task detail panel — desktop */}
        {showDetailPanel && (
          <div className="hidden md:flex flex-shrink-0">
            <TaskDetailPanel
              task={selectedTask!}
              area={selectedArea}
              onClose={() => setSelectedTaskId(null)}
            />
          </div>
        )}
      </div>

      {/* Mobile bottom nav (hidden on desktop) */}
      <MobileNav />

      {/* Dialogs */}
      <NewTaskDialog />
      <QuickCaptureDialog />

      {/* Toasts */}
      <ToastContainer />

      {/* First-login migration dialog */}
      {migrationSummary && user && (
        <MigrationDialog
          userId={user.id}
          summary={migrationSummary}
          onComplete={async () => {
            setMigrationSummary(null);
            await SyncCoordinator.sync(user.id);
          }}
        />
      )}

      {/* Urgent task warning */}
      {urgentWarning && urgentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <p className="font-bold text-gray-900 mb-2">An urgent task is still pending.</p>
            <p className="text-sm text-gray-500 mb-5">Do you want to continue with this task anyway?</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedTaskId(urgentTask.id); setUrgentWarning(null); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Go to urgent task
              </button>
              <button
                onClick={() => setUrgentWarning(null)}
                className="flex-1 py-2.5 bg-[#1463ff] rounded-xl text-sm font-semibold text-white hover:bg-[#0f55dc]"
              >
                Continue anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom padding */}
      <div className="md:hidden h-16" />
    </div>
  );
}
