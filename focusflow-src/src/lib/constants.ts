export const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
  low: 3,
};

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  important: "Important",
  normal: "Normal",
  low: "Low",
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "text-red-600 bg-red-50 border-red-200",
  important: "text-orange-600 bg-orange-50 border-orange-200",
  normal: "text-slate-600 bg-slate-50 border-slate-200",
  low: "text-green-600 bg-green-50 border-green-200",
};

export const AREA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  work: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  business: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  learning: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  health: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  personal: { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  finance: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  projects: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  inbox: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
};
