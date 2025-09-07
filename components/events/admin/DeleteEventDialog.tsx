"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  eventTitle?: string;
}

export function DeleteEventDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  eventTitle
}: DeleteEventDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "bg-background rounded-lg border shadow-lg w-full max-w-md p-6",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex flex-col gap-3 text-center sm:text-left mb-6">
          <h2 className="text-lg font-semibold leading-tight">
            Delete Event
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed break-words text-wrap">
            Are you sure you want to delete {eventTitle ? `"${eventTitle}"` : "this event"}? This action cannot be undone.
          </p>
        </div>

        {/* Dialog Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
