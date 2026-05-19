"use client";

import { useState, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  MoreHorizontal,
  Megaphone,
  Pencil,
  Trash2,
  Pin,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
} from "@/actions/announcements";
import type { Announcement } from "@/lib/db/announcements";

const announcementFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  priority: z.enum(["low", "normal", "urgent"]),
  is_pinned: z.boolean(),
  expires_at: z.string().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AdminAnnouncementsClientProps {
  announcements: Announcement[];
}

function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-background rounded-lg border shadow-lg w-full max-w-md p-6 animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">Delete Announcement</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete this announcement? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnnouncementRow({
  announcement,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onToggleActive: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}) {
  const priorityVariant = {
    urgent: "destructive" as const,
    normal: "default" as const,
    low: "secondary" as const,
  }[announcement.priority] ?? ("default" as const);

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[280px]">
        <div className="font-medium truncate">{announcement.title}</div>
      </TableCell>
      <TableCell>
        <Badge variant={priorityVariant} className="capitalize">
          {announcement.priority}
        </Badge>
      </TableCell>
      <TableCell>
        {announcement.is_pinned && (
          <Pin className="h-4 w-4 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={announcement.is_active ? "default" : "secondary"}
          className={announcement.is_active ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          {announcement.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        {announcement.expires_at
          ? new Date(announcement.expires_at).toLocaleDateString()
          : "—"}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(announcement)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(announcement)}>
              {announcement.is_active ? (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(announcement)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function AdminAnnouncementsClient({
  announcements,
}: AdminAnnouncementsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      body: "",
      priority: "normal",
      is_pinned: false,
      expires_at: "",
    },
  });

  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm) return announcements;
    const term = searchTerm.toLowerCase();
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.body.toLowerCase().includes(term)
    );
  }, [announcements, searchTerm]);

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    form.reset({
      title: "",
      body: "",
      priority: "normal",
      is_pinned: false,
      expires_at: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    form.reset({
      title: announcement.title,
      body: announcement.body,
      priority: (announcement.priority as "low" | "normal" | "urgent") ?? "normal",
      is_pinned: announcement.is_pinned,
      expires_at: announcement.expires_at
        ? new Date(announcement.expires_at).toISOString().slice(0, 16)
        : "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
    form.reset();
  };

  const handleSubmit = (values: AnnouncementFormValues) => {
    startTransition(async () => {
      const data = {
        title: values.title,
        body: values.body,
        priority: values.priority,
        is_pinned: values.is_pinned,
        expires_at: values.expires_at || undefined,
      };

      const result = editingAnnouncement
        ? await updateAnnouncementAction(editingAnnouncement.id, data)
        : await createAnnouncementAction(data);

      if (result.success) {
        toast.success(result.message);
        closeDialog();
      } else {
        toast.error(result.error || "Failed to save announcement");
      }
    });
  };

  const handleToggleActive = (announcement: Announcement) => {
    startTransition(async () => {
      const result = await updateAnnouncementAction(announcement.id, {
        is_active: !announcement.is_active,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to update announcement");
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteAnnouncementAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to delete announcement");
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                Manage announcements ({filteredAnnouncements.length} of{" "}
                {announcements.length})
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Pinned</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        {searchTerm
                          ? "No announcements match your search"
                          : "No announcements yet"}
                      </p>
                      {!searchTerm && (
                        <Button className="mt-4" onClick={openCreateDialog}>
                          Create your first announcement
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <AnnouncementRow
                    key={announcement.id}
                    announcement={announcement}
                    onEdit={openEditDialog}
                    onToggleActive={handleToggleActive}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update the announcement details below."
                : "Fill in the details to create a new announcement."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Announcement title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Announcement body..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_pinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Pin this announcement
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At (optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? editingAnnouncement
                      ? "Saving..."
                      : "Creating..."
                    : editingAnnouncement
                    ? "Save Changes"
                    : "Create Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </>
  );
}
