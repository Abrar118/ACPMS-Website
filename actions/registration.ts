"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
  registerForEvent,
  checkExistingParticipant,
  updateParticipantStatus,
  type EventRegistrationData,
} from "@/queries/participants";

type RegistrationActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function registerForEventAction(
  eventId: string,
  registrationData: EventRegistrationData
): Promise<RegistrationActionResult> {
  try {
    const supabase = await createSupabaseServer();

    // // Check if participant already exists
    // const existingParticipantResult = await checkExistingParticipant(
    //   supabase,
    //   registrationData.email,
    //   registrationData.id_at_institution,
    //   registrationData.institution
    // );

    // if (existingParticipantResult.success && existingParticipantResult.data) {
    //   return {
    //     success: false,
    //     error: "A participant with this email or student ID already exists for this institution",
    //   };
    // }

    // Register for the event
    const result = await registerForEvent(supabase, registrationData);

    if (!result.success || result.error) {
      return { success: false, error: result.error || "Failed to register for event" };
    }

    // Revalidate relevant pages
    revalidatePath(`/events/${eventId}`, "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Registration successful, organizers will verify and reach out to you shortly",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error processing registration:", error);
    return {
      success: false,
      error: error.message || "Failed to process registration",
    };
  }
}

export async function updateParticipantStatusAction(
  registrationId: string,
  status: string
): Promise<RegistrationActionResult> {
  try {
    const supabase = await createSupabaseServer();

    // Update the participant status
    const result = await updateParticipantStatus(supabase, registrationId, status);

    if (!result.success || result.error) {
      return { success: false, error: result.error || "Failed to update participant status" };
    }

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
