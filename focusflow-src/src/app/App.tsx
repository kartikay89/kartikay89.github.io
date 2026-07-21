import { useState, useCallback } from "react";
import { Sidebar } from "../components/app-shell/Sidebar";
import { TodayDashboard } from "../components/dashboard/TodayDashboard";
import { TaskDetailPanel } from "../components/tasks/TaskDetailPanel";
import { NewTaskDialog } from "../components/tasks/NewTaskDialog";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { seedTasks, seedAreas } from "../data/seed";
import { sortTasks } from "../lib/sorting";
import type { Task, LifeArea } from "../types";

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("ff_tasks", seedTasks);
  const [areas] = useLocalStorage<LifeArea[]>("ff_areas", seedAreas);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("t1");
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [filterAreaId, setFilterAreaId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [activeNav, setActiveNav] = useState("today");
  const [urgentConfirm, setUrgentConfirm] = useState<{ targetTask: Task } | null>(null);

  const sortedTasks = sortTasks(tasks);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const selectedArea = selectedTask ? (areas.find((a) => a.id === selectedTask.areaId) ?? areas[0]) : null;
  const hasUrgentPending = tasks.some((t) => t.priority === "urgent" && t.status !== "completed");

  const handleToggleTimer = useCallback(
    (task: Task) => {
      if (task.id === runningTaskId) {
        setRunningTaskId(null);
        return;
      }
      if (hasUrgentPending && task.priority !== "urgent" && task.status !== "completed") {
        setUrgentConfirm({ targetTask: task });
        return;
      }
      setRunningTaskId(task.id);
      setSelectedTaskId(task.id);
    },
    [runningTaskId, hasUrgentPending]
  );

  const handlePomodoroComplete = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completedPomodoros: t.completedPomodoros + 1,
                focusedSeconds: t.focusedSeconds + 25 * 60,
              }
            : t
        )
      );
    },
    [setTasks]
  );

  const handleToggleComplete = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: t.status === "completed" ? "todo" : "completed" } : t
        )
      );
    },
    [setTasks]
  );

  const handleAddTask = useCallback(
    (task: Task) => {
      setTasks((prev) => [...prev, task]);
    },
    [setTasks]
  );

  const handleUpdateTask = useCallback(
    (updated: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    },
    [setTasks]
  );

  const urgentTask = tasks.find((t) => t.priority === "urgent" && t.status !== "completed");

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Sidebar
        areas={areas}
        tasks={tasks}
        selectedAreaId={filterAreaId}
        onSelectArea={setFilterAreaId}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      {activeNav === "today" ? (
        <TodayDashboard
          tasks={sortedTasks}
          areas={areas}
          selectedAreaId={filterAreaId}
          selectedPriority={filterPriority}
          selectedTaskId={selectedTaskId}
          runningTaskId={runningTaskId}
          onNewTask={() => setShowNewTask(true)}
          onAreaChange={setFilterAreaId}
          onPriorityChange={setFilterPriority}
          onSelectTask={(task) => setSelectedTaskId(task.id)}
          onToggleTimer={handleToggleTimer}
          onToggleComplete={handleToggleComplete}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300 mb-2">
              {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </p>
            <p className="text-gray-400 text-sm">Coming soon</p>
          </div>
        </div>
      )}

      {selectedTask && selectedArea && (
        <TaskDetailPanel
          task={selectedTask}
          area={selectedArea}
          areas={areas}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={handleUpdateTask}
          onPomodoroComplete={handlePomodoroComplete}
          onComplete={handleToggleComplete}
        />
      )}

      {showNewTask && (
        <NewTaskDialog areas={areas} onSave={handleAddTask} onClose={() => setShowNewTask(false)} />
      )}

      {/* Urgent task confirmation dialog */}
      {urgentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <p className="font-bold text-gray-900 mb-2">An urgent task is still pending.</p>
            <p className="text-sm text-gray-500 mb-5">Do you want to continue with this task anyway?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUrgentConfirm(null);
                  if (urgentTask) setSelectedTaskId(urgentTask.id);
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Go to urgent task
              </button>
              <button
                onClick={() => {
                  setRunningTaskId(urgentConfirm.targetTask.id);
                  setSelectedTaskId(urgentConfirm.targetTask.id);
                  setUrgentConfirm(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
