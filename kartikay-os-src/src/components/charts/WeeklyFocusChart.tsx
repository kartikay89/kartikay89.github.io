import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatDurationShort } from "@/lib/time";

interface WeeklyFocusChartProps {
  data: { date: string; seconds: number; label: string }[];
  todayDate: string;
  totalSeconds: number;
}

export function WeeklyFocusChart({
  data,
  todayDate,
  totalSeconds,
}: WeeklyFocusChartProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Weekly Focus</h3>
        <span className="text-xs text-gray-400">
          {formatDurationShort(totalSeconds)} total
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickFormatter={(v: number) =>
              v === 0 ? "0" : `${Math.round(v / 3600)}h`
            }
            domain={[0, "auto"]}
            width={24}
          />
          <Tooltip
            formatter={(value: number) => [
              formatDurationShort(value),
              "Focus",
            ]}
            contentStyle={{
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="seconds" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={entry.date === todayDate ? "#1463ff" : "#bfdbfe"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
        <span>&#10003;</span>
        Keep going! Stay consistent to build your best focus streak.
      </p>
    </div>
  );
}
