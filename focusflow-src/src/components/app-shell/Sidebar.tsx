import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  Briefcase,
  Rocket,
  GraduationCap,
  Heart,
  User,
  CircleDollarSign,
  FolderOpen,
  Inbox,
  Plus,
  Settings2,
  ChevronDown,
} from "lucide-react";
import type { LifeArea } from "../../types";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { id: "today", label: "Today", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Rocket,
  GraduationCap,
  Heart,
  User,
  CircleDollarSign,
  FolderOpen,
  Inbox,
};

const AREA_COLOR_MAP: Record<string, string> = {
  blue: "text-blue-600 bg-blue-100",
  purple: "text-purple-600 bg-purple-100",
  violet: "text-violet-600 bg-violet-100",
  green: "text-green-600 bg-green-100",
  cyan: "text-cyan-600 bg-cyan-100",
  amber: "text-amber-600 bg-amber-100",
  orange: "text-orange-600 bg-orange-100",
  gray: "text-gray-600 bg-gray-100",
};

interface SidebarProps {
  areas: LifeArea[];
  selectedAreaId: string | null;
  onSelectArea: (id: string | null) => void;
  activeNav: string;
  onNavChange: (id: string) => void;
  tasks: { areaId: string }[];
}

export function Sidebar({ areas, selectedAreaId, onSelectArea, activeNav, onNavChange, tasks }: SidebarProps) {
  const getCount = (areaId: string) => tasks.filter((t) => t.areaId === areaId).length;

  return (
    <aside className="w-56 min-w-[224px] flex flex-col border-r border-gray-200 bg-white h-full overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">FF</span>
        </div>
        <span className="font-bold text-gray-900 text-lg">
          <span className="text-blue-600">Focus</span>Flow
        </span>
      </div>

      {/* Main Nav */}
      <nav className="px-3 py-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavChange(id)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors text-left",
              activeNav === id
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      {/* Life Areas */}
      <div className="px-3 py-3 border-t border-gray-100 flex-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Life Areas</span>
          <button className="p-0.5 text-gray-400 hover:text-gray-600 rounded" aria-label="Add life area">
            <Plus size={14} />
          </button>
        </div>
        {areas
          .filter((a) => a.id !== "inbox")
          .map((area) => {
            const Icon = ICON_MAP[area.icon] ?? FolderOpen;
            const colorClass = AREA_COLOR_MAP[area.color] ?? AREA_COLOR_MAP.gray;
            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(selectedAreaId === area.id ? null : area.id)}
                className={clsx(
                  "w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm mb-0.5 transition-colors text-left",
                  selectedAreaId === area.id ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                )}
              >
                <span className={clsx("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                  <Icon size={13} />
                </span>
                <span className="flex-1 text-gray-700 truncate">{area.name}</span>
                <span className="text-xs text-gray-400 font-medium">{getCount(area.id)}</span>
              </button>
            );
          })}
        <button className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl mt-1 transition-colors">
          <Settings2 size={13} /> Manage Areas
        </button>
      </div>

      {/* Calendar Sync */}
      <div className="px-3 py-3 border-t border-gray-100 text-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-semibold text-gray-400 uppercase tracking-wide text-xs">Calendar Sync</span>
          <span className="flex items-center gap-1 text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
        </div>
        {[
          { name: "Google Calendar", color: "text-red-500" },
          { name: "Apple Calendar", color: "text-gray-700" },
        ].map((cal) => (
          <div key={cal.name} className="flex items-center justify-between px-2 py-1.5">
            <span className="text-gray-600">{cal.name}</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
        ))}
        <button className="w-full text-left px-2 py-1.5 text-blue-600 hover:underline">
          Manage Connections
        </button>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          KS
        </div>
        <span className="text-sm font-medium text-gray-800 flex-1 truncate">Kartikay Singh</span>
        <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
      </div>
    </aside>
  );
}
