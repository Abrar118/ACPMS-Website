import prisma from "@/lib/prisma";
import type { Resource } from "@/lib/generated/prisma";

export type { Resource };

export type CreateResourceData = {
  title: string;
  description?: string;
  category?: string;
  resourceType: string;
  resourceUrl?: string;
  author?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  levels?: { value: string }[];
  tags?: { value: string }[];
};

export type UpdateResourceData = Partial<CreateResourceData>;

/**
 * Create a new resource
 */
export async function createResource(
  userId: string,
  data: CreateResourceData
): Promise<Resource> {
  return prisma.resource.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      category: data.category ?? null,
      resource_type: data.resourceType,
      resource_url: data.resourceUrl ?? null,
      author: data.author ?? null,
      is_published: data.isPublished ?? false,
      is_featured: data.isFeatured ?? false,
      is_archived: false,
      levels: data.levels?.map((l) => l.value) ?? [],
      tags: data.tags?.map((t) => t.value) ?? [],
      created_by: userId,
      view_count: 0,
    },
  });
}

/**
 * Get all non-archived resources, ordered by created_at desc
 */
export async function getAllResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: { is_archived: false },
    orderBy: { created_at: "desc" },
  });
}

/**
 * Get published, non-archived resources
 */
export async function getPublishedResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: {
      is_published: true,
      is_archived: false,
    },
    orderBy: { created_at: "desc" },
  });
}

/**
 * Get featured published resources
 */
export async function getFeaturedResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: {
      is_published: true,
      is_featured: true,
      is_archived: false,
    },
    orderBy: { created_at: "desc" },
  });
}

/**
 * Get a resource by ID
 */
export async function getResourceById(
  resourceId: string
): Promise<Resource | null> {
  return prisma.resource.findUnique({ where: { id: resourceId } });
}

/**
 * Update a resource (partial update), maps levels/tags from {value} format
 */
export async function updateResource(
  resourceId: string,
  data: UpdateResourceData
): Promise<Resource> {
  return prisma.resource.update({
    where: { id: resourceId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && {
        description: data.description ?? null,
      }),
      ...(data.category !== undefined && { category: data.category ?? null }),
      ...(data.resourceType !== undefined && {
        resource_type: data.resourceType,
      }),
      ...(data.resourceUrl !== undefined && {
        resource_url: data.resourceUrl ?? null,
      }),
      ...(data.author !== undefined && { author: data.author ?? null }),
      ...(data.isPublished !== undefined && { is_published: data.isPublished }),
      ...(data.isFeatured !== undefined && { is_featured: data.isFeatured }),
      ...(data.levels !== undefined && {
        levels: data.levels.map((l) => l.value),
      }),
      ...(data.tags !== undefined && {
        tags: data.tags?.map((t) => t.value) ?? [],
      }),
      updated_at: new Date(),
    },
  });
}

/**
 * Soft delete a resource by archiving it
 */
export async function deleteResource(resourceId: string): Promise<Resource> {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { is_archived: true, updated_at: new Date() },
  });
}

/**
 * Atomically increment a resource's view count
 */
export async function incrementResourceViewCount(
  resourceId: string
): Promise<void> {
  await prisma.resource.update({
    where: { id: resourceId },
    data: { view_count: { increment: 1 } },
  });
}

/**
 * Get published resources by category
 */
export async function getResourcesByCategory(
  category: string
): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: {
      is_published: true,
      category,
      is_archived: false,
    },
    orderBy: { created_at: "desc" },
  });
}
