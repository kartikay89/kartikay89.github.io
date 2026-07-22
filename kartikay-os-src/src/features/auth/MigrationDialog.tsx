import { useState } from "react";
import { MigrationService, type LocalDataSummary } from "@/db/sync/MigrationService";
import { Button } from "@/components/ui/Button";
import { CloudUpload, HardDrive, CheckCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  userId: string;
  summary: LocalDataSummary;
  onComplete: () => void;
}

export function MigrationDialog({ userId, summary, onComplete }: Props) {
  const [choice, setChoice] = useState<"import" | "cloud" | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);

  const handleConfirm = async () => {
    if (!choice) return;
    setLoading(true);
    try {
      if (choice === "import") {
        const r = await MigrationService.importLocalToCloud(userId);
        setResult(r);
      } else {
        await MigrationService.keepCloudData(userId);
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">
              {choice === "import" ? "Data imported!" : "Cloud data loaded!"}
            </h3>
            {result && (
              <p className="text-sm text-gray-500 mb-1">
                {result.imported} records synced
                {result.errors > 0 && `, ${result.errors} errors`}
              </p>
            )}
            <p className="text-sm text-gray-400 mb-5">Your data is now synced across devices.</p>
            <Button variant="primary" size="md" onClick={onComplete} className="w-full">
              Continue
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold text-gray-900 mb-1">Welcome back!</h2>
            <p className="text-sm text-gray-500 mb-5">
              You have local data on this device. What would you like to do?
            </p>

            {/* Local data summary */}
            <div className="bg-[#f8fafc] rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Local data found:</p>
              <p>• {summary.taskCount} tasks</p>
              <p>• {summary.noteCount} notes</p>
              <p>• {summary.areaCount} life areas</p>
              <p>• {summary.sessionCount} pomodoro sessions</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-5">
              <button
                onClick={() => setChoice("import")}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                  choice === "import"
                    ? "border-[#1463ff] bg-[#eaf1ff]"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <CloudUpload size={20} className={choice === "import" ? "text-[#1463ff]" : "text-gray-400"} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Import local data</p>
                  <p className="text-xs text-gray-400 mt-0.5">Upload all local tasks, notes, and areas to your account</p>
                </div>
              </button>

              <button
                onClick={() => setChoice("cloud")}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                  choice === "cloud"
                    ? "border-[#1463ff] bg-[#eaf1ff]"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <HardDrive size={20} className={choice === "cloud" ? "text-[#1463ff]" : "text-gray-400"} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Keep cloud data</p>
                  <p className="text-xs text-gray-400 mt-0.5">Download your existing account data and discard local-only records</p>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                disabled={!choice}
                loading={loading}
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
