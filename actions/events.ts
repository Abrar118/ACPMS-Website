"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
  createOneEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  type CreateEventData,
} from "@/queries/events";
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

    const supabase = await createSupabaseServer();

    // Create the event
    const result = await createOneEvent(supabase, user.id, eventData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Event created successfully",
      data: result.data,
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

    const supabase = await createSupabaseServer();

    // Update the event
    const result = await updateEvent(supabase, eventId, eventData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Event updated successfully",
      data: result.data,
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

    const supabase = await createSupabaseServer();

    // Delete the event
    const result = await deleteEvent(supabase, eventId);

    if (result.error) {
      return { success: false, error: result.error };
    }

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

    const supabase = await createSupabaseServer();

    // Update the event status
    const result = await toggleEventStatus(supabase, eventId, isPublished);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: `Event ${isPublished ? "published" : "unpublished"} successfully`,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error updating event status:", error);
    return {
      success: false,
      error: error.message || "Failed to update event status",
    };
  }
}
