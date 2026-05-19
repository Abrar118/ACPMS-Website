"use server";

import { revalidatePath } from "next/cache";
import {
  createResult,
  updateResult,
  deleteResult,
  bulkCreateResults,
  getResultsByCompetition,
  type CreateResultData,
} from "@/lib/db/competition-results";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type ResultActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createResultAction(
  resultData: CreateResultData
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create results" };

    const result = await createResult(resultData);
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");
    return { success: true, message: "Result recorded successfully", data: result };
  } catch (error: any) {
    console.error("Error creating result:", error);
    return { success: false, error: error.message || "Failed to create result" };
  }
}

export async function updateResultAction(
  resultId: string,
  resultData: Partial<Omit<CreateResultData, "competition_id">>
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update results" };

    const result = await updateResult(resultId, resultData);
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");
    return { success: true, message: "Result updated successfully", data: result };
  } catch (error: any) {
    console.error("Error updating result:", error);
    return { success: false, error: error.message || "Failed to update result" };
  }
}

export async function deleteResultAction(
  resultId: string
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete results" };

    await deleteResult(resultId);
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");
    return { success: true, message: "Result deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting result:", error);
    return { success: false, error: error.message || "Failed to delete result" };
  }
}

export async function getResultsForCompetitionAction(
  competitionId: string
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions" };

    const results = await getResultsByCompetition(competitionId);
    return { success: true, data: JSON.parse(JSON.stringify(results)) };
  } catch (error: any) {
    console.error("Error fetching results:", error);
    return { success: false, error: error.message || "Failed to fetch results" };
  }
}

export async function bulkCreateResultsAction(
  results: CreateResultData[]
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create results" };

    const count = await bulkCreateResults(results);
    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");
    return { success: true, message: `${count} results recorded successfully`, data: { count } };
  } catch (error: any) {
    console.error("Error bulk creating results:", error);
    return { success: false, error: error.message || "Failed to create results" };
  }
}
