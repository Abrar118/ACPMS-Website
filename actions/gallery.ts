"use server";

import { revalidatePath } from "next/cache";
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImage,
  deleteImage,
  updateImageOrder,
  type CreateAlbumData,
  type AddImageData,
} from "@/lib/db/gallery";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type GalleryActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createAlbumAction(albumData: CreateAlbumData): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create albums" };

    const album = await createAlbum(user.id, albumData);
    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");
    return { success: true, message: "Album created successfully", data: album };
  } catch (error: any) {
    console.error("Error creating album:", error);
    return { success: false, error: error.message || "Failed to create album" };
  }
}

export async function updateAlbumAction(albumId: string, albumData: Partial<CreateAlbumData>): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update albums" };

    const album = await updateAlbum(albumId, albumData);
    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");
    return { success: true, message: "Album updated successfully", data: album };
  } catch (error: any) {
    console.error("Error updating album:", error);
    return { success: false, error: error.message || "Failed to update album" };
  }
}

export async function deleteAlbumAction(albumId: string): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete albums" };

    await deleteAlbum(albumId);
    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");
    return { success: true, message: "Album deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting album:", error);
    return { success: false, error: error.message || "Failed to delete album" };
  }
}

export async function addImageAction(imageData: AddImageData): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to add images" };

    const image = await addImage(imageData);
    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");
    return { success: true, message: "Image added successfully", data: image };
  } catch (error: any) {
    console.error("Error adding image:", error);
    return { success: false, error: error.message || "Failed to add image" };
  }
}

export async function deleteImageAction(imageId: string): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete images" };

    await deleteImage(imageId);
    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");
    return { success: true, message: "Image deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message || "Failed to delete image" };
  }
}

export async function updateImageOrderAction(
  images: { id: string; display_order: number }[]
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to reorder images" };

    await updateImageOrder(images);
    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");
    return { success: true, message: "Image order updated successfully" };
  } catch (error: any) {
    console.error("Error updating image order:", error);
    return { success: false, error: error.message || "Failed to update image order" };
  }
}
