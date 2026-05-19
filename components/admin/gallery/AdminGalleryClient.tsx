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
import {
  Search,
  Plus,
  MoreHorizontal,
  ImageIcon,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAlbumAction,
  updateAlbumAction,
  deleteAlbumAction,
  addImageAction,
  deleteImageAction,
} from "@/actions/gallery";
import type { GalleryAlbum, GalleryImage } from "@/lib/db/gallery";
import type { Event } from "@/lib/db/events";

export type AlbumWithImages = GalleryAlbum & { images: GalleryImage[] };

const albumFormSchema = z.object({
  title: z.string().min(2, "Title required"),
  description: z.string().optional(),
  cover_image: z.string().optional(),
  event_id: z.string().optional(),
  is_published: z.boolean(),
  display_order: z.number().int(),
});

type AlbumFormValues = z.infer<typeof albumFormSchema>;

interface AdminGalleryClientProps {
  albums: AlbumWithImages[];
  events: Event[];
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
        <h2 className="text-lg font-semibold mb-2">Delete Album</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete this album? This action cannot be undone.
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

function AlbumRow({
  album,
  onEdit,
  onTogglePublished,
  onDelete,
}: {
  album: AlbumWithImages;
  onEdit: (album: AlbumWithImages) => void;
  onTogglePublished: (album: AlbumWithImages) => void;
  onDelete: (album: AlbumWithImages) => void;
}) {
  const coverSrc = album.cover_image ?? album.images[0]?.image_url ?? null;

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[200px]">
        <div className="font-medium truncate">{album.title}</div>
      </TableCell>
      <TableCell>
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt={album.title}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell>{album.images.length}</TableCell>
      <TableCell>
        <Badge
          variant={album.is_published ? "default" : "secondary"}
          className={album.is_published ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          {album.is_published ? "Published" : "Draft"}
        </Badge>
      </TableCell>
      <TableCell>
        {album.created_at
          ? new Date(album.created_at).toLocaleDateString()
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
            <DropdownMenuItem onClick={() => onEdit(album)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublished(album)}>
              {album.is_published ? (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(album)}
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

export default function AdminGalleryClient({
  albums,
  events,
}: AdminGalleryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AlbumWithImages | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<AlbumWithImages | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Image management sub-form state
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [isImagePending, startImageTransition] = useTransition();

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      description: "",
      cover_image: "",
      event_id: "",
      is_published: false,
      display_order: 0,
    },
  });

  const filteredAlbums = useMemo(() => {
    if (!searchTerm) return albums;
    const term = searchTerm.toLowerCase();
    return albums.filter((a) => a.title.toLowerCase().includes(term));
  }, [albums, searchTerm]);

  const openCreateDialog = () => {
    setEditingAlbum(null);
    form.reset({
      title: "",
      description: "",
      cover_image: "",
      event_id: "",
      is_published: false,
      display_order: 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (album: AlbumWithImages) => {
    setEditingAlbum(album);
    form.reset({
      title: album.title,
      description: album.description ?? "",
      cover_image: album.cover_image ?? "",
      event_id: album.event_id ?? "",
      is_published: album.is_published,
      display_order: album.display_order ?? 0,
    });
    setNewImageUrl("");
    setNewImageCaption("");
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAlbum(null);
    form.reset();
    setNewImageUrl("");
    setNewImageCaption("");
  };

  const handleSubmit = (values: AlbumFormValues) => {
    startTransition(async () => {
      const data = {
        title: values.title,
        description: values.description || undefined,
        cover_image: values.cover_image || undefined,
        event_id: values.event_id || undefined,
        is_published: values.is_published ?? false,
        display_order: Number(values.display_order) || 0,
      };

      const result = editingAlbum
        ? await updateAlbumAction(editingAlbum.id, data)
        : await createAlbumAction(data);

      if (result.success) {
        toast.success(result.message);
        closeDialog();
      } else {
        toast.error(result.error || "Failed to save album");
      }
    });
  };

  const handleTogglePublished = (album: AlbumWithImages) => {
    startTransition(async () => {
      const result = await updateAlbumAction(album.id, {
        is_published: !album.is_published,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to update album");
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteAlbumAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to delete album");
      setDeleteTarget(null);
    });
  };

  const handleAddImage = () => {
    if (!editingAlbum || !newImageUrl.trim()) return;
    startImageTransition(async () => {
      const result = await addImageAction({
        album_id: editingAlbum.id,
        image_url: newImageUrl.trim(),
        caption: newImageCaption.trim() || undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setNewImageUrl("");
        setNewImageCaption("");
      } else {
        toast.error(result.error || "Failed to add image");
      }
    });
  };

  const handleDeleteImage = (imageId: string) => {
    startImageTransition(async () => {
      const result = await deleteImageAction(imageId);
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to delete image");
    });
  };

  // Find the current album's images in case they were updated (use editingAlbum from albums prop)
  const currentAlbumImages =
    editingAlbum
      ? (albums.find((a) => a.id === editingAlbum.id)?.images ?? editingAlbum.images)
      : [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>
                Manage photo albums ({filteredAlbums.length} of {albums.length})
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Album
            </Button>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search albums..."
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
                <TableHead>Cover</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlbums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        {searchTerm
                          ? "No albums match your search"
                          : "No gallery albums yet"}
                      </p>
                      {!searchTerm && (
                        <Button className="mt-4" onClick={openCreateDialog}>
                          Create your first album
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlbums.map((album) => (
                  <AlbumRow
                    key={album.id}
                    album={album}
                    onEdit={openEditDialog}
                    onTogglePublished={handleTogglePublished}
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
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlbum ? "Edit Album" : "New Album"}
            </DialogTitle>
            <DialogDescription>
              {editingAlbum
                ? "Update the album details below."
                : "Fill in the details to create a new album."}
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
                      <Input placeholder="Album title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Album description..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event (optional)</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Published
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
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
                    ? editingAlbum
                      ? "Saving..."
                      : "Creating..."
                    : editingAlbum
                    ? "Save Changes"
                    : "Create Album"}
                </Button>
              </DialogFooter>
            </form>
          </Form>

          {/* Image Management — edit mode only */}
          {editingAlbum && (
            <div className="mt-6 space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Images ({currentAlbumImages.length})
                </p>
              </div>

              {currentAlbumImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentAlbumImages.map((image) => (
                    <div key={image.id} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image_url}
                        alt={image.caption ?? ""}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <button
                        type="button"
                        disabled={isImagePending}
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image sub-form */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Add Image
                </p>
                <Input
                  placeholder="Image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  disabled={isImagePending}
                />
                <Input
                  placeholder="Caption (optional)"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  disabled={isImagePending}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddImage}
                  disabled={isImagePending || !newImageUrl.trim()}
                >
                  {isImagePending ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          )}
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
