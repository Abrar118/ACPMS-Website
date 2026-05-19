"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import BlogPostCard, { type SerializedBlogPost } from "./BlogPostCard";
import FeaturedPost from "./FeaturedPost";

export default function BlogClient({ posts }: { posts: SerializedBlogPost[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [posts, activeTag, searchTerm]);

  const featuredPost = filteredPosts.find((p) => p.is_featured) ?? null;
  const remainingPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Blog"
          subtitle="Math articles, problem discussions & club updates"
          align="center"
        />

        <div className="mt-8 mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all text-sm"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !activeTag
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/[0.15]"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/[0.15]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No blog posts yet</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {featuredPost && <FeaturedPost post={featuredPost} />}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post, i) => (
                  <BlogPostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
