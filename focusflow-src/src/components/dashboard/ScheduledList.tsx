import { Calendar } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { LifeArea } from "../../types";
import { seedScheduled } from "../../data/seed";

interface ScheduledListProps {
  areas: LifeArea[];
}

const colorMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-50 border-blue-200",
  purple: "text-purple-700 bg-purple-50 border-purple-200",
  green: "text-green-700 bg-green-50 border-green-200",
  gray: "text-gray-700 bg-gray-50 border-gray-200",
};

export function ScheduledList({ areas }: ScheduledListProps) {
  const getArea = (id: string) => areas.find((a) => a.id === id);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-800">Scheduled</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{seedScheduled.length} upcoming</span>
        </div>
        <button className="text-xs text-blue-600 font-medium hover:underline">View Calendar</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {seedScheduled.map((item, i) => {
          const area = getArea(item.areaId);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-4 py-3 ${i < seedScheduled.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <span className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">{item.time}</span>
              <span className="flex-1 text-sm font-medium text-gray-800">{item.title}</span>
              {area && <Badge className={colorMap[area.color] ?? colorMap.gray}>{area.name}</Badge>}
              <Calendar size={14} className="text-gray-300" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
