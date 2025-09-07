import type { TypedSupabaseClient } from "@/utils/types";
import type { Database } from "@/database.types";
import { QueryResponse, QueryResponseType } from "@/utils/query-response";

// Type definitions
export type ParticipantRow = Database["public"]["Tables"]["participants"]["Row"];
export type CompetitionParticipantRow = Database["public"]["Tables"]["competitions_participants"]["Row"];

export interface EventRegistrationData {
  name: string;
  institution: string;
  level: "School" | "College" | "University";
  class: number;
  id_at_institution: string;
  email: string;
  phone: string;
  note?: string;
  competitions: string[]; // Array of competition IDs
  transaction_id?: string;
  payment_provider?: "BKash";
}

export interface CreateParticipantData {
  name: string;
  institution: string;
  class: number;
  id_at_institution: string;
  email?: string;
  phone?: string;
  note?: string;
  transaction_id?: string;
  payment_provider?: string;
}

/**
 * Create a new participant and register them for competitions
 */
export async function registerForEvent(
  client: TypedSupabaseClient,
  registrationData: EventRegistrationData
): Promise<QueryResponseType<{ participant: ParticipantRow; registrations: CompetitionParticipantRow[] }>> {
  try {
    // First, create the participant
    const participantData: CreateParticipantData = {
      name: registrationData.name,
      institution: registrationData.institution,
      class: registrationData.class,
      id_at_institution: registrationData.id_at_institution,
      email: registrationData.email,
      phone: registrationData.phone,
      note: registrationData.note || "",
      transaction_id: registrationData.transaction_id,
      payment_provider: registrationData.payment_provider,
    };

    const { data: participant, error: participantError } = await client
      .from("participants")
      .insert({
        ...participantData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (participantError) throw participantError;

    // Then, register them for each selected competition
    const competitionRegistrations = registrationData.competitions.map(competitionId => ({
      participant_id: participant.id,
      competition_id: competitionId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: registrations, error: registrationsError } = await client
      .from("competitions_participants")
      .insert(competitionRegistrations)
      .select();

    if (registrationsError) throw registrationsError;

    return QueryResponse.success({
      participant,
      registrations: registrations || [],
    });
  } catch (error: any) {
    console.error("Error registering for event:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to register for event",
    };
  }
}

/**
 * Check if a participant with the same email or student ID already exists for the same institution
 */
export async function checkExistingParticipant(
  client: TypedSupabaseClient,
  email: string,
  id_at_institution: string,
  institution: string
): Promise<QueryResponseType<ParticipantRow | null>> {
  try {
    const { data, error } = await client
      .from("participants")
      .select("*")
      .or(`email.eq.${email},and(id_at_institution.eq.${id_at_institution},institution.eq.${institution})`)
      .maybeSingle();

    if (error) throw error;

    return QueryResponse.success(data);
  } catch (error: any) {
    console.error("Error checking existing participant:", error);
    return QueryResponse.error(error.message || "Failed to check existing participant");
  }
}

/**
 * Get participant registrations for a specific event
 */
export async function getEventParticipants(
  client: TypedSupabaseClient,
  eventId: string
): Promise<QueryResponseType<any[]>> {
  try {
    const { data, error } = await client
      .from("competitions_participants")
      .select(`
        *,
        participant:participants(*),
        competition:competitions(*)
      `)
      .eq("competitions.event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return QueryResponse.success(data || []);
  } catch (error: any) {
    console.error("Error fetching event participants:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch event participants",
    };
  }
}

/**
 * Get detailed participants data for an event with all their registrations
 */
export async function getEventParticipantsDetailed(
  client: TypedSupabaseClient,
  eventId: string
): Promise<QueryResponseType<any[]>> {
  try {
    // First get all competitions for this event
    const { data: competitions, error: competitionsError } = await client
      .from("competitions")
      .select("id")
      .eq("event_id", eventId);

    if (competitionsError) throw competitionsError;

    const competitionIds = competitions?.map(comp => comp.id) || [];

    if (competitionIds.length === 0) {
      return QueryResponse.success([]);
    }

    // Then get all participants registered for these competitions
    const { data, error } = await client
      .from("competitions_participants")
      .select(`
        *,
        participant:participants(*),
        competition:competitions(*)
      `)
      .in("competition_id", competitionIds)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Group participants by participant ID
    const participantsMap = new Map();
    
    data?.forEach((registration) => {
      const participantId = registration.participant.id;
      
      if (!participantsMap.has(participantId)) {
        participantsMap.set(participantId, {
          participant: registration.participant,
          registrations: []
        });
      }
      
      participantsMap.get(participantId).registrations.push({
        id: registration.id,
        competition_id: registration.competition_id,
        status: registration.status,
        created_at: registration.created_at,
        updated_at: registration.updated_at,
        competition: registration.competition
      });
    });

    const result = Array.from(participantsMap.values());
    return QueryResponse.success(result);
  } catch (error: any) {
    console.error("Error fetching detailed event participants:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch detailed event participants",
    };
  }
}

/**
 * Update participant registration status
 */
export async function updateParticipantStatus(
  client: TypedSupabaseClient,
  registrationId: string,
  status: string
): Promise<QueryResponseType<CompetitionParticipantRow | null>> {
  try {
    const { data, error } = await client
      .from("competitions_participants")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", registrationId)
      .select()
      .single();

    if (error) throw error;

    return QueryResponse.success(data);
  } catch (error: any) {
    console.error("Error updating participant status:", error);
    return QueryResponse.error(error.message || "Failed to update participant status");
  }
}

/**
 * Update multiple participant registration statuses for a single participant
 */
export async function updateAllParticipantStatuses(
  client: TypedSupabaseClient,
  participantId: string,
  eventId: string,
  status: string
): Promise<QueryResponseType<CompetitionParticipantRow[]>> {
  try {
    // First get all competition IDs for this event
    const { data: competitions, error: competitionsError } = await client
      .from("competitions")
      .select("id")
      .eq("event_id", eventId);

    if (competitionsError) throw competitionsError;

    const competitionIds = competitions?.map(comp => comp.id) || [];

    // Update all registrations for this participant in these competitions
    const { data, error } = await client
      .from("competitions_participants")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("participant_id", participantId)
      .in("competition_id", competitionIds)
      .select();

    if (error) throw error;

    return QueryResponse.success(data || []);
  } catch (error: any) {
    console.error("Error updating all participant statuses:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to update all participant statuses",
    };
  }
}
