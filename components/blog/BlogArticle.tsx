"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Eye, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import type { JSONContent } from "@tiptap/react";
import type { SerializedBlogPost } from "./BlogPostCard";
import { estimateReadTime } from "./BlogPostCard";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogArticle({ post }: { post: SerializedBlogPost }) {
  const readTime = estimateReadTime(post.content);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-24 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {post.cover_image && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-medium text-primary border-primary/20 bg-primary/10"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(post.published_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
            {post.view_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} views
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post.content ? (
            <MinimalTiptapEditor
              value={post.content as JSONContent}
              output="json"
              editable={false}
              hideToolbar={true}
              className="border-none p-0"
              editorContentClassName="p-0"
            />
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
