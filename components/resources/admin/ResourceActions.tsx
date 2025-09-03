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
  deleteResourceAction,
  toggleResourceStatus,
  toggleResourceFeatured,
} from "@/actions/resources";
import { EResourceStatus } from "@/components/shared/enums";
import type { ResourceRow } from "@/queries/resources";
import ViewerModal from "@/components/shared/ViewerModal";
import { DeleteResourceDialog } from "./DeleteResourceDialog";

interface ResourceActionsProps {
  resource: ResourceRow;
}

export function ResourceActions({ resource }: ResourceActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStatusToggle = () => {
    startTransition(async () => {
      const newStatus =
        resource.status === "Published"
          ? EResourceStatus.Pending
          : EResourceStatus.Published;

      const result = await toggleResourceStatus(resource.id, newStatus);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleFeaturedToggle = () => {
    startTransition(async () => {
      const result = await toggleResourceFeatured(
        resource.id,
        !resource.is_featured
      );

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to update featured status");
      }
    });
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const result = await deleteResourceAction(resource.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to delete resource");
      }
      setIsDeleteDialogOpen(false);
    });
  };

  const handleViewResource = () => {
    if (resource.resource_url) {
      setIsViewerOpen(true);
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

          <DropdownMenuItem
            onClick={handleViewResource}
            disabled={!resource.resource_url}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Resource
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleStatusToggle}>
            {resource.status === "Published" ? "Unpublish" : "Publish"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleFeaturedToggle}>
            {resource.is_featured ? "Remove from Featured" : "Mark as Featured"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            Delete Resource
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewerModal
        state={isViewerOpen}
        setState={setIsViewerOpen}
        link={resource.resource_url || ""}
      />

      <DeleteResourceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
      />
    </>
  );
}
