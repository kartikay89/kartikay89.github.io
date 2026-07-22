import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { formatDurationShort } from "@/lib/time";
import { getWeekBounds, addDays } from "@/lib/time";
import { AREA_ICON_COLORS } from "@/lib/areaColors";
import { TrendingUp, Target, Zap, Clock } from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + "22" }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).toArray(), []) ?? [];
  const areas = useLiveQuery(() => db.lifeAreas.toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.pomodoroSessions.filter((s) => s.status === "completed").toArray(), []) ?? [];

  const { start: weekStart } = getWeekBounds();

  // Weekly focus data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const label = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    const seconds = sessions
      .filter((s) => s.startedAt.startsWith(date))
      .reduce((sum, s) => sum + s.actualFocusedSeconds, 0);
    return { date, label, seconds };
  });

  const today = new Date().toLocaleDateString("en-CA");
  const totalWeekSeconds = weekData.reduce((sum, d) => sum + d.seconds, 0);
  const totalCompleted = tasks.filter((t) => t.status === "completed").length;
  const totalPomodoros = sessions.length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
  const todaySeconds = sessions.filter((s) => s.startedAt.startsWith(today)).reduce((sum, s) => sum + s.actualFocusedSeconds, 0);

  // Focus by area
  const areaFocus = areas.map((area) => {
    const areaTasks = tasks.filter((t) => t.areaId === area.id).map((t) => t.id);
    const seconds = sessions.filter((s) => areaTasks.includes(s.taskId)).reduce((sum, s) => sum + s.actualFocusedSeconds, 0);
    const ic = AREA_ICON_COLORS[area.color] ?? AREA_ICON_COLORS.gray;
    return { name: area.name, value: seconds, color: ic.text, seconds };
  }).filter((a) => a.seconds > 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="text-sm text-gray-400">This week</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Today's Focus" value={formatDurationShort(todaySeconds)} sub="today" icon={Clock} color="#1463ff" />
          <StatCard label="Weekly Focus" value={formatDurationShort(totalWeekSeconds)} sub="this week" icon={TrendingUp} color="#7c3aed" />
          <StatCard label="Completed Tasks" value={String(totalCompleted)} sub={`${completionRate}% completion`} icon={Target} color="#16a34a" />
          <StatCard label="Pomodoros Done" value={String(totalPomodoros)} sub="all time" icon={Zap} color="#f59e0b" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Weekly Focus Time</h2>
              <span className="text-xs text-gray-400">{formatDurationShort(totalWeekSeconds)} total</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekData} barCategoryGap="30%">
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => v === 0 ? "0" : `${Math.round(v / 3600)}h`} width={24} />
                <Tooltip formatter={(v: number) => [formatDurationShort(v), "Focus"]} contentStyle={{ border: "none", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="seconds" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {weekData.map((d) => (
                    <Cell key={d.date} fill={d.date === today ? "#1463ff" : "#bfdbfe"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Focus by area */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Focus by Life Area</h2>
            {areaFocus.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-gray-400">No focus data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={areaFocus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {areaFocus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatDurationShort(v), "Focus"]} contentStyle={{ border: "none", borderRadius: 8, fontSize: 12 }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Task completion trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
            <div className="space-y-3">
              {(["urgent", "important", "normal", "low"] as const).map((p) => {
                const count = tasks.filter((t) => t.priority === p).length;
                const done = tasks.filter((t) => t.priority === p && t.status === "completed").length;
                const pct = count > 0 ? (done / count) * 100 : 0;
                const colors: Record<string, string> = { urgent: "#ef4444", important: "#f97316", normal: "#64748b", low: "#16a34a" };
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 capitalize">{p}</span>
                      <span className="text-xs text-gray-400">{done}/{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[p] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most active areas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Life Areas</h2>
            <div className="space-y-3">
              {[...areaFocus].sort((a, b) => b.seconds - a.seconds).slice(0, 5).map((area) => (
                <div key={area.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: area.color }} />
                  <span className="flex-1 text-sm text-gray-700 truncate">{area.name}</span>
                  <span className="text-xs font-medium text-gray-500">{formatDurationShort(area.seconds)}</span>
                </div>
              ))}
              {areaFocus.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No focus data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
