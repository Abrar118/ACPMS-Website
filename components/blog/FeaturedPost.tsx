"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, Eye, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { SerializedBlogPost } from "./BlogPostCard";
import { estimateReadTime } from "./BlogPostCard";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FeaturedPost({ post }: { post: SerializedBlogPost }) {
  const readTime = estimateReadTime(post.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/blog/${post.slug}`}>
        <GlassCard className="overflow-hidden group cursor-pointer">
          <div className="grid md:grid-cols-[2fr_1fr] gap-0">
            {post.cover_image ? (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="h-64 md:h-80 bg-gradient-to-br from-primary/30 to-primary/5" />
            )}
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                  Featured
                </span>
              </div>
              {post.tags.length > 0 && (
                <Badge
                  variant="outline"
                  className="mb-3 w-fit text-xs font-medium text-primary border-primary/20 bg-primary/10"
                >
                  {post.tags[0]}
                </Badge>
              )}
              <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
