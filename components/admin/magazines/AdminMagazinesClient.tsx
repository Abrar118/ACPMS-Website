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
import {
  Search,
  Plus,
  MoreHorizontal,
  BookOpen,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  createMagazineAction,
  updateMagazineAction,
  deleteMagazineAction,
  toggleMagazinePublishedAction,
} from "@/actions/magazines";
import type { Magazine } from "@/lib/db/magazines";

const magazineFormSchema = z.object({
  title: z.string().min(2, "Title required"),
  summary: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pdf_url: z.string().optional(),
  cover_image: z.string().optional(),
  published_date: z.string().optional(),
  language: z.string(),
  doi: z.string().optional(),
  access_level: z.enum(["public", "restricted", "members_only"]),
  chief_patron: z.string().optional(),
  tags: z.string().optional(),
});

type MagazineFormValues = z.infer<typeof magazineFormSchema>;

interface AdminMagazinesClientProps {
  magazines: Magazine[];
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
        <h2 className="text-lg font-semibold mb-2">Archive Magazine</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to archive this magazine? It will be hidden from public view.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Archiving..." : "Archive"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MagazineRow({
  magazine,
  onEdit,
  onTogglePublished,
  onDelete,
}: {
  magazine: Magazine;
  onEdit: (magazine: Magazine) => void;
  onTogglePublished: (magazine: Magazine) => void;
  onDelete: (magazine: Magazine) => void;
}) {
  const volumeIssue =
    magazine.volume != null && magazine.issue != null
      ? `Vol. ${magazine.volume}, Issue ${magazine.issue}`
      : magazine.volume != null
      ? `Vol. ${magazine.volume}`
      : magazine.issue != null
      ? `Issue ${magazine.issue}`
      : "—";

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[260px]">
        <div className="font-medium truncate">{magazine.title}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{volumeIssue}</TableCell>
      <TableCell>
        <Badge
          variant={magazine.is_published ? "default" : "secondary"}
          className={magazine.is_published ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          {magazine.is_published ? "Published" : "Draft"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{magazine.language ?? "English"}</TableCell>
      <TableCell className="text-sm">{magazine.download_count ?? 0}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {magazine.created_at
          ? new Date(magazine.created_at).toLocaleDateString()
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
            <DropdownMenuItem onClick={() => onEdit(magazine)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublished(magazine)}>
              {magazine.is_published ? (
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
              onClick={() => onDelete(magazine)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function AdminMagazinesClient({ magazines }: AdminMagazinesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Magazine | null>(null);
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<MagazineFormValues>({
    resolver: zodResolver(magazineFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      volume: "",
      issue: "",
      pdf_url: "",
      cover_image: "",
      published_date: "",
      language: "English",
      doi: "",
      access_level: "public",
      chief_patron: "",
      tags: "",
    },
  });

  const filteredMagazines = useMemo(() => {
    if (!searchTerm) return magazines;
    const term = searchTerm.toLowerCase();
    return magazines.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        (m.summary ?? "").toLowerCase().includes(term)
    );
  }, [magazines, searchTerm]);

  const openCreateDialog = () => {
    setEditingMagazine(null);
    form.reset({
      title: "",
      summary: "",
      volume: "",
      issue: "",
      pdf_url: "",
      cover_image: "",
      published_date: "",
      language: "English",
      doi: "",
      access_level: "public",
      chief_patron: "",
      tags: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (magazine: Magazine) => {
    setEditingMagazine(magazine);
    form.reset({
      title: magazine.title,
      summary: magazine.summary ?? "",
      volume: magazine.volume != null ? String(magazine.volume) : "",
      issue: magazine.issue != null ? String(magazine.issue) : "",
      pdf_url: magazine.pdf_url ?? "",
      cover_image: magazine.cover_image ?? "",
      published_date: magazine.published_date
        ? new Date(magazine.published_date).toISOString().slice(0, 10)
        : "",
      language: magazine.language ?? "English",
      doi: magazine.doi ?? "",
      access_level:
        (magazine.access_level as "public" | "restricted" | "members_only") ?? "public",
      chief_patron: magazine.chief_patron ?? "",
      tags: Array.isArray(magazine.tags) ? (magazine.tags as string[]).join(", ") : "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingMagazine(null);
    form.reset();
  };

  const handleSubmit = (values: MagazineFormValues) => {
    startTransition(async () => {
      const tagsArray = values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const volumeNum = values.volume ? parseInt(values.volume, 10) : undefined;
      const issueNum = values.issue ? parseInt(values.issue, 10) : undefined;

      const data = {
        title: values.title,
        summary: values.summary || undefined,
        volume: volumeNum && !isNaN(volumeNum) ? volumeNum : undefined,
        issue: issueNum && !isNaN(issueNum) ? issueNum : undefined,
        pdf_url: values.pdf_url || undefined,
        cover_image: values.cover_image || undefined,
        published_date: values.published_date || undefined,
        language: values.language,
        doi: values.doi || undefined,
        access_level: values.access_level,
        chief_patron: values.chief_patron || undefined,
        tags: tagsArray,
      };

      const result = editingMagazine
        ? await updateMagazineAction(editingMagazine.id, data)
        : await createMagazineAction(data);

      if (result.success) {
        toast.success(result.message);
        closeDialog();
      } else {
        toast.error(result.error || "Failed to save magazine");
      }
    });
  };

  const handleTogglePublished = (magazine: Magazine) => {
    startTransition(async () => {
      const result = await toggleMagazinePublishedAction(magazine.id, !magazine.is_published);
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to update magazine status");
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteMagazineAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to archive magazine");
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Magazines</CardTitle>
              <CardDescription>
                Manage magazines ({filteredMagazines.length} of {magazines.length})
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Magazine
            </Button>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search magazines..."
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
                <TableHead>Volume/Issue</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMagazines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        {searchTerm
                          ? "No magazines match your search"
                          : "No magazines yet"}
                      </p>
                      {!searchTerm && (
                        <Button className="mt-4" onClick={openCreateDialog}>
                          Create your first magazine
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMagazines.map((magazine) => (
                  <MagazineRow
                    key={magazine.id}
                    magazine={magazine}
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
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMagazine ? "Edit Magazine" : "New Magazine"}
            </DialogTitle>
            <DialogDescription>
              {editingMagazine
                ? "Update the magazine details below."
                : "Fill in the details to create a new magazine."}
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
                      <Input placeholder="Magazine title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief summary..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pdf_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                name="published_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOI (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="10.xxxx/xxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="access_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                        <SelectItem value="members_only">Members Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chief_patron"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Patron (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of chief patron" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated, optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. calculus, geometry, algebra" {...field} />
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
                    ? editingMagazine
                      ? "Saving..."
                      : "Creating..."
                    : editingMagazine
                    ? "Save Changes"
                    : "Create Magazine"}
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
