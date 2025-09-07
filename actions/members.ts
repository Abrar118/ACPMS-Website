"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
  createMember,
  updateMember,
  deleteMember,
} from "@/queries/members";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import type { CreateMemberData, UpdateMemberData } from "@/queries/members";

type MemberActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createMemberAction(
  memberData: CreateMemberData
): Promise<MemberActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to create members (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to create members",
      };
    }

    const supabase = await createSupabaseServer();

    // Create the member
    const result = await createMember(supabase, memberData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return {
      success: true,
      message: "Member created successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error in createMemberAction:", error);
    return {
      success: false,
      error: error.message || "Failed to create member",
    };
  }
}

export async function updateMemberAction(
  memberId: string,
  memberData: UpdateMemberData
): Promise<MemberActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to update members (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to update members",
      };
    }

    const supabase = await createSupabaseServer();

    // Update the member
    const result = await updateMember(supabase, memberId, memberData);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return {
      success: true,
      message: "Member updated successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Error in updateMemberAction:", error);
    return {
      success: false,
      error: error.message || "Failed to update member",
    };
  }
}

export async function deleteMemberAction(
  memberId: string
): Promise<MemberActionResult> {
  try {
    // Get current user and verify authentication
    const { user, profile } = await getCurrentUser();

    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has permission to delete members (admin or executive)
    if (!(await isAdminOrExecutive())) {
      return {
        success: false,
        error: "Insufficient permissions to delete members",
      };
    }

    const supabase = await createSupabaseServer();

    // Delete the member
    const result = await deleteMember(supabase, memberId);

    if (result.error) {
      return { success: false, error: result.error };
    }

    // Revalidate relevant pages
    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return {
      success: true,
      message: "Member deleted successfully",
    };
  } catch (error: any) {
    console.error("Error in deleteMemberAction:", error);
    return {
      success: false,
      error: error.message || "Failed to delete member",
    };
  }
}
