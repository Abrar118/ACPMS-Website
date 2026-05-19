"use server";

import { revalidatePath } from "next/cache";
import {
  createMagazine,
  updateMagazine,
  deleteMagazine,
  toggleMagazinePublished,
  incrementMagazineDownloadCount,
  type CreateMagazineData,
} from "@/lib/db/magazines";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type MagazineActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createMagazineAction(
  magazineData: CreateMagazineData
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create magazines" };

    const magazine = await createMagazine(user.id, magazineData);
    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");
    return { success: true, message: "Magazine created successfully", data: magazine };
  } catch (error: any) {
    console.error("Error creating magazine:", error);
    return { success: false, error: error.message || "Failed to create magazine" };
  }
}

export async function updateMagazineAction(
  magazineId: string,
  magazineData: Partial<CreateMagazineData>
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update magazines" };

    const magazine = await updateMagazine(magazineId, magazineData);
    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");
    return { success: true, message: "Magazine updated successfully", data: magazine };
  } catch (error: any) {
    console.error("Error updating magazine:", error);
    return { success: false, error: error.message || "Failed to update magazine" };
  }
}

export async function deleteMagazineAction(
  magazineId: string
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete magazines" };

    await deleteMagazine(magazineId);
    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");
    return { success: true, message: "Magazine archived successfully" };
  } catch (error: any) {
    console.error("Error deleting magazine:", error);
    return { success: false, error: error.message || "Failed to archive magazine" };
  }
}

export async function toggleMagazinePublishedAction(
  magazineId: string,
  isPublished: boolean
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to change magazine status" };

    const magazine = await toggleMagazinePublished(magazineId, isPublished);
    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");
    return {
      success: true,
      message: `Magazine ${isPublished ? "published" : "unpublished"} successfully`,
      data: magazine,
    };
  } catch (error: any) {
    console.error("Error toggling magazine status:", error);
    return { success: false, error: error.message || "Failed to update magazine status" };
  }
}

export async function incrementMagazineDownloadAction(
  magazineId: string
): Promise<MagazineActionResult> {
  try {
    await incrementMagazineDownloadCount(magazineId);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment download count:", error);
    return { success: false, error: error.message || "Failed to increment download count" };
  }
}
