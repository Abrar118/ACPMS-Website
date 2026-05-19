import prisma from "@/lib/prisma";
import type { GalleryAlbum, GalleryImage } from "@/lib/generated/prisma";

export type { GalleryAlbum, GalleryImage };

export type AlbumWithImages = GalleryAlbum & { images: GalleryImage[] };

export interface CreateAlbumData {
  title: string;
  description?: string;
  event_id?: string;
  cover_image?: string;
  is_published?: boolean;
  display_order?: number;
}

export interface AddImageData {
  album_id: string;
  image_url: string;
  caption?: string;
  display_order?: number;
}

export async function createAlbum(
  userId: string,
  data: CreateAlbumData
): Promise<GalleryAlbum> {
  const now = new Date();
  return prisma.galleryAlbum.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      event_id: data.event_id ?? null,
      cover_image: data.cover_image ?? null,
      is_published: data.is_published ?? false,
      display_order: data.display_order ?? 0,
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPublishedAlbums(): Promise<AlbumWithImages[]> {
  return prisma.galleryAlbum.findMany({
    where: { is_published: true },
    include: { images: { orderBy: { display_order: "asc" } } },
    orderBy: { display_order: "asc" },
  });
}

export async function getAllAlbums(): Promise<AlbumWithImages[]> {
  return prisma.galleryAlbum.findMany({
    include: { images: { orderBy: { display_order: "asc" } } },
    orderBy: { created_at: "desc" },
  });
}

export async function getAlbumById(albumId: string): Promise<AlbumWithImages | null> {
  return prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: { images: { orderBy: { display_order: "asc" } } },
  });
}

export async function getAlbumsByEvent(eventId: string): Promise<AlbumWithImages[]> {
  return prisma.galleryAlbum.findMany({
    where: { event_id: eventId, is_published: true },
    include: { images: { orderBy: { display_order: "asc" } } },
    orderBy: { display_order: "asc" },
  });
}

export async function updateAlbum(
  albumId: string,
  data: Partial<CreateAlbumData>
): Promise<GalleryAlbum> {
  return prisma.galleryAlbum.update({
    where: { id: albumId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.event_id !== undefined && { event_id: data.event_id ?? null }),
      ...(data.cover_image !== undefined && { cover_image: data.cover_image ?? null }),
      ...(data.is_published !== undefined && { is_published: data.is_published }),
      ...(data.display_order !== undefined && { display_order: data.display_order }),
      updated_at: new Date(),
    },
  });
}

export async function deleteAlbum(albumId: string): Promise<void> {
  await prisma.galleryAlbum.delete({ where: { id: albumId } });
}

export async function addImage(data: AddImageData): Promise<GalleryImage> {
  return prisma.galleryImage.create({
    data: {
      album_id: data.album_id,
      image_url: data.image_url,
      caption: data.caption ?? null,
      display_order: data.display_order ?? 0,
    },
  });
}

export async function deleteImage(imageId: string): Promise<void> {
  await prisma.galleryImage.delete({ where: { id: imageId } });
}

export async function updateImageOrder(
  images: { id: string; display_order: number }[]
): Promise<void> {
  await prisma.$transaction(
    images.map((img) =>
      prisma.galleryImage.update({
        where: { id: img.id },
        data: { display_order: img.display_order },
      })
    )
  );
}
