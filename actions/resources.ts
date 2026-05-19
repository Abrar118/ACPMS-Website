"use server";

import { revalidatePath } from "next/cache";
import {
  createResource,
  updateResource,
  deleteResource,
  incrementResourceViewCount,
} from "@/lib/db/resources";
import { addResourceSchema } from "@/components/resources/admin/addResourceForm/AddResourceHelper";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import { z } from "zod";

type ResourceActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createResourceAction(
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

    // Create the resource
    const resource = await createResource(user.id, validatedData);

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: "Resource created successfully",
      data: resource,
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

    // Update the resource
    const resource = await updateResource(resourceId, resourceData);

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: "Resource updated successfully",
      data: resource,
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

    // Delete (archive) the resource
    await deleteResource(resourceId);

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

export async function toggleResourcePublished(
  resourceId: string,
  isPublished: boolean
): Promise<ResourceActionResult> {
  try {
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to change resource status",
      };
    }

    const resource = await updateResource(resourceId, {
      isPublished,
    });

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: `Resource ${isPublished ? "published" : "unpublished"} successfully`,
      data: resource,
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

    // Update the resource featured status
    const resource = await updateResource(resourceId, { isFeatured });

    // Revalidate relevant pages
    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: `Resource ${
        isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: resource,
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
    await incrementResourceViewCount(resourceId);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment view count:", error);
    return { success: false, error: error.message || "Failed to increment view count" };
  }
}
