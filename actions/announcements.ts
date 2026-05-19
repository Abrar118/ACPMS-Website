"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type CreateAnnouncementData,
} from "@/lib/db/announcements";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type AnnouncementActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createAnnouncementAction(
  announcementData: CreateAnnouncementData
): Promise<AnnouncementActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create announcements" };

    const announcement = await createAnnouncement(user.id, announcementData);
    revalidatePath("/admin/announcements", "page");
    revalidatePath("/", "page");
    return { success: true, message: "Announcement created successfully", data: announcement };
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message || "Failed to create announcement" };
  }
}

export async function updateAnnouncementAction(
  announcementId: string,
  announcementData: Partial<CreateAnnouncementData & { is_active?: boolean }>
): Promise<AnnouncementActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update announcements" };

    const announcement = await updateAnnouncement(announcementId, announcementData);
    revalidatePath("/admin/announcements", "page");
    revalidatePath("/", "page");
    return { success: true, message: "Announcement updated successfully", data: announcement };
  } catch (error: any) {
    console.error("Error updating announcement:", error);
    return { success: false, error: error.message || "Failed to update announcement" };
  }
}

export async function deleteAnnouncementAction(
  announcementId: string
): Promise<AnnouncementActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete announcements" };

    await deleteAnnouncement(announcementId);
    revalidatePath("/admin/announcements", "page");
    revalidatePath("/", "page");
    return { success: true, message: "Announcement deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message || "Failed to delete announcement" };
  }
}
