"use server";

import { revalidatePath } from "next/cache";
import {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  toggleCompetitionStatus,
  updateCompetitionOrder,
  type CreateCompetitionData,
} from "@/lib/db/competitions";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type CompetitionActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createCompetitionAction(
  competitionData: CreateCompetitionData
): Promise<CompetitionActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to create competitions (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to create competitions",
      };
    }

    // Create the competition
    const competition = await createCompetition(competitionData);

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${competitionData.event_id}`, "page");
    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: "Competition created successfully",
      data: competition,
    };
  } catch (error: any) {
    console.error("Error creating competition:", error);
    return {
      success: false,
      error: error.message || "Failed to create competition",
    };
  }
}

export async function updateCompetitionAction(
  competitionId: string,
  competitionData: Partial<Omit<CreateCompetitionData, "event_id">>
): Promise<CompetitionActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to update competitions (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to update competitions",
      };
    }

    // Update the competition
    const competition = await updateCompetition(competitionId, competitionData);

    // Revalidate relevant pages
    if (competition?.event_id) {
      revalidatePath(`/admin/events/${competition.event_id}`, "page");
    }
    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: "Competition updated successfully",
      data: competition,
    };
  } catch (error: any) {
    console.error("Error updating competition:", error);
    return {
      success: false,
      error: error.message || "Failed to update competition",
    };
  }
}

export async function deleteCompetitionAction(
  competitionId: string,
  eventId: string
): Promise<CompetitionActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to delete competitions (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to delete competitions",
      };
    }

    // Delete the competition
    await deleteCompetition(competitionId);

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}`, "page");
    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: "Competition deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting competition:", error);
    return {
      success: false,
      error: error.message || "Failed to delete competition",
    };
  }
}

export async function toggleCompetitionStatusAction(
  competitionId: string,
  isPublished: boolean,
  eventId: string
): Promise<CompetitionActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to change competition status (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to change competition status",
      };
    }

    // Update the competition status
    const competition = await toggleCompetitionStatus(competitionId, isPublished);

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}`, "page");
    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: `Competition ${isPublished ? "published" : "unpublished"} successfully`,
      data: competition,
    };
  } catch (error: any) {
    console.error("Error updating competition status:", error);
    return {
      success: false,
      error: error.message || "Failed to update competition status",
    };
  }
}

export async function updateCompetitionOrderAction(
  competitions: { id: string; display_order: number }[],
  eventId: string
): Promise<CompetitionActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to reorder competitions (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to reorder competitions",
      };
    }

    // Update the competition order
    await updateCompetitionOrder(competitions);

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}`, "page");
    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: "Competition order updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating competition order:", error);
    return {
      success: false,
      error: error.message || "Failed to update competition order",
    };
  }
}
