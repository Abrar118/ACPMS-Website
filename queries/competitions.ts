import type { TypedSupabaseClient } from "@/utils/types";
import type { Database } from "@/database.types";
import { QueryResponse, QueryResponseType } from "@/utils/query-response";

// Type definitions
export type CompetitionRow = Database["public"]["Tables"]["competitions"]["Row"];
export type CreateCompetitionData = Database["public"]["Tables"]["competitions"]["Insert"];
export type UpdateCompetitionData = Database["public"]["Tables"]["competitions"]["Update"];

/**
 * Get all competitions for a specific event
 */
export async function getEventCompetitions(
  client: TypedSupabaseClient,
  eventId: string
): Promise<QueryResponseType<CompetitionRow[]>> {
  try {
    const { data, error } = await client
      .from("competitions")
      .select("*")
      .eq("event_id", eventId)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return QueryResponse.success<CompetitionRow[]>(data || []);
  } catch (error: any) {
    console.error("Error fetching event competitions:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch competitions",
    };
  }
}

/**
 * Create a new competition
 */
export async function createCompetition(
  client: TypedSupabaseClient,
  competitionData: CreateCompetitionData
): Promise<QueryResponseType<CompetitionRow | null>> {
  try {
    const { data, error } = await client
      .from("competitions")
      .insert({
        ...competitionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return QueryResponse.success<CompetitionRow>(data);
  } catch (error: any) {
    console.error("Error creating competition:", error);
    return QueryResponse.error(error.message || "Failed to create competition");
  }
}

/**
 * Update a competition
 */
export async function updateCompetition(
  client: TypedSupabaseClient,
  competitionId: string,
  updateData: UpdateCompetitionData
): Promise<QueryResponseType<CompetitionRow | null>> {
  try {
    const { data, error } = await client
      .from("competitions")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", competitionId)
      .select()
      .single();

    if (error) throw error;

    return QueryResponse.success<CompetitionRow>(data);
  } catch (error: any) {
    console.error("Error updating competition:", error);
    return QueryResponse.error(error.message || "Failed to update competition");
  }
}

/**
 * Delete a competition
 */
export async function deleteCompetition(
  client: TypedSupabaseClient,
  competitionId: string
): Promise<QueryResponseType<void | null>> {
  try {
    const { error } = await client
      .from("competitions")
      .delete()
      .eq("id", competitionId);

    if (error) throw error;

    return QueryResponse.success<void>(undefined);
  } catch (error: any) {
    console.error("Error deleting competition:", error);
    return QueryResponse.error(error.message || "Failed to delete competition");
  }
}

/**
 * Update competition display order
 */
export async function updateCompetitionOrder(
  client: TypedSupabaseClient,
  competitions: { id: string; display_order: number }[]
): Promise<QueryResponseType<void | null>> {
  try {
    const updates = competitions.map((comp) =>
      client
        .from("competitions")
        .update({ 
          display_order: comp.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", comp.id)
    );

    await Promise.all(updates);

    return QueryResponse.success<void>(undefined);
  } catch (error: any) {
    console.error("Error updating competition order:", error);
    return QueryResponse.error(error.message || "Failed to update competition order");
  }
}

/**
 * Toggle competition publish status
 */
export async function toggleCompetitionStatus(
  client: TypedSupabaseClient,
  competitionId: string,
  isPublished: boolean
): Promise<QueryResponseType<CompetitionRow | null>> {
  try {
    const { data, error } = await client
      .from("competitions")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", competitionId)
      .select()
      .single();

    if (error) throw error;

    return QueryResponse.success<CompetitionRow>(data);
  } catch (error: any) {
    console.error("Error toggling competition status:", error);
    return QueryResponse.error(error.message || "Failed to toggle competition status");
  }
}
