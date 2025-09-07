"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
  updateParticipantStatus,
  updateAllParticipantStatuses,
} from "@/queries/participants";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type ParticipantActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function updateParticipantStatusAction(
  registrationId: string,
  status: string,
  eventId: string
): Promise<ParticipantActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to update participant status (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to update participant status",
      };
    }

    const supabase = await createSupabaseServer();

    // Update the participant status
    const result = await updateParticipantStatus(supabase, registrationId, status);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}/participants`, "page");

    return {
      success: true,
      message: `Participant status updated to ${status}`,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error updating participant status:", error);
    return {
      success: false,
      error: error.message || "Failed to update participant status",
    };
  }
}

export async function updateAllParticipantStatusesAction(
  participantId: string,
  eventId: string,
  status: string
): Promise<ParticipantActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to update participant statuses (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to update participant statuses",
      };
    }

    const supabase = await createSupabaseServer();

    // Update all participant statuses for this event
    const result = await updateAllParticipantStatuses(supabase, participantId, eventId, status);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}/participants`, "page");

    return {
      success: true,
      message: `All registrations for participant updated to ${status}`,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error updating all participant statuses:", error);
    return {
      success: false,
      error: error.message || "Failed to update all participant statuses",
    };
  }
}
