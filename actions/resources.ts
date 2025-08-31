"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
  createOneResource,
  updateResource,
  deleteResource,
  incrementResourceViewCount,
} from "@/queries/resources";
import { addResourceSchema } from "@/components/resources/admin/addResourceForm/AddResourceHelper";
import { EResourceStatus } from "@/components/shared/enums";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import { z } from "zod";

type ResourceActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createResource(
  resourceData: z.infer<typeof addResourceSchema>
): Promise<ResourceActionResult> {
  try {
    // Validate the input data
    const validatedData = addResourceSchema.parse(resourceData);

    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to create resources (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to create resources",
      };
    }

    const supabase = await createSupabaseServer();

    // Create the resource
    const result = await createOneResource(supabase, user.id, validatedData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: "Resource created successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error creating resource:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Invalid input data: " +
          error.issues.map((e: any) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error.message || "Failed to create resource",
    };
  }
}

export async function updateResourceAction(
  resourceId: string,
  resourceData: Partial<z.infer<typeof addResourceSchema>>
): Promise<ResourceActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to update resources (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to update resources",
      };
    }

    const supabase = await createSupabaseServer();

    // Update the resource
    const result = await updateResource(supabase, resourceId, resourceData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: "Resource updated successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error updating resource:", error);
    return {
      success: false,
      error: error.message || "Failed to update resource",
    };
  }
}

export async function deleteResourceAction(
  resourceId: string
): Promise<ResourceActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to delete resources (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to delete resources",
      };
    }

    const supabase = await createSupabaseServer();

    // Delete (archive) the resource
    const result = await deleteResource(supabase, resourceId);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: "Resource deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return {
      success: false,
      error: error.message || "Failed to delete resource",
    };
  }
}

export async function toggleResourceStatus(
  resourceId: string,
  newStatus: EResourceStatus
): Promise<ResourceActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to change resource status (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to change resource status",
      };
    }

    const supabase = await createSupabaseServer();

    // Update the resource status
    const result = await updateResource(supabase, resourceId, {
      status: newStatus,
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: `Resource ${newStatus.toLowerCase()} successfully`,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error updating resource status:", error);
    return {
      success: false,
      error: error.message || "Failed to update resource status",
    };
  }
}

export async function toggleResourceFeatured(
  resourceId: string,
  isFeatured: boolean
): Promise<ResourceActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to change featured status (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to change featured status",
      };
    }

    const supabase = await createSupabaseServer();

    // Update the resource featured status
    const result = await updateResource(supabase, resourceId, { isFeatured });

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: `Resource ${
        isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error updating resource featured status:", error);
    return {
      success: false,
      error: error.message || "Failed to update featured status",
    };
  }
}

export async function incrementViewCount(resourceId: string): Promise<ResourceActionResult> {
  try {
    const supabase = await createSupabaseServer();
    
    const result = await incrementResourceViewCount(supabase, resourceId);
    
    if (result.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment view count:", error);
    return { success: false, error: error.message || "Failed to increment view count" };
  }
}
