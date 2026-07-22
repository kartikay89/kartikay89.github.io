import { LayoutDashboard, CheckSquare, Calendar, MoreHorizontal, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/uiStore";

const TABS = [
  { path: "/", label: "Today", icon: LayoutDashboard },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  null, // center add button
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/more", label: "More", icon: MoreHorizontal },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const { setShowQuickCapture } = useUiStore();
  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {TABS.map((tab, i) => {
          if (tab === null) {
            return (
              <button
                key="add"
                onClick={() => setShowQuickCapture(true)}
                className="w-14 h-14 -mt-5 bg-[#1463ff] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Quick capture"
              >
                <Plus size={24} />
              </button>
            );
          }
          const { path, label, icon: Icon } = tab;
          return (
            <Link
              key={i}
              to={path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 min-w-[44px] min-h-[44px] rounded-xl transition-colors",
                isActive(path) ? "text-[#1463ff]" : "text-gray-400"
              )}
              aria-current={isActive(path) ? "page" : undefined}
            >
              <Icon size={22} aria-hidden />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
