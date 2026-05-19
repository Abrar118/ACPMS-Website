import prisma from "@/lib/prisma";
import type { Announcement } from "@/lib/generated/prisma";

export type { Announcement };

export interface CreateAnnouncementData {
  title: string;
  body: string;
  priority?: string;
  is_pinned?: boolean;
  expires_at?: string | Date;
}

export async function createAnnouncement(
  userId: string,
  data: CreateAnnouncementData
): Promise<Announcement> {
  const now = new Date();
  return prisma.announcement.create({
    data: {
      title: data.title,
      body: data.body,
      priority: data.priority ?? "normal",
      is_pinned: data.is_pinned ?? false,
      is_active: true,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  return prisma.announcement.findMany({
    where: {
      is_active: true,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
    orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
  });
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  return prisma.announcement.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getAnnouncementById(
  announcementId: string
): Promise<Announcement | null> {
  return prisma.announcement.findUnique({ where: { id: announcementId } });
}

export async function updateAnnouncement(
  announcementId: string,
  data: Partial<CreateAnnouncementData & { is_active?: boolean }>
): Promise<Announcement> {
  return prisma.announcement.update({
    where: { id: announcementId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.is_pinned !== undefined && { is_pinned: data.is_pinned }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
      ...(data.expires_at !== undefined && {
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
      }),
      updated_at: new Date(),
    },
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await prisma.announcement.delete({ where: { id: announcementId } });
}
