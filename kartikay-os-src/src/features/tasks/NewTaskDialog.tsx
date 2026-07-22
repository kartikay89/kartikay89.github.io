import { useState } from "react";
import { X } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { db } from "@/db/database";
import { Button } from "@/components/ui/Button";
import { nanoid } from "@/lib/nanoid";
import { now } from "@/lib/time";
import type { Priority, TaskStatus } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";

export function NewTaskDialog() {
  const { showNewTask, setShowNewTask, addToast } = useUiStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [scheduledDate, setScheduledDate] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [pomodoroGoal, setPomodoroGoal] = useState(2);
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const areas = useLiveQuery(() => db.lifeAreas.filter((a) => !a.archived && !a.deletedAt).toArray(), []) ?? [];

  if (!showNewTask) return null;

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setAreaId("");
    setPriority("normal");
    setScheduledDate("");
    setPlannedStart("");
    setPlannedEnd("");
    setNotes("");
    setTags("");
    setShowNewTask(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const task = {
        id: nanoid(),
        userId: "local-user",
        title: title.trim(),
        description: description || undefined,
        areaId: areaId || (areas[0]?.id ?? "area-inbox"),
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status,
        priority,
        scheduledDate: scheduledDate || undefined,
        plannedStart: plannedStart || undefined,
        plannedEnd: plannedEnd || undefined,
        pomodoroGoal,
        completedPomodoros: 0,
        focusedSeconds: 0,
        notes,
        createdAt: now(),
        updatedAt: now(),
        version: 1,
        syncStatus: "pending" as const,
      };
      await db.tasks.add(task);
      addToast({ title: "Task created", variant: "success" });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const PRIORITY_OPTS: { value: Priority; label: string; cls: string }[] = [
    { value: "urgent", label: "Urgent", cls: "border-red-300 bg-red-50 text-red-600" },
    { value: "important", label: "Important", cls: "border-orange-300 bg-orange-50 text-orange-600" },
    { value: "normal", label: "Normal", cls: "border-gray-300 bg-gray-50 text-gray-600" },
    { value: "low", label: "Low", cls: "border-green-300 bg-green-50 text-green-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl mx-auto max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">New Task</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Title */}
          <div className="mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title *"
              className="w-full text-base font-medium border-none outline-none text-gray-900 placeholder:text-gray-300"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }}
            />
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full text-sm text-gray-600 placeholder:text-gray-300 border-none outline-none resize-none mb-4 min-h-[56px]"
          />

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {/* Life area */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Life Area</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select area...</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Priority</label>
              <div className="flex gap-2 flex-1">
                {PRIORITY_OPTS.map(({ value, label, cls }) => (
                  <button
                    key={value}
                    onClick={() => setPriority(value)}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${priority === value ? cls : "border-gray-200 text-gray-400"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Time</label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={plannedStart}
                  onChange={(e) => setPlannedStart(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                />
                <span className="text-gray-400 text-xs">–</span>
                <input
                  type="time"
                  value={plannedEnd}
                  onChange={(e) => setPlannedEnd(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Pomodoro goal */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Pomodoro Goal</label>
              <input
                type="number"
                value={pomodoroGoal}
                onChange={(e) => setPomodoroGoal(Number(e.target.value))}
                min={0}
                max={20}
                className="w-20 text-sm border border-gray-200 rounded-xl px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma, separated, tags"
                className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div className="flex items-start gap-3">
              <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 pt-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none resize-none min-h-[60px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving} disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </div>
    </div>
  );
}
