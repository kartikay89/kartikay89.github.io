import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Check, X } from "lucide-react";
import { formatDateLabel } from "@/lib/time";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type ViewMode = "month" | "week" | "agenda";

const MOCK_CONNECTIONS = [
  { id: "google", name: "Google Calendar", connected: false },
  { id: "apple", name: "Apple Calendar", connected: false },
];

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);

  const tasks = useLiveQuery(
    () => db.tasks.filter((t) => !!t.scheduledDate && !t.deletedAt).toArray(),
    []
  ) ?? [];
  const areas = useLiveQuery(() => db.lifeAreas.toArray(), []) ?? [];
  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toLocaleDateString("en-CA");

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    const d = new Date(year, month, day);
    return d.toLocaleDateString("en-CA");
  });

  const getTasksForDate = (dateStr: string) =>
    tasks.filter((t) => t.scheduledDate === dateStr);

  const navigate = (dir: 1 | -1) => {
    setCurrentDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() + dir);
      return n;
    });
  };

  const AREA_COLORS_MAP: Record<string, string> = {
    blue: "bg-blue-200 text-blue-800",
    violet: "bg-violet-200 text-violet-800",
    amber: "bg-amber-200 text-amber-800",
    green: "bg-green-200 text-green-800",
    cyan: "bg-cyan-200 text-cyan-800",
    emerald: "bg-emerald-200 text-emerald-800",
    orange: "bg-orange-200 text-orange-800",
    gray: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-700 min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(["month", "week", "agenda"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v ? "bg-[#1463ff] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 overflow-auto">
          {view === "month" && (
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
                {cells.map((dateStr, i) => {
                  const dayTasks = dateStr ? getTasksForDate(dateStr) : [];
                  const isToday = dateStr === today;
                  const isCurrentMonth = dateStr !== null;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "bg-white min-h-[100px] p-2",
                        !isCurrentMonth && "bg-gray-50"
                      )}
                    >
                      {dateStr && (
                        <>
                          <span className={cn(
                            "inline-flex w-6 h-6 items-center justify-center text-xs font-medium rounded-full mb-1",
                            isToday ? "bg-[#1463ff] text-white" : "text-gray-700"
                          )}>
                            {new Date(dateStr + "T00:00:00").getDate()}
                          </span>
                          {dayTasks.slice(0, 3).map((task) => {
                            const area = getArea(task.areaId);
                            const colorCls = area ? (AREA_COLORS_MAP[area.color] ?? AREA_COLORS_MAP.gray) : AREA_COLORS_MAP.gray;
                            return (
                              <div key={task.id} className={cn("text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate font-medium", colorCls)}>
                                {task.plannedStart && <span className="opacity-70 mr-1">{task.plannedStart}</span>}
                                {task.title}
                              </div>
                            );
                          })}
                          {dayTasks.length > 3 && (
                            <span className="text-[10px] text-gray-400">+{dayTasks.length - 3} more</span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {view === "agenda" && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-500 mb-4">Upcoming scheduled tasks</h2>
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                  <p>No scheduled tasks</p>
                </div>
              ) : (
                [...tasks]
                  .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))
                  .map((task) => {
                    const area = getArea(task.areaId);
                    return (
                      <div key={task.id} className="flex items-center gap-4 py-3 border-b border-gray-100">
                        <div className="w-16 text-right text-xs font-semibold text-gray-500">
                          {task.scheduledDate ? formatDateLabel(task.scheduledDate) : ""}
                        </div>
                        <div className="w-20 text-xs text-gray-400">
                          {task.plannedStart} {task.plannedEnd && `– ${task.plannedEnd}`}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          {area && <p className="text-xs text-gray-400">{area.name}</p>}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
          {view === "week" && (
            <div className="p-6 text-center text-gray-400">
              <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
              <p>Week view coming soon</p>
            </div>
          )}
        </div>

        {/* Calendar connections sidebar */}
        <div className="hidden lg:flex w-72 border-l border-gray-200 bg-white flex-col p-5 gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Calendar Connections</h2>
          {connections.map((conn) => (
            <div key={conn.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{conn.name}</p>
                  <p className={cn("text-xs mt-0.5", conn.connected ? "text-green-600" : "text-gray-400")}>
                    {conn.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
                {conn.connected ? (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <div className="flex gap-2">
                {conn.connected ? (
                  <>
                    <button
                      onClick={() => setConnections((c) => c.map((x) => x.id === conn.id ? { ...x, connected: false } : x))}
                      className="flex-1 flex items-center justify-center gap-1 text-xs text-red-500 border border-red-200 rounded-lg py-1.5 hover:bg-red-50"
                    >
                      <X size={11} /> Disconnect
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50">
                      <RefreshCw size={11} /> Sync
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConnections((c) => c.map((x) => x.id === conn.id ? { ...x, connected: true } : x))}
                    className="w-full flex items-center justify-center gap-1 text-xs text-[#1463ff] border border-[#1463ff]/30 rounded-lg py-1.5 hover:bg-blue-50"
                  >
                    <Check size={11} /> Connect
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Calendar integration requires account setup. Connect to sync your events automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
