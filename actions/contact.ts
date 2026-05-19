"use server";

import { revalidatePath } from "next/cache";
import {
  createContactSubmission,
  updateContactStatus,
  markContactAsReplied,
  deleteContactSubmission,
  type CreateContactData,
} from "@/lib/db/contact";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type ContactActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function submitContactFormAction(
  formData: CreateContactData
): Promise<ContactActionResult> {
  try {
    const submission = await createContactSubmission(formData);
    return { success: true, message: "Message sent successfully", data: submission };
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: error.message || "Failed to send message" };
  }
}

export async function updateContactStatusAction(
  submissionId: string,
  status: string
): Promise<ContactActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage contact submissions" };

    const submission = await updateContactStatus(submissionId, status);
    revalidatePath("/admin/contact", "page");
    return { success: true, message: "Status updated successfully", data: submission };
  } catch (error: any) {
    console.error("Error updating contact status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

export async function markContactAsRepliedAction(
  submissionId: string
): Promise<ContactActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage contact submissions" };

    const submission = await markContactAsReplied(submissionId, user.id);
    revalidatePath("/admin/contact", "page");
    return { success: true, message: "Marked as replied", data: submission };
  } catch (error: any) {
    console.error("Error marking contact as replied:", error);
    return { success: false, error: error.message || "Failed to mark as replied" };
  }
}

export async function deleteContactSubmissionAction(
  submissionId: string
): Promise<ContactActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete contact submissions" };

    await deleteContactSubmission(submissionId);
    revalidatePath("/admin/contact", "page");
    return { success: true, message: "Submission deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting contact submission:", error);
    return { success: false, error: error.message || "Failed to delete submission" };
  }
}
