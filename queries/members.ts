import type { TypedSupabaseClient } from "@/utils/types";
import type { Database } from "@/database.types";
import { QueryResponse, QueryResponseType } from "@/utils/query-response";

// Type definitions
export type MemberRow = Database["public"]["Tables"]["members"]["Row"];
export type CreateMemberData = Database["public"]["Tables"]["members"]["Insert"];
export type UpdateMemberData = Database["public"]["Tables"]["members"]["Update"];

/**
 * Get all members from the database
 */
export async function getAllMembers(
  client: TypedSupabaseClient
): Promise<QueryResponseType<MemberRow[]>> {
  try {
    const { data, error } = await client
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return QueryResponse.success<MemberRow[]>(data || []);
  } catch (error: any) {
    console.error("Error fetching all members:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch members",
    };
  }
}

/**
 * Get members grouped by session
 */
export async function getMembersBySession(
  client: TypedSupabaseClient
): Promise<QueryResponseType<{ [session: string]: MemberRow[] }>> {
  try {
    const { data, error } = await client
      .from("members")
      .select("*")
      .order("session", { ascending: false })
      .order("position", { ascending: true });

    if (error) throw error;

    // Group members by session
    const groupedMembers: { [session: string]: MemberRow[] } = {};
    
    data?.forEach((member) => {
      const session = member.session || "Unknown";
      if (!groupedMembers[session]) {
        groupedMembers[session] = [];
      }
      groupedMembers[session].push(member);
    });

    // Sort members within each session by designation priority
    Object.keys(groupedMembers).forEach((session) => {
      groupedMembers[session].sort((a, b) => {
        const designationOrder = [
          "president", 
          "vice president", 
          "general secretary", 
          "organising secretary",
          "organizing secretary"
        ];
        
        const aDesignation = (a.designation || "").toLowerCase().trim();
        const bDesignation = (b.designation || "").toLowerCase().trim();
        
        // Find exact matches for the designation hierarchy
        const aIndex = designationOrder.findIndex(des => aDesignation === des);
        const bIndex = designationOrder.findIndex(des => bDesignation === des);
        
        // If both designations are found in the order, sort by that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only one is found, it comes first
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If neither is found, sort alphabetically
        return aDesignation.localeCompare(bDesignation);
      });
    });

    return QueryResponse.success<{ [session: string]: MemberRow[] }>(groupedMembers);
  } catch (error: any) {
    console.error("Error fetching members by session:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch members by session",
    };
  }
}

/**
 * Get members by designation (e.g., "Founder", "Executive", etc.)
 */
export async function getMembersByDesignation(
  client: TypedSupabaseClient,
  designation: string
): Promise<QueryResponseType<MemberRow[]>> {
  try {
    const { data, error } = await client
      .from("members")
      .select("*")
      .ilike("designation", `%${designation}%`)
      .order("position", { ascending: true });

    if (error) throw error;

    return QueryResponse.success<MemberRow[]>(data || []);
  } catch (error: any) {
    console.error(`Error fetching members by designation (${designation}):`, error);
    return {
      success: false,
      data: null,
      error: error.message || `Failed to fetch ${designation} members`,
    };
  }
}

/**
 * Get founders (members with designation containing "founder")
 */
export async function getFounders(
  client: TypedSupabaseClient
): Promise<QueryResponseType<MemberRow[]>> {
  return getMembersByDesignation(client, "founder");
}

/**
 * Get current executives (members with designation containing "executive" or specific positions)
 */
export async function getCurrentExecutives(
  client: TypedSupabaseClient
): Promise<QueryResponseType<MemberRow[]>> {
  try {
    const { data, error } = await client
      .from("members")
      .select("*")
      .or(`designation.ilike.%executive%, designation.ilike.%current%, position.ilike.%president%, position.ilike.%secretary%, position.ilike.%treasurer%`)
      .not("designation", "ilike", "%founder%")
      .order("position", { ascending: true });

    if (error) throw error;

    // Sort by position priority
    const sortedData = data?.sort((a, b) => {
      const positionOrder = ["President", "Vice President", "General Secretary", "Organizing Secretary", "Treasurer", "Event Coordinator", "Public Relations"];
      
      const aPosition = a.position || "";
      const bPosition = b.position || "";
      
      const aIndex = positionOrder.findIndex(pos => 
        aPosition.toLowerCase().includes(pos.toLowerCase())
      );
      const bIndex = positionOrder.findIndex(pos => 
        bPosition.toLowerCase().includes(pos.toLowerCase())
      );
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return aPosition.localeCompare(bPosition);
    }) || [];

    return QueryResponse.success<MemberRow[]>(sortedData);
  } catch (error: any) {
    console.error("Error fetching current executives:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch current executives",
    };
  }
}

/**
 * Create a new member
 */
export async function createMember(
  client: TypedSupabaseClient,
  memberData: CreateMemberData
): Promise<QueryResponseType<MemberRow | null>> {
  try {
    const { data, error } = await client
      .from("members")
      .insert({
        ...memberData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return QueryResponse.success<MemberRow>(data);
  } catch (error: any) {
    console.error("Error creating member:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to create member",
    };
  }
}

/**
 * Update a member
 */
export async function updateMember(
  client: TypedSupabaseClient,
  memberId: string,
  updateData: UpdateMemberData
): Promise<QueryResponseType<MemberRow | null>> {
  try {
    const { data, error } = await client
      .from("members")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;

    return QueryResponse.success<MemberRow>(data);
  } catch (error: any) {
    console.error("Error updating member:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to update member",
    };
  }
}

/**
 * Delete a member
 */
export async function deleteMember(
  client: TypedSupabaseClient,
  memberId: string
): Promise<QueryResponseType<null>> {
  try {
    const { error } = await client
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;

    return QueryResponse.success<null>(null);
  } catch (error: any) {
    console.error("Error deleting member:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to delete member",
    };
  }
}

/**
 * Get unique sessions from members table
 */
export async function getUniqueSessions(
  client: TypedSupabaseClient
): Promise<QueryResponseType<string[]>> {
  try {
    const { data, error } = await client
      .from("members")
      .select("session")
      .not("session", "is", null)
      .order("session", { ascending: false });

    if (error) throw error;

    // Get unique sessions
    const uniqueSessions = Array.from(new Set(data?.map(item => item.session).filter(Boolean))) as string[];
    
    // Sort sessions with Moderators at the end
    uniqueSessions.sort((a, b) => {
      // Put "Moderators" at the end
      if (a.toLowerCase() === "moderators") return 1;
      if (b.toLowerCase() === "moderators") return -1;
      
      // For other sessions, sort in descending order (newest first)
      return b.localeCompare(a, undefined, { numeric: true });
    });

    return QueryResponse.success<string[]>(uniqueSessions);
  } catch (error: any) {
    console.error("Error fetching unique sessions:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch sessions",
    };
  }
}
