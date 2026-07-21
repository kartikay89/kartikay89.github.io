import { LayoutDashboard, CheckSquare, Plus, Calendar, Grid3X3 } from "lucide-react";
import { clsx } from "clsx";

interface BottomNavProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  onQuickAdd: () => void;
}

const NAV_ITEMS = [
  { id: "today", label: "Today", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "areas", label: "Areas", icon: Grid3X3 },
];

export function BottomNav({ activeNav, onNavChange, onQuickAdd }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 pb-safe">
        {NAV_ITEMS.slice(0, 2).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavChange(id)}
            className={clsx(
              "flex flex-col items-center gap-1 py-2 px-4 min-w-[44px] min-h-[44px] justify-center",
              activeNav === id ? "text-blue-600" : "text-gray-400"
            )}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}

        {/* Center Quick Add */}
        <button
          onClick={onQuickAdd}
          className="flex flex-col items-center justify-center -mt-5 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-200 text-white"
          aria-label="Quick add"
        >
          <Plus size={26} />
        </button>

        {NAV_ITEMS.slice(2).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavChange(id)}
            className={clsx(
              "flex flex-col items-center gap-1 py-2 px-4 min-w-[44px] min-h-[44px] justify-center",
              activeNav === id ? "text-blue-600" : "text-gray-400"
            )}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
