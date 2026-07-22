import { cn } from "@/lib/cn";
import { formatDurationShort } from "@/lib/time";

interface Props {
  scheduledCount: number;
  focusSeconds: number;
  completedCount: number;
}

export function DailySummary({ scheduledCount, focusSeconds, completedCount }: Props) {
  const progress = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      <StatCard label="Tasks" value={String(scheduledCount)} sub="scheduled" />
      <StatCard label="Focus Time" value={formatDurationShort(focusSeconds)} sub="today" />
      <StatCard label="Completed" value={String(completedCount)} sub="tasks" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{progress}%</p>
        </div>
        <svg width="56" height="56" viewBox="0 0 56 56" aria-label={`${progress}% complete`}>
          <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke="#1463ff"
            strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
        </svg>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
