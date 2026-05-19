"use server";

import { revalidatePath } from "next/cache";
import {
  updateParticipantStatus,
  updateAllParticipantStatuses,
} from "@/lib/db/participants";
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

    // Update the participant status
    const registration = await updateParticipantStatus(registrationId, status);

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}/participants`, "page");

    return {
      success: true,
      message: `Participant status updated to ${status}`,
      data: registration,
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

    // Update all participant statuses for this event (returns count)
    const count = await updateAllParticipantStatuses(participantId, eventId, status);

    // Revalidate relevant pages
    revalidatePath(`/admin/events/${eventId}/participants`, "page");

    return {
      success: true,
      message: `All registrations for participant updated to ${status}`,
      data: { count },
    };
  } catch (error: any) {
    console.error("Error updating all participant statuses:", error);
    return {
      success: false,
      error: error.message || "Failed to update all participant statuses",
    };
  }
}
