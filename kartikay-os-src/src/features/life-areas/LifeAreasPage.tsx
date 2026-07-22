import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { LifeAreaRepository } from "@/db/repositories/LifeAreaRepository";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AREA_ICON_COLORS } from "@/lib/areaColors";
import { formatDurationShort } from "@/lib/time";
import * as Icons from "lucide-react";
import { useState } from "react";
import type { LifeArea } from "@/types";

const COLORS = [
  "blue",
  "violet",
  "amber",
  "green",
  "cyan",
  "emerald",
  "orange",
  "gray",
];

const ICONS = [
  "Briefcase",
  "TrendingUp",
  "GraduationCap",
  "Heart",
  "User",
  "CircleDollarSign",
  "FolderOpen",
  "Inbox",
  "Rocket",
  "Code2",
  "Globe",
  "Zap",
];

function AreaIcon({ name, color }: { name: string; color: string }) {
  const Ic =
    (Icons as unknown as Record<string, React.ElementType>)[name] ??
    Icons.FolderOpen;
  const colors = AREA_ICON_COLORS[color] ?? AREA_ICON_COLORS.gray;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: colors.bg }}
    >
      <Ic size={20} style={{ color: colors.text }} />
    </div>
  );
}

export default function LifeAreasPage() {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");
  const [newIcon, setNewIcon] = useState("Briefcase");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const areas =
    useLiveQuery(
      () => db.lifeAreas.filter((a) => !a.deletedAt).toArray(),
      []
    ) ?? [];

  const tasks =
    useLiveQuery(
      () => db.tasks.filter((t) => !t.deletedAt).toArray(),
      []
    ) ?? [];

  const sessions =
    useLiveQuery(
      () =>
        db.pomodoroSessions
          .filter((s) => s.status === "completed")
          .toArray(),
      []
    ) ?? [];

  const getTaskCount = (areaId: string) =>
    tasks.filter((t) => t.areaId === areaId).length;

  const getCompletedCount = (areaId: string) =>
    tasks.filter((t) => t.areaId === areaId && t.status === "completed")
      .length;

  const getFocusSeconds = (areaId: string) => {
    const areaTaskIds = new Set(
      tasks.filter((t) => t.areaId === areaId).map((t) => t.id)
    );
    return sessions
      .filter((s) => areaTaskIds.has(s.taskId))
      .reduce((sum, s) => sum + s.actualFocusedSeconds, 0);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await LifeAreaRepository.create({
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      archived: false,
    });
    setShowNew(false);
    setNewName("");
    setNewColor("blue");
    setNewIcon("Briefcase");
  };

  const handleArchive = async (area: LifeArea) => {
    await LifeAreaRepository.update(area.id, { archived: !area.archived });
  };

  const handleStartEdit = (area: LifeArea) => {
    setEditingId(area.id);
    setEditName(area.name);
  };

  const handleSaveEdit = async (area: LifeArea) => {
    if (editName.trim()) {
      await LifeAreaRepository.update(area.id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const activeAreas = areas.filter((a) => !a.archived);
  const archivedAreas = areas.filter((a) => a.archived);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Life Areas</h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowNew(true)}
        >
          <Icons.Plus size={16} /> New Area
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Active areas grid */}
        {activeAreas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            <Icons.FolderOpen size={40} className="text-gray-200 mb-3" />
            No life areas yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeAreas.map((area) => (
              <div
                key={area.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="flex items-center gap-3">
                  <AreaIcon name={area.icon} color={area.color} />
                  <div className="flex-1 min-w-0">
                    {editingId === area.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(area);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full text-sm font-semibold text-gray-900 border-b border-[#1463ff] outline-none bg-transparent pb-0.5"
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {area.name}
                      </h3>
                    )}
                    <p className="text-xs text-gray-400">
                      {getTaskCount(area.id)} tasks
                    </p>
                  </div>
                  {editingId === area.id ? (
                    <button
                      onClick={() => handleSaveEdit(area)}
                      className="p-1.5 text-[#1463ff] hover:bg-[#eaf1ff] rounded-lg transition-colors"
                      aria-label="Save name"
                    >
                      <Icons.Check size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(area)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit area"
                    >
                      <Icons.Pencil size={13} />
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {getTaskCount(area.id)}
                    </p>
                    <p className="text-[10px] text-gray-400">Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {getCompletedCount(area.id)}
                    </p>
                    <p className="text-[10px] text-gray-400">Done</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1463ff]">
                      {formatDurationShort(getFocusSeconds(area.id))}
                    </p>
                    <p className="text-[10px] text-gray-400">Focus</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleArchive(area)}
                    className="flex-1 text-xs text-gray-400 hover:text-gray-600 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Archived section */}
        {archivedAreas.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Archived ({archivedAreas.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {archivedAreas.map((area) => (
                <div
                  key={area.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 opacity-60"
                >
                  <AreaIcon name={area.icon} color={area.color} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {area.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleArchive(area)}
                    className="text-xs text-[#1463ff] hover:underline flex-shrink-0"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── New area dialog ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">New Life Area</h3>
            <div className="flex flex-col gap-4">
              {/* Name */}
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Area name..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />

              {/* Color picker */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => {
                    const ic = AREA_ICON_COLORS[c];
                    return (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all",
                          newColor === c
                            ? "border-[#1463ff] scale-110"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ background: ic?.bg }}
                        aria-label={c}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((name) => {
                    const Ic =
                      (
                        Icons as unknown as Record<
                          string,
                          React.ElementType
                        >
                      )[name] ?? Icons.FolderOpen;
                    return (
                      <button
                        key={name}
                        onClick={() => setNewIcon(name)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                          newIcon === name
                            ? "border-[#1463ff] bg-[#eaf1ff]"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        aria-label={name}
                      >
                        <Ic
                          size={16}
                          className={
                            newIcon === name
                              ? "text-[#1463ff]"
                              : "text-gray-500"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowNew(false);
                  setNewName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreate}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
