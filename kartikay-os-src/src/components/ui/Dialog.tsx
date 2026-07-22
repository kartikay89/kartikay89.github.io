import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

interface DialogContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
}

export function DialogContent({ children, title, description, className, onClose }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 mx-4",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "focus:outline-none",
          className
        )}
        onEscapeKeyDown={onClose}
        onInteractOutside={onClose}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <RadixDialog.Title className="text-base font-semibold text-gray-900">{title}</RadixDialog.Title>
            )}
            {description && (
              <RadixDialog.Description className="sr-only">{description}</RadixDialog.Description>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
