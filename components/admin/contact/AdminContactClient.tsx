"use client";

import { useState, useMemo, useTransition } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  MessageSquare,
  Eye,
  Trash2,
  Mail,
  CheckCheck,
  Archive,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateContactStatusAction,
  markContactAsRepliedAction,
  deleteContactSubmissionAction,
} from "@/actions/contact";
import type { ContactSubmission } from "@/lib/db/contact";

interface AdminContactClientProps {
  submissions: ContactSubmission[];
}

function statusBadge(status: string) {
  switch (status) {
    case "new":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white capitalize">
          New
        </Badge>
      );
    case "read":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white capitalize">
          Read
        </Badge>
      );
    case "replied":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white capitalize">
          Replied
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="secondary" className="capitalize">
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="capitalize">
          {status}
        </Badge>
      );
  }
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
        <h2 className="text-lg font-semibold mb-2">Delete Submission</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete this contact submission? This action
          cannot be undone.
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

function ContactRow({
  submission,
  onView,
  onDelete,
}: {
  submission: ContactSubmission;
  onView: (submission: ContactSubmission) => void;
  onDelete: (submission: ContactSubmission) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{submission.name}</TableCell>
      <TableCell className="text-muted-foreground">{submission.email}</TableCell>
      <TableCell className="max-w-[200px]">
        <span className="truncate block">{submission.subject}</span>
      </TableCell>
      <TableCell>{statusBadge(submission.status)}</TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(submission.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
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
            <DropdownMenuItem onClick={() => onView(submission)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(submission)}
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

export default function AdminContactClient({
  submissions,
}: AdminContactClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [viewingSubmission, setViewingSubmission] =
    useState<ContactSubmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(
    null
  );

  const filteredSubmissions = useMemo(() => {
    if (!searchTerm) return submissions;
    const term = searchTerm.toLowerCase();
    return submissions.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.subject.toLowerCase().includes(term)
    );
  }, [submissions, searchTerm]);

  const handleMarkRead = (submission: ContactSubmission) => {
    startTransition(async () => {
      const result = await updateContactStatusAction(submission.id, "read");
      if (result.success) {
        toast.success(result.message ?? "Marked as read");
        setViewingSubmission(null);
      } else {
        toast.error(result.error ?? "Failed to update status");
      }
    });
  };

  const handleMarkReplied = (submission: ContactSubmission) => {
    startTransition(async () => {
      const result = await markContactAsRepliedAction(submission.id);
      if (result.success) {
        toast.success(result.message ?? "Marked as replied");
        setViewingSubmission(null);
      } else {
        toast.error(result.error ?? "Failed to mark as replied");
      }
    });
  };

  const handleArchive = (submission: ContactSubmission) => {
    startTransition(async () => {
      const result = await updateContactStatusAction(submission.id, "archived");
      if (result.success) {
        toast.success(result.message ?? "Archived");
        setViewingSubmission(null);
      } else {
        toast.error(result.error ?? "Failed to archive");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteContactSubmissionAction(deleteTarget.id);
      if (result.success) {
        toast.success(result.message ?? "Submission deleted");
        if (viewingSubmission?.id === deleteTarget.id) {
          setViewingSubmission(null);
        }
      } else {
        toast.error(result.error ?? "Failed to delete submission");
      }
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Submissions</CardTitle>
              <CardDescription>
                Manage contact form submissions ({filteredSubmissions.length} of{" "}
                {submissions.length})
              </CardDescription>
            </div>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or subject..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        {searchTerm
                          ? "No submissions match your search"
                          : "No contact submissions yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <ContactRow
                    key={submission.id}
                    submission={submission}
                    onView={setViewingSubmission}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog
        open={!!viewingSubmission}
        onOpenChange={(open) => !open && setViewingSubmission(null)}
      >
        {viewingSubmission && (
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle className="flex flex-col gap-1">
                <span>{viewingSubmission.subject}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  From{" "}
                  <span className="font-medium text-foreground">
                    {viewingSubmission.name}
                  </span>{" "}
                  &mdash;{" "}
                  <a
                    href={`mailto:${viewingSubmission.email}`}
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    {viewingSubmission.email}
                  </a>
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="rounded-md border bg-muted/40 p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {viewingSubmission.message}
            </div>

            <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                {statusBadge(viewingSubmission.status)}
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {viewingSubmission.status === "new" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkRead(viewingSubmission)}
                    disabled={isPending}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Mark Read
                  </Button>
                )}
                {viewingSubmission.status === "read" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkReplied(viewingSubmission)}
                    disabled={isPending}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark Replied
                  </Button>
                )}
                {viewingSubmission.status === "replied" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchive(viewingSubmission)}
                    disabled={isPending}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    window.open(
                      `mailto:${viewingSubmission.email}?subject=Re: ${encodeURIComponent(viewingSubmission.subject)}`
                    );
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Reply via Email
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
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
