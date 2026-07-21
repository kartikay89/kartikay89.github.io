import { Plus } from "lucide-react";
import { DailySummary } from "./DailySummary";
import { ScheduledList } from "./ScheduledList";
import { TaskFilters } from "./TaskFilters";
import { TaskList } from "./TaskList";
import { formatDateDisplay } from "../../lib/time";
import type { Task, LifeArea } from "../../types";
import type { TimerControls } from "../../hooks/usePomodoro";

interface TodayDashboardProps {
  tasks: Task[];
  areas: LifeArea[];
  selectedAreaId: string | null;
  selectedPriority: string | null;
  selectedTaskId: string | null;
  runningTaskId: string | null;
  timerStatus: TimerControls["status"];
  onNewTask: () => void;
  onAreaChange: (id: string | null) => void;
  onPriorityChange: (p: string | null) => void;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export function TodayDashboard(props: TodayDashboardProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayTasks = props.tasks.filter((t) => t.scheduledDate === todayStr);

  const filteredTasks = todayTasks
    .filter((t) => !props.selectedAreaId || t.areaId === props.selectedAreaId)
    .filter((t) => !props.selectedPriority || t.priority === props.selectedPriority);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30 pb-16 md:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Today</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">{formatDateDisplay(today)}</p>
        </div>
        <button
          onClick={props.onNewTask}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={15} /> New Task
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        <DailySummary tasks={todayTasks} />
        <ScheduledList areas={props.areas} />
        <TaskFilters
          areas={props.areas}
          selectedAreaId={props.selectedAreaId}
          selectedPriority={props.selectedPriority}
          onAreaChange={props.onAreaChange}
          onPriorityChange={props.onPriorityChange}
          taskCount={filteredTasks.length}
        />
        <TaskList
          tasks={filteredTasks}
          areas={props.areas}
          selectedTaskId={props.selectedTaskId}
          runningTaskId={props.runningTaskId}
          timerStatus={props.timerStatus}
          onSelectTask={props.onSelectTask}
          onToggleTimer={props.onToggleTimer}
          onToggleComplete={props.onToggleComplete}
        />
      </div>
    </div>
  );
}
