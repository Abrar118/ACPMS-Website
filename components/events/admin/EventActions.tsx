"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  deleteEventAction,
  toggleEventStatusAction,
} from "@/actions/events";
import type { EventRow } from "@/queries/events";
// import { DeleteEventDialog } from "./DeleteEventDialog";

interface EventActionsProps {
  event: EventRow;
}

export function EventActions({ event }: EventActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStatusToggle = () => {
    startTransition(async () => {
      const newStatus = !event.is_published;

      const result = await toggleEventStatusAction(event.id, newStatus);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const result = await deleteEventAction(event.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to delete event");
      }
      setIsDeleteDialogOpen(false);
    });
  };

  const handleViewEvent = () => {
    if (event.poster_url) {
      window.open(event.poster_url, "_blank");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(event.id)}>
            Copy event ID
          </DropdownMenuItem>

          {event.poster_url && (
            <DropdownMenuItem onClick={handleViewEvent}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Poster
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleStatusToggle}>
            {event.is_published ? "Unpublish" : "Publish"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <DeleteEventDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
        eventTitle={event.title}
      /> */}
    </>
  );
}
