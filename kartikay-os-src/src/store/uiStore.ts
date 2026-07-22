import { create } from "zustand";

export interface UiStore {
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  showNewTask: boolean;
  setShowNewTask: (v: boolean) => void;

  showQuickCapture: boolean;
  setShowQuickCapture: (v: boolean) => void;

  filterAreaId: string | null;
  setFilterAreaId: (id: string | null) => void;

  filterPriority: string | null;
  setFilterPriority: (p: string | null) => void;

  filterStatus: string | null;
  setFilterStatus: (s: string | null) => void;

  noteSearch: string;
  setNoteSearch: (q: string) => void;

  taskSearch: string;
  setTaskSearch: (q: string) => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  urgentWarning: { targetTaskId: string } | null;
  setUrgentWarning: (w: { targetTaskId: string } | null) => void;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

let _toastId = 0;

export const useUiStore = create<UiStore>((set) => ({
  selectedTaskId: "task-1",
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  showNewTask: false,
  setShowNewTask: (v) => set({ showNewTask: v }),

  showQuickCapture: false,
  setShowQuickCapture: (v) => set({ showQuickCapture: v }),

  filterAreaId: null,
  setFilterAreaId: (id) => set({ filterAreaId: id }),

  filterPriority: null,
  setFilterPriority: (p) => set({ filterPriority: p }),

  filterStatus: null,
  setFilterStatus: (s) => set({ filterStatus: s }),

  noteSearch: "",
  setNoteSearch: (q) => set({ noteSearch: q }),

  taskSearch: "",
  setTaskSearch: (q) => set({ taskSearch: q }),

  toasts: [],
  addToast: (toast) => {
    const id = String(++_toastId);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  urgentWarning: null,
  setUrgentWarning: (w) => set({ urgentWarning: w }),
}));
