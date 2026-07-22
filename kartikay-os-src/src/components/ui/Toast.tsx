import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/cn";

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={cn(
            "flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium",
            "animate-in slide-in-from-right-4 fade-in-0",
            t.variant === "success" && "bg-green-50 border-green-200 text-green-800",
            t.variant === "destructive" && "bg-red-50 border-red-200 text-red-800",
            (!t.variant || t.variant === "default") && "bg-white border-gray-200 text-gray-800"
          )}
        >
          {t.variant === "success" ? <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> :
           t.variant === "destructive" ? <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" /> :
           <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p>{t.title}</p>
            {t.description && <p className="text-xs opacity-70 mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-current opacity-40 hover:opacity-70 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
