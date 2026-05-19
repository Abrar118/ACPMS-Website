"use server";

import { revalidatePath } from "next/cache";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  type CreateEventData,
} from "@/lib/db/events";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type EventActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createEventAction(
  eventData: CreateEventData
): Promise<EventActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to create events (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to create events",
      };
    }

    // Create the event
    const event = await createEvent(user.id, eventData);

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Event created successfully",
      data: event,
    };
  } catch (error: any) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: error.message || "Failed to create event",
    };
  }
}

export async function updateEventAction(
  eventId: string,
  eventData: Partial<CreateEventData>
): Promise<EventActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to update events (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to update events",
      };
    }

    // Update the event
    const event = await updateEvent(eventId, eventData);

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Event updated successfully",
      data: event,
    };
  } catch (error: any) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error: error.message || "Failed to update event",
    };
  }
}

export async function deleteEventAction(
  eventId: string
): Promise<EventActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to delete events (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to delete events",
      };
    }

    // Delete the event
    await deleteEvent(eventId);

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Event deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: error.message || "Failed to delete event",
    };
  }
}

export async function toggleEventStatusAction(
  eventId: string,
  isPublished: boolean
): Promise<EventActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to change event status (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to change event status",
      };
    }

    // Update the event status
    const event = await toggleEventStatus(eventId, isPublished);

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: `Event ${isPublished ? "published" : "unpublished"} successfully`,
      data: event,
    };
  } catch (error: any) {
    console.error("Error updating event status:", error);
    return {
      success: false,
      error: error.message || "Failed to update event status",
    };
  }
}
