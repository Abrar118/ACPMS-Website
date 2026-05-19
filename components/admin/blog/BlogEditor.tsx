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
import type { Content, JSONContent } from "@tiptap/react";
import type { BlogPost, CreateBlogPostData } from "@/lib/db/blog-posts";

// Use the input type (with optional fields due to .default()) so zodResolver matches
type FormValues = z.input<typeof createBlogPostSchema>;

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
  const [tiptapContent, setTiptapContent] = useState<JSONContent>(
    (post?.content as JSONContent) ?? { type: "doc", content: [{ type: "paragraph" }] }
  );

  const isEditing = !!post;

  const form = useForm<FormValues>({
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
    const safeContent = tiptapContent ? JSON.parse(JSON.stringify(tiptapContent)) : undefined;
    const data: CreateBlogPostData = {
      title: values.title,
      slug: values.slug,
      is_published: publish,
      is_featured: values.is_featured ?? false,
      content: safeContent,
      excerpt: values.excerpt || undefined,
      cover_image: values.cover_image || undefined,
      tags: typeof values.tags === "string"
        ? (values.tags as unknown as string).split(",").map((t: string) => t.trim()).filter(Boolean)
        : (values.tags ?? []),
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
                  onChange={(value: Content) => {
                    if (value) setTiptapContent(value as JSONContent);
                  }}
                  className="min-h-[400px] w-full border rounded-md"
                  editorContentClassName="p-5 min-h-[350px]"
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
                          value={Array.isArray(field.value) ? field.value.join(", ") : (field.value ?? "")}
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
                          checked={field.value ?? false}
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
