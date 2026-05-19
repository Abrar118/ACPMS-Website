# Content Admin Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin CRUD interfaces for blog, announcements, gallery, contact submissions, and magazines — enabling content management for all new domain tables.

**Architecture:** Each admin page follows the established pattern: server component page with sidebar header + breadcrumb → Suspense wrapping an async data-fetching component → client component with Card/Table/Dialog for CRUD. Blog gets dedicated create/edit pages for the TipTap editor. All other domains use table + dialog. Server actions are already implemented — this plan only creates the UI layer.

**Tech Stack:** Next.js 15 (App Router), shadcn/ui (Card, Table, Dialog, Form, Badge, Button, DropdownMenu), React Hook Form + Zod, TipTap, Sonner, Lucide icons

**Spec:** `docs/superpowers/specs/2026-05-19-content-admin-pages-design.md`

**No test framework** configured. Verification uses `npm run build` and manual browser testing.

---

## File Structure

### New files
| File | Purpose |
|---|---|
| `app/admin/blog/page.tsx` | Blog listing server page |
| `app/admin/blog/new/page.tsx` | Create blog post server page |
| `app/admin/blog/[id]/edit/page.tsx` | Edit blog post server page |
| `components/admin/blog/AdminBlogClient.tsx` | Blog listing table + actions |
| `components/admin/blog/BlogEditor.tsx` | Shared TipTap editor form (create + edit) |
| `app/admin/announcements/page.tsx` | Announcements listing server page |
| `components/admin/announcements/AdminAnnouncementsClient.tsx` | Table + create/edit dialog |
| `app/admin/gallery/page.tsx` | Gallery listing server page |
| `components/admin/gallery/AdminGalleryClient.tsx` | Table + dialog with image management |
| `app/admin/contact/page.tsx` | Contact submissions server page |
| `components/admin/contact/AdminContactClient.tsx` | Read-only table + view/status dialog |
| `components/admin/magazines/AdminMagazinesClient.tsx` | Magazines table + create/edit dialog |

### Modified files
| File | Changes |
|---|---|
| `components/admin/AdminSidebar.tsx` | Add Blog, Announcements, Gallery, Contact, Magazines nav items |
| `app/admin/magazines/page.tsx` | Replace hardcoded content with real data fetching |

---

## Task 1: Update Admin Sidebar

**Files:**
- Modify: `components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Add new icon imports**

In `components/admin/AdminSidebar.tsx`, update the lucide-react import (line 26-39) to add new icons:

```typescript
import {
  Users,
  Calendar,
  BookOpen,
  FolderOpen,
  Settings,
  Home,
  LogOut,
  Shield,
  BarChart3,
  UserPlus,
  UserCheck,
  UserX,
  FileText,
  Megaphone,
  ImageIcon,
  MessageSquare,
} from "lucide-react";
```

- [ ] **Step 2: Replace the managementItems array**

Replace the `managementItems` array (lines 65-126) with:

```typescript
const managementItems = [
  {
    title: "Content",
    items: [
      {
        title: "Blog Posts",
        url: "/admin/blog",
        icon: FileText,
      },
      {
        title: "Announcements",
        url: "/admin/announcements",
        icon: Megaphone,
      },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: ImageIcon,
      },
    ],
  },
  {
    title: "Members",
    items: [
      {
        title: "All Members",
        url: "/admin/members",
        icon: Users,
      },
      {
        title: "Add Member",
        url: "/admin/members/add",
        icon: UserPlus,
      },
      {
        title: "Pending Approval",
        url: "/admin/members/pending",
        icon: UserCheck,
      },
      {
        title: "Inactive Members",
        url: "/admin/members/inactive",
        icon: UserX,
      },
    ],
  },
  {
    title: "Events",
    items: [
      {
        title: "All Events",
        url: "/admin/events",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Magazines",
    items: [
      {
        title: "All Magazines",
        url: "/admin/magazines",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "All Resources",
        url: "/admin/resources",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Communications",
    items: [
      {
        title: "Contact Submissions",
        url: "/admin/contact",
        icon: MessageSquare,
      },
    ],
  },
];
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add components/admin/AdminSidebar.tsx
git commit -m "feat: add Blog, Announcements, Gallery, Contact, Magazines to admin sidebar"
```

---

## Task 2: Blog Admin Listing Page

**Files:**
- Create: `components/admin/blog/AdminBlogClient.tsx`
- Create: `app/admin/blog/page.tsx`

- [ ] **Step 1: Create `components/admin/blog/AdminBlogClient.tsx`**

```tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, FileText, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { updateBlogPostAction, deleteBlogPostAction } from "@/actions/blog";
import type { BlogPost } from "@/lib/db/blog-posts";

interface AdminBlogClientProps {
  posts: BlogPost[];
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
        <h2 className="text-lg font-semibold mb-2">Delete Blog Post</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
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

function BlogRow({
  post,
  onTogglePublish,
  onDelete,
}: {
  post: BlogPost;
  onTogglePublish: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium max-w-[300px]">
        <div className="font-medium truncate">{post.title}</div>
        <div className="text-sm text-muted-foreground truncate">{post.slug}</div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">+{post.tags.length - 3}</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={post.is_published ? "default" : "secondary"}>
          {post.is_published ? "Published" : "Draft"}
        </Badge>
        {post.is_featured && (
          <Badge variant="outline" className="ml-1 text-xs">Featured</Badge>
        )}
      </TableCell>
      <TableCell>{post.view_count}</TableCell>
      <TableCell>
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString()
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/blog/${post.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublish(post)}>
              {post.is_published ? (
                <><EyeOff className="mr-2 h-4 w-4" />Unpublish</>
              ) : (
                <><Eye className="mr-2 h-4 w-4" />Publish</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(post)}
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

export default function AdminBlogClient({ posts }: AdminBlogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    const term = searchTerm.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
    );
  }, [posts, searchTerm]);

  const handleTogglePublish = (post: BlogPost) => {
    startTransition(async () => {
      const result = await updateBlogPostAction(post.id, {
        is_published: !post.is_published,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to update post");
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteBlogPostAction(deleteTarget.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.error || "Failed to delete post");
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>
                Manage blog posts ({filteredPosts.length} of {posts.length})
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
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
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        {searchTerm ? "No posts match your search" : "No blog posts yet"}
                      </p>
                      {!searchTerm && (
                        <Button asChild className="mt-4">
                          <Link href="/admin/blog/new">Create your first post</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <BlogRow
                    key={post.id}
                    post={post}
                    onTogglePublish={handleTogglePublish}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </>
  );
}
```

- [ ] **Step 2: Create `app/admin/blog/page.tsx`**

```tsx
import { Suspense } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAllBlogPosts } from "@/lib/db/blog-posts";
import AdminBlogClient from "@/components/admin/blog/AdminBlogClient";

async function BlogTable() {
  const posts = await getAllBlogPosts();
  return <AdminBlogClient posts={JSON.parse(JSON.stringify(posts))} />;
}

export default function AdminBlogPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Blog Posts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <Suspense fallback={<div>Loading blog posts...</div>}>
            <BlogTable />
          </Suspense>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: `/admin/blog` in route list

- [ ] **Step 4: Commit**

```bash
git add components/admin/blog/AdminBlogClient.tsx app/admin/blog/page.tsx
git commit -m "feat: add blog admin listing page with search and actions"
```

---

## Task 3: Blog Editor Component

**Files:**
- Create: `components/admin/blog/BlogEditor.tsx`

- [ ] **Step 1: Create `components/admin/blog/BlogEditor.tsx`**

```tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBlogPostSchema } from "@/lib/validations";
import { createBlogPostAction, updateBlogPostAction } from "@/actions/blog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import type { BlogPost } from "@/lib/db/blog-posts";

type FormData = z.infer<typeof createBlogPostSchema>;

interface BlogEditorProps {
  post?: BlogPost;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tiptapContent, setTiptapContent] = useState<JSONContent | undefined>(
    post?.content as JSONContent | undefined
  );

  const isEditing = !!post;

  const form = useForm<FormData>({
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      cover_image: post?.cover_image ?? "",
      tags: post?.tags ?? [],
      is_published: post?.is_published ?? false,
      is_featured: post?.is_featured ?? false,
    },
  });

  const titleValue = form.watch("title");

  useEffect(() => {
    if (!isEditing && titleValue) {
      form.setValue("slug", generateSlug(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isEditing, form]);

  function handleSubmit(publish: boolean) {
    const values = form.getValues();
    const data: FormData = {
      ...values,
      is_published: publish,
      content: tiptapContent,
      tags: typeof values.tags === "string"
        ? (values.tags as unknown as string).split(",").map((t: string) => t.trim()).filter(Boolean)
        : values.tags,
    };

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateBlogPostAction(post.id, data)
          : await createBlogPostAction(data);

        if (result.success) {
          toast.success(result.message);
          router.push("/admin/blog");
        } else {
          toast.error(result.error || "Failed to save post");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing && post.is_published ? "Unpublish & Save" : "Save as Draft"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isEditing && post.is_published ? "Save" : "Publish"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Post" : "New Post"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="post-url-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <MinimalTiptapEditor
                  value={tiptapContent}
                  onChange={setTiptapContent}
                  className="min-h-[400px] w-full"
                  editorContentClassName="p-5"
                  output="json"
                  placeholder="Write your post content..."
                  autofocus={false}
                  editable={true}
                  editorClassName="focus:outline-hidden"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary (max 300 chars)"
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
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
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value ?? ""} />
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
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="algebra, geometry, olympiad"
                          value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Featured Post</FormLabel>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -10`

- [ ] **Step 3: Commit**

```bash
git add components/admin/blog/BlogEditor.tsx
git commit -m "feat: add blog editor component with TipTap"
```

---

## Task 4: Blog Create and Edit Pages

**Files:**
- Create: `app/admin/blog/new/page.tsx`
- Create: `app/admin/blog/[id]/edit/page.tsx`

- [ ] **Step 1: Create `app/admin/blog/new/page.tsx`**

```tsx
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import BlogEditor from "@/components/admin/blog/BlogEditor";

export default function NewBlogPostPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/blog">Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Post</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <BlogEditor />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `app/admin/blog/[id]/edit/page.tsx`**

```tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBlogPostById } from "@/lib/db/blog-posts";
import BlogEditor from "@/components/admin/blog/BlogEditor";

async function EditBlogPost({ postId }: { postId: string }) {
  const post = await getBlogPostById(postId);
  if (!post) notFound();
  return <BlogEditor post={JSON.parse(JSON.stringify(post))} />;
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/blog">Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Post</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<div>Loading post...</div>}>
          <EditBlogPost postId={id} />
        </Suspense>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: `/admin/blog/new` and `/admin/blog/[id]/edit` in route list

- [ ] **Step 4: Commit**

```bash
git add app/admin/blog/
git commit -m "feat: add blog create and edit admin pages"
```

---

## Task 5: Announcements Admin

**Files:**
- Create: `components/admin/announcements/AdminAnnouncementsClient.tsx`
- Create: `app/admin/announcements/page.tsx`

- [ ] **Step 1: Create `components/admin/announcements/AdminAnnouncementsClient.tsx`**

This is a self-contained client component with table + create/edit dialog. Full implementation following the resources admin pattern, adapted for announcements fields (title, body, priority, pinned, expires_at).

The subagent should create this file following the exact pattern from `AdminBlogClient.tsx` (Task 2) but with these differences:
- Uses `Dialog` from shadcn for create/edit (not a dedicated page)
- Table columns: Title, Priority (badge), Pinned (icon), Active (toggle), Expires At, Actions
- Dialog fields: Title (Input), Body (Textarea), Priority (Select: low/normal/urgent), Pinned (Checkbox), Expires At (datetime-local Input)
- Imports: `createAnnouncementAction`, `updateAnnouncementAction`, `deleteAnnouncementAction` from `@/actions/announcements`
- Imports: `type Announcement` from `@/lib/db/announcements`
- Priority badge colors: urgent=destructive, normal=default, low=secondary
- Active toggle calls `updateAnnouncementAction(id, { is_active: !current })`

- [ ] **Step 2: Create `app/admin/announcements/page.tsx`**

Same pattern as `app/admin/blog/page.tsx` but:
- Fetches `getAllAnnouncements()` from `@/lib/db/announcements`
- Passes to `AdminAnnouncementsClient`
- Breadcrumb: Admin > Announcements

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add components/admin/announcements/ app/admin/announcements/
git commit -m "feat: add announcements admin page with CRUD dialog"
```

---

## Task 6: Gallery Admin

**Files:**
- Create: `components/admin/gallery/AdminGalleryClient.tsx`
- Create: `app/admin/gallery/page.tsx`

- [ ] **Step 1: Create `components/admin/gallery/AdminGalleryClient.tsx`**

Table + dialog following the same pattern, with image management in the edit dialog. The subagent should create this following the resources/announcements admin pattern with these specifics:
- Table columns: Title, Cover (small thumbnail via `next/image`), Photos (count from `images.length`), Published (toggle), Created, Actions
- Dialog fields: Title (Input), Description (Textarea), Cover Image URL (Input), Event (Select from published events — pass events list as prop), Published (Checkbox), Display Order (number Input)
- **Image management section** (only in edit mode, below the form): Grid of image thumbnails with delete X button each. "Add Image" sub-form: Image URL (Input) + Caption (Input) + Add (Button). Uses `addImageAction` and `deleteImageAction` from `@/actions/gallery`.
- Imports: `createAlbumAction`, `updateAlbumAction`, `deleteAlbumAction`, `addImageAction`, `deleteImageAction` from `@/actions/gallery`
- Imports: `type AlbumWithImages` from `@/lib/db/gallery`

- [ ] **Step 2: Create `app/admin/gallery/page.tsx`**

Same server page pattern:
- Fetches `getAllAlbums()` from `@/lib/db/gallery` AND `getPublishedEvents()` from `@/lib/db/events` (for the event selector)
- Passes both to `AdminGalleryClient`
- Breadcrumb: Admin > Gallery

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add components/admin/gallery/ app/admin/gallery/
git commit -m "feat: add gallery admin page with album CRUD and image management"
```

---

## Task 7: Contact Submissions Admin

**Files:**
- Create: `components/admin/contact/AdminContactClient.tsx`
- Create: `app/admin/contact/page.tsx`

- [ ] **Step 1: Create `components/admin/contact/AdminContactClient.tsx`**

Read-only table with view dialog and status actions. Specifics:
- Table columns: Name, Email, Subject, Status (badge: new=blue via `bg-blue-500`, read=yellow via `bg-yellow-500`, replied=green via `bg-green-500`, archived=secondary), Submitted At, Actions
- **No create/edit** — submissions are read-only
- View dialog (shadcn Dialog): Shows full name, email, subject header, full message body, submitted date, current status badge, action buttons
- Status action buttons in dialog: "Mark Read" (if new), "Mark Replied" (if read), "Archive" (if replied), "Delete" (always, with confirmation)
- Imports: `updateContactStatusAction`, `markContactAsRepliedAction`, `deleteContactSubmissionAction` from `@/actions/contact`
- Imports: `type ContactSubmission` from `@/lib/db/contact`

- [ ] **Step 2: Create `app/admin/contact/page.tsx`**

Same server page pattern:
- Fetches `getAllContactSubmissions()` from `@/lib/db/contact`
- Passes to `AdminContactClient`
- Breadcrumb: Admin > Contact Submissions

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add components/admin/contact/ app/admin/contact/
git commit -m "feat: add contact submissions admin page with status management"
```

---

## Task 8: Magazines Admin (Fix Existing)

**Files:**
- Create: `components/admin/magazines/AdminMagazinesClient.tsx`
- Modify: `app/admin/magazines/page.tsx`

- [ ] **Step 1: Create `components/admin/magazines/AdminMagazinesClient.tsx`**

Table + dialog following the same pattern. Specifics:
- Table columns: Title, Volume/Issue (formatted "Vol. N, Issue N"), Published (toggle), Language, Downloads, Created, Actions
- Dialog fields: Title (Input), Summary (Textarea), Volume (number Input), Issue (number Input), PDF URL (Input), Cover Image URL (Input), Published Date (date Input), Language (Input, default "English"), DOI (Input), Access Level (Select: public/restricted/members_only), Chief Patron (Input), Tags (comma-separated Input)
- Published toggle calls `toggleMagazinePublishedAction(id, !current)` from `@/actions/magazines`
- Delete is soft delete (archive) via `deleteMagazineAction(id)`
- Imports: `createMagazineAction`, `updateMagazineAction`, `deleteMagazineAction`, `toggleMagazinePublishedAction` from `@/actions/magazines`
- Imports: `type Magazine` from `@/lib/db/magazines`

- [ ] **Step 2: Replace `app/admin/magazines/page.tsx`**

Replace the entire file (currently has hardcoded mock data) with:

```tsx
import { Suspense } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAllMagazines } from "@/lib/db/magazines";
import AdminMagazinesClient from "@/components/admin/magazines/AdminMagazinesClient";

async function MagazinesTable() {
  const magazines = await getAllMagazines();
  return <AdminMagazinesClient magazines={JSON.parse(JSON.stringify(magazines))} />;
}

export default function AdminMagazines() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Magazines</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <Suspense fallback={<div>Loading magazines...</div>}>
            <MagazinesTable />
          </Suspense>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add components/admin/magazines/ app/admin/magazines/page.tsx
git commit -m "feat: replace placeholder magazines admin with functional CRUD"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run full build**

Run: `npm run build 2>&1 | tail -35`
Expected: All admin routes present:
- `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]/edit`
- `/admin/announcements`
- `/admin/gallery`
- `/admin/contact`
- `/admin/magazines` (updated)

- [ ] **Step 2: Manual verification with dev server**

Run: `npm run dev`
Verify:
- Admin sidebar shows Content group (Blog, Announcements, Gallery) and Communications (Contact)
- `/admin/blog` shows table or empty state
- `/admin/blog/new` shows TipTap editor form
- `/admin/announcements` shows table with create dialog
- `/admin/gallery` shows table with create dialog
- `/admin/contact` shows table with view dialog
- `/admin/magazines` shows real data (not mock)

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification — content admin pages complete"
```

---

## Summary

| Task | What | Files |
|---|---|---|
| 1 | Admin sidebar update | `AdminSidebar.tsx` |
| 2 | Blog listing page | `AdminBlogClient.tsx`, `app/admin/blog/page.tsx` |
| 3 | Blog editor component | `BlogEditor.tsx` |
| 4 | Blog create/edit pages | `app/admin/blog/new/page.tsx`, `app/admin/blog/[id]/edit/page.tsx` |
| 5 | Announcements admin | `AdminAnnouncementsClient.tsx`, `app/admin/announcements/page.tsx` |
| 6 | Gallery admin | `AdminGalleryClient.tsx`, `app/admin/gallery/page.tsx` |
| 7 | Contact admin | `AdminContactClient.tsx`, `app/admin/contact/page.tsx` |
| 8 | Magazines admin (fix) | `AdminMagazinesClient.tsx`, `app/admin/magazines/page.tsx` |
| 9 | Final verification | — |
