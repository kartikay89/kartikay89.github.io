import { ArrowUpDown } from "lucide-react";
import type { LifeArea } from "../../types";

interface TaskFiltersProps {
  areas: LifeArea[];
  selectedAreaId: string | null;
  selectedPriority: string | null;
  onAreaChange: (id: string | null) => void;
  onPriorityChange: (p: string | null) => void;
  taskCount: number;
}

const selectStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 8px center",
};

export function TaskFilters({ areas, selectedAreaId, selectedPriority, onAreaChange, onPriorityChange, taskCount }: TaskFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-gray-800">Today's Tasks</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{taskCount} tasks</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedAreaId ?? ""}
          onChange={(e) => onAreaChange(e.target.value || null)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-7 cursor-pointer"
          style={selectStyle}
        >
          <option value="">All Areas</option>
          {areas.filter((a) => a.id !== "inbox").map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={selectedPriority ?? ""}
          onChange={(e) => onPriorityChange(e.target.value || null)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-7 cursor-pointer"
          style={selectStyle}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <button className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 hover:bg-gray-50">
          <ArrowUpDown size={12} /> Sort
        </button>
      </div>
    </div>
  );
}
