"use server";

import { revalidatePath } from "next/cache";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamsByCompetition,
  type CreateTeamData,
  type AddTeamMemberData,
} from "@/lib/db/teams";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type TeamActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createTeamAction(
  teamData: CreateTeamData
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create teams" };

    const team = await createTeam(teamData);
    revalidatePath("/admin/events", "page");
    return { success: true, message: "Team created successfully", data: team };
  } catch (error: any) {
    console.error("Error creating team:", error);
    return { success: false, error: error.message || "Failed to create team" };
  }
}

export async function updateTeamAction(
  teamId: string,
  teamData: Partial<CreateTeamData>
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update teams" };

    const team = await updateTeam(teamId, teamData);
    revalidatePath("/admin/events", "page");
    return { success: true, message: "Team updated successfully", data: team };
  } catch (error: any) {
    console.error("Error updating team:", error);
    return { success: false, error: error.message || "Failed to update team" };
  }
}

export async function deleteTeamAction(
  teamId: string
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete teams" };

    await deleteTeam(teamId);
    revalidatePath("/admin/events", "page");
    return { success: true, message: "Team deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting team:", error);
    return { success: false, error: error.message || "Failed to delete team" };
  }
}

export async function addTeamMemberAction(
  data: AddTeamMemberData
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage team members" };

    const member = await addTeamMember(data);
    revalidatePath("/admin/events", "page");
    return { success: true, message: "Team member added successfully", data: member };
  } catch (error: any) {
    console.error("Error adding team member:", error);
    return { success: false, error: error.message || "Failed to add team member" };
  }
}

export async function removeTeamMemberAction(
  teamId: string,
  participantId: string
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage team members" };

    await removeTeamMember(teamId, participantId);
    revalidatePath("/admin/events", "page");
    return { success: true, message: "Team member removed successfully" };
  } catch (error: any) {
    console.error("Error removing team member:", error);
    return { success: false, error: error.message || "Failed to remove team member" };
  }
}

export async function getTeamsForEventAction(
  competitionIds: string[]
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions" };

    const allTeams = [];
    for (const compId of competitionIds) {
      const teams = await getTeamsByCompetition(compId);
      allTeams.push(...teams);
    }
    const uniqueTeams = Array.from(new Map(allTeams.map(t => [t.id, t])).values());
    return { success: true, data: JSON.parse(JSON.stringify(uniqueTeams)) };
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return { success: false, error: error.message || "Failed to fetch teams" };
  }
}
