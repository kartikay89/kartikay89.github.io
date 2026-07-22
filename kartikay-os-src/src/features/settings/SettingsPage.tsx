import { useState, useEffect } from "react";
import { db, getSettings, saveSettings } from "@/db/database";
import { DEFAULT_SETTINGS } from "@/data/seed";
import type { AppSettings } from "@/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Download, Upload, Trash2, HardDrive } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
          checked ? "bg-[#1463ff]" : "bg-gray-200"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )} />
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-20 px-2 py-1 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => { if (s) setSettings(s); });
  }, []);

  const update = (changes: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...changes }));
  };

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const tasks = await db.tasks.toArray();
    const notes = await db.notes.toArray();
    const areas = await db.lifeAreas.toArray();
    const data = { tasks, notes, areas, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kartikay-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (!window.confirm("This will delete ALL your tasks, notes, and settings. Are you sure?")) return;
    await Promise.all([db.tasks.clear(), db.notes.clear(), db.pomodoroSessions.clear(), db.captureItems.clear()]);
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Button variant="primary" size="md" onClick={handleSave}>
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 max-w-2xl">
        <Section title="General">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Display Name</label>
            <input
              value={settings.displayName}
              onChange={(e) => update({ displayName: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Default Landing Page</label>
            <select
              value={settings.defaultLandingPage}
              onChange={(e) => update({ defaultLandingPage: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="tasks">Tasks</option>
              <option value="notes">Notes</option>
            </select>
          </div>
          <ToggleRow
            label="24-Hour Clock"
            checked={settings.use24Hour}
            onChange={(v) => update({ use24Hour: v })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">First Day of Week</label>
            <select
              value={settings.firstDayOfWeek}
              onChange={(e) => update({ firstDayOfWeek: Number(e.target.value) as 0 | 1 })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
            </select>
          </div>
        </Section>

        <Section title="Pomodoro">
          <NumberField
            label="Work Duration (minutes)"
            value={settings.pomodoroDuration / 60}
            onChange={(v) => update({ pomodoroDuration: v * 60 })}
            min={1} max={120}
          />
          <NumberField
            label="Short Break (minutes)"
            value={settings.shortBreakDuration / 60}
            onChange={(v) => update({ shortBreakDuration: v * 60 })}
            min={1} max={30}
          />
          <NumberField
            label="Long Break (minutes)"
            value={settings.longBreakDuration / 60}
            onChange={(v) => update({ longBreakDuration: v * 60 })}
            min={5} max={60}
          />
          <NumberField
            label="Sessions Before Long Break"
            value={settings.sessionsBeforeLongBreak}
            onChange={(v) => update({ sessionsBeforeLongBreak: v })}
            min={1} max={10}
          />
          <ToggleRow
            label="Auto-start Break"
            desc="Automatically start break when Pomodoro ends"
            checked={settings.autoStartBreak}
            onChange={(v) => update({ autoStartBreak: v })}
          />
          <ToggleRow
            label="Notification Sound"
            checked={settings.notificationSound}
            onChange={(v) => update({ notificationSound: v })}
          />
        </Section>

        <Section title="Tasks">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Default Priority</label>
            <select
              value={settings.defaultPriority}
              onChange={(e) => update({ defaultPriority: e.target.value as AppSettings["defaultPriority"] })}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <NumberField
            label="Default Pomodoro Goal"
            value={settings.defaultPomodoroGoal}
            onChange={(v) => update({ defaultPomodoroGoal: v })}
            min={1} max={20}
          />
        </Section>

        <Section title="Appearance">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Theme</label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => update({ colorMode: mode })}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-xl border transition-colors",
                    settings.colorMode === mode
                      ? "border-[#1463ff] bg-[#eaf1ff] text-[#1463ff]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Data & Storage">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <HardDrive size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Local Storage</p>
              <p className="text-xs text-gray-400">Data stored in IndexedDB (browser local storage)</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="md" onClick={handleExport} className="justify-start">
              <Download size={15} /> Export Data (JSON)
            </Button>
            <Button variant="secondary" size="md" className="justify-start">
              <Upload size={15} /> Import Data
            </Button>
            <Button variant="destructive" size="md" onClick={handleClearData} className="justify-start mt-2">
              <Trash2 size={15} /> Clear All Data
            </Button>
          </div>
        </Section>

        <Section title="PWA — Install App">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-semibold text-blue-900 mb-1">Install Kartikay OS</p>
            <p className="text-xs text-blue-600">
              Install this app on your device for offline access and a native-like experience.
              Click the install button in your browser's address bar, or look for "Add to Home Screen" in your browser menu.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
