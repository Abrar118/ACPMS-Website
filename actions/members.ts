"use server";

import { revalidatePath } from "next/cache";
import {
  createMember,
  updateMember,
  deleteMember,
} from "@/lib/db/members";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import type { CreateMemberData, UpdateMemberData } from "@/lib/db/members";

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

    // Create the member
    const member = await createMember(memberData);

    // Revalidate relevant pages
    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return {
      success: true,
      message: "Member created successfully",
      data: member,
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

    // Update the member
    const member = await updateMember(memberId, memberData);

    // Revalidate relevant pages
    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return {
      success: true,
      message: "Member updated successfully",
      data: member,
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

    // Delete the member
    await deleteMember(memberId);

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
