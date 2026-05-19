import prisma from "@/lib/prisma";
import { Prisma, type BlogPost } from "@/lib/generated/prisma";

export type { BlogPost };

export interface CreateBlogPostData {
  title: string;
  slug: string;
  content?: unknown;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  is_published?: boolean;
  is_featured?: boolean;
}

export async function createBlogPost(
  userId: string,
  data: CreateBlogPostData
): Promise<BlogPost> {
  const now = new Date();
  return prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: (data.content as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      excerpt: data.excerpt ?? null,
      cover_image: data.cover_image ?? null,
      tags: data.tags ?? [],
      is_published: data.is_published ?? false,
      is_featured: data.is_featured ?? false,
      published_at: data.is_published ? now : null,
      view_count: 0,
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    where: { is_published: true },
    orderBy: { published_at: "desc" },
  });
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    where: { is_published: true, is_featured: true },
    orderBy: { published_at: "desc" },
  });
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getBlogPostById(postId: string): Promise<BlogPost | null> {
  return prisma.blogPost.findUnique({ where: { id: postId } });
}

export async function updateBlogPost(
  postId: string,
  data: Partial<CreateBlogPostData>
): Promise<BlogPost> {
  const updateData: Parameters<typeof prisma.blogPost.update>[0]["data"] = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined)
    updateData.content = (data.content as Prisma.InputJsonValue) ?? Prisma.JsonNull;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt ?? null;
  if (data.cover_image !== undefined) updateData.cover_image = data.cover_image ?? null;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
  if (data.is_published !== undefined) {
    updateData.is_published = data.is_published;
    if (data.is_published) {
      updateData.published_at = new Date();
    }
  }

  return prisma.blogPost.update({ where: { id: postId }, data: updateData });
}

export async function deleteBlogPost(postId: string): Promise<void> {
  await prisma.blogPost.delete({ where: { id: postId } });
}

export async function incrementBlogPostViewCount(postId: string): Promise<void> {
  await prisma.blogPost.update({
    where: { id: postId },
    data: { view_count: { increment: 1 } },
  });
}
