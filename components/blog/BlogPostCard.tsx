"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, Eye } from "lucide-react";
import { motion } from "framer-motion";

export type SerializedBlogPost = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function estimateReadTime(content: unknown): number {
  if (!content) return 1;
  const text = JSON.stringify(content);
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPostCard({
  post,
  index = 0,
}: {
  post: SerializedBlogPost;
  index?: number;
}) {
  const readTime = estimateReadTime(post.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/blog/${post.slug}`}>
        <GlassCard className="overflow-hidden group cursor-pointer h-full">
          {post.cover_image ? (
            <div className="relative h-48 overflow-hidden">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="p-5">
            {post.tags.length > 0 && (
              <Badge
                variant="outline"
                className="mb-2 text-xs font-medium text-primary border-primary/20 bg-primary/10"
              >
                {post.tags[0]}
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatDate(post.published_at)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readTime} min read
              </span>
              {post.view_count > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.view_count}
                </span>
              )}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
