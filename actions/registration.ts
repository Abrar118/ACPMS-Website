"use server";

import { revalidatePath } from "next/cache";
import {
  registerForEvent,
  updateParticipantStatus,
  type EventRegistrationData,
} from "@/lib/db/participants";

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
    // Register for the event (uses Prisma $transaction internally)
    const result = await registerForEvent(registrationData);

    // Revalidate relevant pages
    revalidatePath(`/events/${eventId}`, "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Registration successful, organizers will verify and reach out to you shortly",
      data: result,
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
    // Update the participant status
    const registration = await updateParticipantStatus(registrationId, status);

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
