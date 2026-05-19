import prisma from "@/lib/prisma";
import type { Magazine } from "@/lib/generated/prisma";

export type { Magazine };

export interface CreateMagazineData {
  title: string;
  summary?: string;
  volume?: number;
  issue?: number;
  pdf_url?: string;
  cover_image?: string;
  published_date?: string | Date;
  language?: string;
  doi?: string;
  access_level?: string;
  chief_patron?: string;
  tags?: string[];
}

export async function createMagazine(
  userId: string,
  data: CreateMagazineData
): Promise<Magazine> {
  const now = new Date();
  return prisma.magazine.create({
    data: {
      title: data.title,
      summary: data.summary ?? null,
      volume: data.volume ?? null,
      issue: data.issue ?? null,
      pdf_url: data.pdf_url ?? null,
      cover_image: data.cover_image ?? null,
      published_date: data.published_date ? new Date(data.published_date) : null,
      is_published: 0,
      published: false,
      is_archived: false,
      language: data.language ?? "English",
      doi: data.doi ?? null,
      access_level: data.access_level ?? "public",
      chief_patron: data.chief_patron ?? null,
      download_count: 0,
      tags: data.tags ?? [],
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPublishedMagazines(): Promise<Magazine[]> {
  return prisma.magazine.findMany({
    where: { published: true, is_archived: false },
    orderBy: { published_date: "desc" },
  });
}

export async function getAllMagazines(): Promise<Magazine[]> {
  return prisma.magazine.findMany({
    where: { is_archived: { not: true } },
    orderBy: { created_at: "desc" },
  });
}

export async function getMagazineById(magazineId: string): Promise<Magazine | null> {
  return prisma.magazine.findUnique({ where: { id: magazineId } });
}

export async function updateMagazine(
  magazineId: string,
  data: Partial<CreateMagazineData & { is_archived?: boolean }>
): Promise<Magazine> {
  return prisma.magazine.update({
    where: { id: magazineId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.summary !== undefined && { summary: data.summary ?? null }),
      ...(data.volume !== undefined && { volume: data.volume ?? null }),
      ...(data.issue !== undefined && { issue: data.issue ?? null }),
      ...(data.pdf_url !== undefined && { pdf_url: data.pdf_url ?? null }),
      ...(data.cover_image !== undefined && { cover_image: data.cover_image ?? null }),
      ...(data.published_date !== undefined && {
        published_date: data.published_date ? new Date(data.published_date) : null,
      }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.doi !== undefined && { doi: data.doi ?? null }),
      ...(data.access_level !== undefined && { access_level: data.access_level }),
      ...(data.chief_patron !== undefined && { chief_patron: data.chief_patron ?? null }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.is_archived !== undefined && { is_archived: data.is_archived }),
      updated_at: new Date(),
    },
  });
}

export async function toggleMagazinePublished(
  magazineId: string,
  isPublished: boolean
): Promise<Magazine> {
  return prisma.magazine.update({
    where: { id: magazineId },
    data: {
      published: isPublished,
      is_published: isPublished ? 1 : 0,
      updated_at: new Date(),
    },
  });
}

export async function deleteMagazine(magazineId: string): Promise<Magazine> {
  return prisma.magazine.update({
    where: { id: magazineId },
    data: { is_archived: true, updated_at: new Date() },
  });
}

export async function incrementMagazineDownloadCount(magazineId: string): Promise<void> {
  await prisma.magazine.update({
    where: { id: magazineId },
    data: { download_count: { increment: 1 } },
  });
}
