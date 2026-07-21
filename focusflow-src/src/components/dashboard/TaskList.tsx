import { TaskRow } from "./TaskRow";
import type { Task, LifeArea } from "../../types";

interface TaskListProps {
  tasks: Task[];
  areas: LifeArea[];
  selectedTaskId: string | null;
  runningTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onToggleTimer: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export function TaskList({ tasks, areas, selectedTaskId, runningTaskId, onSelectTask, onToggleTimer, onToggleComplete }: TaskListProps) {
  const getArea = (areaId: string) => areas.find((a) => a.id === areaId) ?? areas[0];
  const hasUrgentPending = tasks.some((t) => t.priority === "urgent" && t.status !== "completed");

  return (
    <div className="flex flex-col gap-2">
      {hasUrgentPending && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
          <span className="text-base">&#x2139;&#xFE0F;</span>
          Urgent tasks are shown at the top. Complete them first to stay on track!
        </div>
      )}
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          area={getArea(task.areaId)}
          isSelected={task.id === selectedTaskId}
          isRunning={task.id === runningTaskId}
          hasUrgentPending={hasUrgentPending}
          onSelect={() => onSelectTask(task)}
          onToggleTimer={() => onToggleTimer(task)}
          onToggleComplete={() => onToggleComplete(task.id)}
        />
      ))}
      {tasks.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-gray-400">
          No tasks for today. Add one!
        </div>
      )}
    </div>
  );
}
