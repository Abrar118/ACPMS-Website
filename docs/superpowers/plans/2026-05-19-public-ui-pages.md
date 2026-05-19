# Public UI Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public-facing Blog, Gallery, Contact pages, an Announcements banner on the landing page, and update the navbar — completing the user-facing side of the schema redesign.

**Architecture:** Server components fetch data from the Prisma query layer (`lib/db/`), serialize it via `JSON.parse(JSON.stringify())`, and pass it to client components for interactivity. All new pages follow the established events page pattern: async server component → Suspense boundary → client component with filtering/state.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui (GlassCard, Dialog, Form, Badge, Button), Framer Motion, TipTap (read-only rendering), React Hook Form + Zod, Sonner, Lucide icons

**Spec:** `docs/superpowers/specs/2026-05-19-public-ui-pages-design.md`

**No test framework** configured. Verification uses `npm run build` and manual browser testing via `npm run dev`.

---

## File Structure

### New files
| File | Purpose |
|---|---|
| `components/blog/BlogClient.tsx` | Client component: tag filters + featured hero + card grid |
| `components/blog/BlogPostCard.tsx` | Individual blog post card |
| `components/blog/FeaturedPost.tsx` | Large featured hero card |
| `components/blog/BlogArticle.tsx` | TipTap read-only article renderer |
| `app/blog/page.tsx` | Blog listing server component |
| `app/blog/[slug]/page.tsx` | Blog article server component |
| `components/gallery/GalleryClient.tsx` | Client wrapper for album grid |
| `components/gallery/AlbumCard.tsx` | Album cover card with overlay |
| `components/gallery/PhotoGrid.tsx` | Masonry photo grid + lightbox |
| `app/gallery/page.tsx` | Gallery listing server component |
| `app/gallery/[albumId]/page.tsx` | Album detail server component |
| `components/contact/ContactForm.tsx` | Form with React Hook Form + Zod |
| `components/contact/ClubInfo.tsx` | Club info sidebar card |
| `app/contact/page.tsx` | Contact page server component |
| `components/announcements/AnnouncementBanner.tsx` | Dismissible announcement bar |

### Modified files
| File | Changes |
|---|---|
| `components/shared/Navbar.tsx:74-79` | Add Blog, Gallery, Contact to navigationItems |
| `components/home/Footer.tsx:22-27` | Add Blog, Gallery, Contact to Quick Links |
| `app/page.tsx:1-43` | Import and render AnnouncementBanner above HeroSection |

---

## Task 1: Update Navbar and Footer

**Files:**
- Modify: `components/shared/Navbar.tsx:74-79`
- Modify: `components/home/Footer.tsx:22-27`

- [ ] **Step 1: Add new nav items to Navbar.tsx**

In `components/shared/Navbar.tsx`, replace the `navigationItems` array (lines 74-83):

```typescript
    const navigationItems = [
        { href: "/", label: "Home" },
        { href: "/events", label: "Events" },
        { href: "/blog", label: "Blog" },
        { href: "/resources", label: "Resources" },
        { href: "/gallery", label: "Gallery" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        ...(profile?.role === "admin" || profile?.role === "executive"
            ? [{ href: "/admin", label: "Admin" }]
            : []),
    ];
```

- [ ] **Step 2: Add new links to Footer.tsx**

In `components/home/Footer.tsx`, replace the Quick Links column (lines 22-27):

```tsx
                        <div className="space-y-3 flex flex-col">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                            <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Events</Link>
                            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                            <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
                            <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                        </div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/shared/Navbar.tsx components/home/Footer.tsx
git commit -m "feat: add Blog, Gallery, Contact to navbar and footer navigation"
```

---

## Task 2: Blog Post Card and Featured Post Components

**Files:**
- Create: `components/blog/BlogPostCard.tsx`
- Create: `components/blog/FeaturedPost.tsx`

- [ ] **Step 1: Create `components/blog/BlogPostCard.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `components/blog/FeaturedPost.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: No errors from blog components

- [ ] **Step 4: Commit**

```bash
git add components/blog/
git commit -m "feat: add BlogPostCard and FeaturedPost components"
```

---

## Task 3: Blog Client and Listing Page

**Files:**
- Create: `components/blog/BlogClient.tsx`
- Create: `app/blog/page.tsx`

- [ ] **Step 1: Create `components/blog/BlogClient.tsx`**

```tsx
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

  const featuredPost = filteredPosts.find((p) => p.is_featured) ?? filteredPosts[0];
  const remainingPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Blog"
          subtitle="Math articles, problem discussions & club updates"
          align="center"
        />

        {/* Search + Filters */}
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

        {/* Posts */}
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
```

- [ ] **Step 2: Create `app/blog/page.tsx`**

```tsx
import { Suspense } from "react";
import { getPublishedBlogPosts } from "@/lib/db/blog-posts";
import Footer from "@/components/home/Footer";
import BlogClient from "@/components/blog/BlogClient";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <BlogClient posts={JSON.parse(JSON.stringify(posts))} />
      </Suspense>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with `/blog` in the route list

- [ ] **Step 4: Commit**

```bash
git add components/blog/BlogClient.tsx app/blog/page.tsx
git commit -m "feat: add blog listing page with featured hero and card grid"
```

---

## Task 4: Blog Article Page

**Files:**
- Create: `components/blog/BlogArticle.tsx`
- Create: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Create `components/blog/BlogArticle.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/db/blog-posts";
import { incrementBlogPostViewCount } from "@/lib/db/blog-posts";
import Footer from "@/components/home/Footer";
import BlogArticle from "@/components/blog/BlogArticle";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.is_published) {
    notFound();
  }

  incrementBlogPostViewCount(post.id).catch(() => {});

  return (
    <main className="min-h-screen">
      <BlogArticle post={JSON.parse(JSON.stringify(post))} />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with `/blog/[slug]` in the route list

- [ ] **Step 4: Commit**

```bash
git add components/blog/BlogArticle.tsx app/blog/[slug]/page.tsx
git commit -m "feat: add blog article page with TipTap rendering"
```

---

## Task 5: Gallery Album Card and Client Components

**Files:**
- Create: `components/gallery/AlbumCard.tsx`
- Create: `components/gallery/GalleryClient.tsx`
- Create: `app/gallery/page.tsx`

- [ ] **Step 1: Create `components/gallery/AlbumCard.tsx`**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export type SerializedAlbum = {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  cover_image: string | null;
  is_published: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  images: SerializedGalleryImage[];
};

export type SerializedGalleryImage = {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
};

export default function AlbumCard({
  album,
  index = 0,
}: {
  album: SerializedAlbum;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/gallery/${album.id}`}>
        <div className="group relative rounded-2xl overflow-hidden border border-border dark:border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 cursor-pointer">
          <div className="relative h-56 md:h-64">
            {album.cover_image ? (
              <Image
                src={album.cover_image}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : album.images.length > 0 ? (
              <Image
                src={album.images[0].image_url}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-lg font-semibold text-white mb-1">{album.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">
                {album.images.length} {album.images.length === 1 ? "photo" : "photos"}
              </span>
              {album.event_id && (
                <Badge className="bg-white/20 text-white/90 border-white/20 text-xs">
                  Event
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create `components/gallery/GalleryClient.tsx`**

```tsx
"use client";

import { ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import AlbumCard, { type SerializedAlbum } from "./AlbumCard";

export default function GalleryClient({ albums }: { albums: SerializedAlbum[] }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Gallery"
          subtitle="Moments from our events & activities"
          align="center"
        />

        {albums.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No galleries yet</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `app/gallery/page.tsx`**

```tsx
import { Suspense } from "react";
import { getPublishedAlbums } from "@/lib/db/gallery";
import Footer from "@/components/home/Footer";
import GalleryClient from "@/components/gallery/GalleryClient";

export default async function GalleryPage() {
  const albums = await getPublishedAlbums();

  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <GalleryClient albums={JSON.parse(JSON.stringify(albums))} />
      </Suspense>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with `/gallery` in the route list

- [ ] **Step 5: Commit**

```bash
git add components/gallery/ app/gallery/page.tsx
git commit -m "feat: add gallery listing page with album cards"
```

---

## Task 6: Gallery Album Detail Page with Lightbox

**Files:**
- Create: `components/gallery/PhotoGrid.tsx`
- Create: `app/gallery/[albumId]/page.tsx`

- [ ] **Step 1: Create `components/gallery/PhotoGrid.tsx`**

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SerializedGalleryImage } from "./AlbumCard";

export default function PhotoGrid({ images }: { images: SerializedGalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, goNext, goPrev]);

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((image, i) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => openLightbox(i)}
          >
            <div className="relative rounded-xl overflow-hidden border border-border dark:border-white/[0.08] hover:border-white/[0.15] transition-all">
              <Image
                src={image.image_url}
                alt={image.caption || "Gallery photo"}
                width={600}
                height={400}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm text-white">{image.caption}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/95 overflow-hidden">
          {lightboxIndex !== null && (
            <div className="relative flex items-center justify-center h-[90vh]">
              <Image
                src={images[lightboxIndex].image_url}
                alt={images[lightboxIndex].caption || "Gallery photo"}
                fill
                className="object-contain"
                priority
              />

              {/* Controls */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>

              {/* Caption + Counter */}
              <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                {images[lightboxIndex].caption && (
                  <p className="text-white text-sm mb-2">{images[lightboxIndex].caption}</p>
                )}
                <p className="text-white/60 text-xs">
                  {lightboxIndex + 1} of {images.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Create `app/gallery/[albumId]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbumById } from "@/lib/db/gallery";
import { ArrowLeft, ImageIcon } from "lucide-react";
import Footer from "@/components/home/Footer";
import PhotoGrid from "@/components/gallery/PhotoGrid";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getAlbumById(albumId);

  if (!album || !album.is_published) {
    notFound();
  }

  const serializedImages = JSON.parse(JSON.stringify(album.images));

  return (
    <main className="min-h-screen">
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {album.title}
            </h1>
            {album.description && (
              <p className="text-muted-foreground text-lg mb-2">{album.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>
                {album.images.length} {album.images.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>

          {album.images.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No photos in this album yet</p>
            </div>
          ) : (
            <PhotoGrid images={serializedImages} />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with `/gallery/[albumId]` in the route list

- [ ] **Step 4: Commit**

```bash
git add components/gallery/PhotoGrid.tsx app/gallery/[albumId]/page.tsx
git commit -m "feat: add gallery album detail page with lightbox viewer"
```

---

## Task 7: Contact Page

**Files:**
- Create: `components/contact/ContactForm.tsx`
- Create: `components/contact/ClubInfo.tsx`
- Create: `app/contact/page.tsx`

- [ ] **Step 1: Create `components/contact/ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactSubmissionSchema } from "@/lib/validations";
import { submitContactFormAction } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type FormData = z.infer<typeof contactSubmissionSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(contactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: FormData) {
    const result = await submitContactFormAction(data);

    if (result.success) {
      setIsSubmitted(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000);
    } else {
      toast.error(result.error || "Failed to send message");
    }
  }

  const inputClass =
    "bg-white/[0.04] border-white/[0.08] rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50";

  if (isSubmitted) {
    return (
      <GlassCard className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Message Sent!
          </h3>
          <p className="text-muted-foreground mb-6">
            We&apos;ll get back to you as soon as possible.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (!cooldown) {
                setIsSubmitted(false);
                form.reset();
              }
            }}
            disabled={cooldown}
            className="bg-white/[0.04] border-white/[0.08] text-foreground hover:bg-white/[0.08] rounded-xl"
          >
            {cooldown ? "Please wait..." : "Send Another Message"}
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      className={inputClass}
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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-foreground">Subject</FormLabel>
                <FormControl>
                  <Input placeholder="What's this about?" className={inputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-foreground">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 w-full md:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Create `components/contact/ClubInfo.tsx`**

```tsx
import { GlassCard } from "@/components/ui/glass-card";
import { MapPin, Mail, Facebook, Globe } from "lucide-react";

export default function ClubInfo() {
  return (
    <GlassCard className="p-8 h-fit">
      <h2 className="text-2xl font-bold text-foreground mb-6">Club Information</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
            Club Name
          </h3>
          <p className="text-muted-foreground">
            Adamjee Cantonment Public School
            <br />
            Club of Mathematics (ACPSCM)
          </p>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Address</h3>
            <p className="text-sm text-muted-foreground">
              Adamjee Cantonment Public School
              <br />
              Dhaka Cantonment, Dhaka, Bangladesh
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Email</h3>
            <a
              href="mailto:contact@acpscm.com"
              className="text-sm text-primary hover:underline"
            >
              contact@acpscm.com
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
            Follow Us
          </h3>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Website"
              className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-white/[0.15] transition-all"
            >
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 3: Create `app/contact/page.tsx`**

```tsx
import { SectionHeader } from "@/components/ui/section-header";
import Footer from "@/components/home/Footer";
import ContactForm from "@/components/contact/ContactForm";
import ClubInfo from "@/components/contact/ClubInfo";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Get In Touch"
            subtitle="Have a question or want to get involved? We'd love to hear from you."
            align="center"
          />
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mt-10">
            <ContactForm />
            <ClubInfo />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with `/contact` in the route list

- [ ] **Step 5: Commit**

```bash
git add components/contact/ app/contact/page.tsx
git commit -m "feat: add contact page with form and club info"
```

---

## Task 8: Announcements Banner on Landing Page

**Files:**
- Create: `components/announcements/AnnouncementBanner.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/announcements/AnnouncementBanner.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SerializedAnnouncement = {
  id: string;
  title: string;
  body: string;
  priority: string;
  is_pinned: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-600 text-white",
  normal: "bg-primary text-primary-foreground",
  low: "bg-secondary text-secondary-foreground",
};

export default function AnnouncementBanner({
  announcement,
}: {
  announcement: SerializedAnnouncement | null;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!announcement) return;
    const key = `announcement-dismissed-${announcement.id}`;
    const wasDismissed = sessionStorage.getItem(key);
    setDismissed(!!wasDismissed);
  }, [announcement]);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`announcement-dismissed-${announcement.id}`, "true");
    setDismissed(true);
  };

  const style = priorityStyles[announcement.priority] || priorityStyles.normal;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`${style} relative z-40`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
          {announcement.priority === "urgent" && (
            <Megaphone className="h-4 w-4 shrink-0" />
          )}
          <p className="text-sm font-medium text-center">
            {announcement.title}
          </p>
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx` to include the announcements banner**

Replace the entire file with:

```tsx
import HeroSection from "@/components/home/HeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import WhatWeDo from "@/components/home/WhatWeDo";
import EventCountdown from "@/components/home/EventCountdown";
import WhoWeAre from "@/components/home/WhoWeAre";
import ClientTestimonials from "@/components/home/ClientTestimonials";
import Footer from "@/components/home/Footer";
import ClubHighlights from "@/components/home/ClubHighlights";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { getHighlights, getClubStats, getNextOrLatestEvent } from "@/lib/db/events";
import { getActiveAnnouncements } from "@/lib/db/announcements";

export default async function Home() {
    const [highlights, stats, featuredEvent, announcements] = await Promise.all([
        getHighlights(),
        getClubStats(),
        getNextOrLatestEvent(),
        getActiveAnnouncements(),
    ]);

    const topAnnouncement = announcements.length > 0 ? announcements[0] : null;

    return (
        <main className="min-h-screen">
            <AnnouncementBanner
                announcement={
                    topAnnouncement
                        ? JSON.parse(JSON.stringify(topAnnouncement))
                        : null
                }
            />
            <HeroSection />
            <StatsCounter
                stats={[
                    { label: "Club Members", value: stats.memberCount, suffix: "+" },
                    { label: "Events Hosted", value: stats.eventCount, suffix: "+" },
                    { label: "Competitions", value: stats.competitionCount, suffix: "+" },
                    { label: "Resources", value: stats.resourceCount, suffix: "+" },
                ]}
            />
            <WhatWeDo />
            <EventCountdown
                nextEvent={
                    featuredEvent
                        ? JSON.parse(JSON.stringify(featuredEvent))
                        : null
                }
            />
            <WhoWeAre />
            <ClubHighlights highlights={highlights ? JSON.parse(JSON.stringify(highlights)) : null} />
            <ClientTestimonials />
            <Footer />
        </main>
    );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/announcements/AnnouncementBanner.tsx app/page.tsx
git commit -m "feat: add announcements banner to landing page"
```

---

## Task 9: Final Verification

**Files:**
- None new — verification only

- [ ] **Step 1: Run full build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds. Route list should include:
- `/blog`
- `/blog/[slug]`
- `/gallery`
- `/gallery/[albumId]`
- `/contact`

- [ ] **Step 2: Start dev server and manually verify**

Run: `npm run dev`
Open in browser and verify:
- Navbar shows: Home, Events, Blog, Resources, Gallery, About, Contact
- `/blog` shows empty state or posts if any exist
- `/gallery` shows empty state or albums if any exist
- `/contact` shows form + club info
- Landing page shows announcement banner (if any active announcements exist)
- Footer links work for all new pages

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification — public UI pages complete"
```

---

## Summary

| Task | What | Files |
|---|---|---|
| 1 | Navbar + Footer navigation update | `Navbar.tsx`, `Footer.tsx` |
| 2 | Blog card + featured post components | `BlogPostCard.tsx`, `FeaturedPost.tsx` |
| 3 | Blog listing page | `BlogClient.tsx`, `app/blog/page.tsx` |
| 4 | Blog article page | `BlogArticle.tsx`, `app/blog/[slug]/page.tsx` |
| 5 | Gallery listing page | `AlbumCard.tsx`, `GalleryClient.tsx`, `app/gallery/page.tsx` |
| 6 | Gallery album detail + lightbox | `PhotoGrid.tsx`, `app/gallery/[albumId]/page.tsx` |
| 7 | Contact page | `ContactForm.tsx`, `ClubInfo.tsx`, `app/contact/page.tsx` |
| 8 | Announcements banner | `AnnouncementBanner.tsx`, `app/page.tsx` |
| 9 | Final verification | — |
