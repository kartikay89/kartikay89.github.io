import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Settings, FolderOpen, FileText, RefreshCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Link, useLocation } from "react-router-dom";

const NAV = [
  { path: "/", label: "Today", icon: LayoutDashboard },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/areas", label: "Life Areas", icon: FolderOpen },
  { path: "/notes", label: "Notes", icon: FileText },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <aside className="w-56 min-w-[224px] flex flex-col border-r border-gray-200 bg-white h-full overflow-y-auto no-scrollbar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#1463ff] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">K</span>
        </div>
        <span className="font-bold text-gray-900 text-base">Kartikay OS</span>
      </div>

      {/* Nav */}
      <nav className="px-3 py-3 flex-1" aria-label="Main navigation">
        {NAV.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-colors",
              isActive(path)
                ? "bg-[#eaf1ff] text-[#1463ff]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            aria-current={isActive(path) ? "page" : undefined}
          >
            <Icon size={16} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      {/* Calendar sync */}
      <div className="px-4 py-3 border-t border-gray-100 text-xs flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Calendar Sync</span>
          <span className="flex items-center gap-1 text-green-600 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Connected
          </span>
        </div>
        {[
          { name: "Google Calendar", icon: "G" },
          { name: "Apple Calendar", icon: "" },
        ].map(({ name }) => (
          <div key={name} className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-[11px]">{name}</span>
            <span className="text-green-600 font-medium text-[11px]">Connected</span>
          </div>
        ))}
        <button className="w-full text-left text-[11px] text-[#1463ff] hover:underline mt-1 flex items-center gap-1">
          <RefreshCw size={10} /> Manage Connections
        </button>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          KS
        </div>
        <span className="text-xs font-medium text-gray-800 flex-1 truncate">Kartikay Singh</span>
        <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
      </div>
    </aside>
  );
}
