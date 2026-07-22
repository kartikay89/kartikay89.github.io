import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { db } from "@/db/database";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";
import type { CaptureType, Priority } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";

const TYPES: { id: CaptureType; label: string; emoji: string }[] = [
  { id: "task", label: "Task", emoji: "✅" },
  { id: "thought", label: "Thought", emoji: "💭" },
  { id: "idea", label: "Idea", emoji: "💡" },
  { id: "note", label: "Note", emoji: "📝" },
];

export function QuickCaptureDialog() {
  const { showQuickCapture, setShowQuickCapture, addToast } = useUiStore();
  const [text, setText] = useState("");
  const [type, setType] = useState<CaptureType>("thought");
  const [showMore, setShowMore] = useState(false);
  const [priority, setPriority] = useState<Priority>("normal");
  const [areaId, setAreaId] = useState("");
  const [saving, setSaving] = useState(false);

  const areas = useLiveQuery(() => db.lifeAreas.filter((a) => !a.archived && !a.deletedAt).toArray(), []) ?? [];

  if (!showQuickCapture) return null;

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await db.captureItems.add({
        id: nanoid(),
        userId: "local-user",
        text: text.trim(),
        type,
        areaId: areaId || undefined,
        priority,
        archived: false,
        createdAt: now(),
        updatedAt: now(),
        version: 1,
        syncStatus: "pending",
      });
      addToast({ title: "Saved to Inbox", variant: "success" });
      setText("");
      setType("thought");
      setShowMore(false);
      setShowQuickCapture(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl mx-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">What's on your mind?</h2>
            <button
              onClick={() => setShowQuickCapture(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Capture a thought, task, idea, or note..."
            className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[96px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
              if (e.key === "Escape") setShowQuickCapture(false);
            }}
          />

          {/* Type selector */}
          <div className="flex gap-2 mt-3">
            {TYPES.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => setType(id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-colors border",
                  type === id
                    ? "border-[#1463ff] bg-[#eaf1ff] text-[#1463ff]"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                <span className="text-base">{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          {/* More options */}
          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
          >
            <ChevronDown size={13} className={cn("transition-transform", showMore && "rotate-180")} />
            {showMore ? "Fewer options" : "More options"}
          </button>

          {showMore && (
            <div className="mt-3 flex flex-col gap-3 pb-1">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
                <div className="flex gap-2">
                  {(["urgent", "important", "normal", "low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex-1 py-1 text-xs font-medium rounded-lg border capitalize transition-colors",
                        priority === p ? "border-[#1463ff] bg-[#eaf1ff] text-[#1463ff]" : "border-gray-200 text-gray-500"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {areas.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Life Area</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="">No area (Inbox)</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowQuickCapture(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving} disabled={!text.trim()}>
              Save to Inbox
            </Button>
          </div>
          <p className="text-[10px] text-center text-gray-300 mt-2">⌘+Enter to save quickly</p>
        </div>
      </div>
    </div>
  );
}
