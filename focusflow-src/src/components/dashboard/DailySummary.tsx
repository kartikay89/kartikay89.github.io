import type { Task } from "../../types";
import { formatFocusTimeSummary } from "../../lib/time";

interface DailySummaryProps {
  tasks: Task[];
}

export function DailySummary({ tasks }: DailySummaryProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const focusedSeconds = tasks.reduce((sum, t) => sum + t.focusedSeconds, 0);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[
        { label: "Tasks", value: total, sub: "scheduled" },
        { label: "Focus Time", value: focusedSeconds > 0 ? formatFocusTimeSummary(focusedSeconds) : "0m", sub: "today" },
        { label: "Completed", value: completed, sub: "tasks" },
      ].map((stat) => (
        <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs font-medium text-gray-400 mb-1">{stat.label}</div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-xs text-gray-400">{stat.sub}</div>
        </div>
      ))}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
        <svg width={48} height={48} className="-rotate-90">
          <circle cx={24} cy={24} r={18} fill="none" stroke="#e2e8f0" strokeWidth={4} />
          <circle
            cx={24}
            cy={24}
            r={18}
            fill="none"
            stroke="#1463ff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div>
          <div className="text-xs text-gray-400">Progress</div>
          <div className="text-2xl font-bold text-gray-900">{progress}%</div>
        </div>
      </div>
    </div>
  );
}
