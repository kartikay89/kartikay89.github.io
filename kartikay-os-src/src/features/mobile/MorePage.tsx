import { Link } from "react-router-dom";
import { FolderOpen, FileText, BarChart2, Settings, ChevronRight } from "lucide-react";

const LINKS = [
  { to: "/areas", label: "Life Areas", icon: FolderOpen, desc: "Manage your life areas" },
  { to: "/notes", label: "Notes", icon: FileText, desc: "All your notes and snippets" },
  { to: "/analytics", label: "Analytics", icon: BarChart2, desc: "Focus time and productivity stats" },
  { to: "/settings", label: "Settings", icon: Settings, desc: "App preferences and data" },
];

export default function MorePage() {
  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc]">
      <div className="px-5 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">More</h1>
      </div>
      <div className="flex-1 px-5 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {LINKS.map(({ to, label, icon: Icon, desc }, i) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#eaf1ff] flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-[#1463ff]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
