import { QueryResponse, type QueryResponseType } from "@/utils/query-response";
import type { TypedSupabaseClient } from "@/utils/types";
import type { Database } from "@/database.types";
import type { UserProfile } from "./auth";

// Event Registration types
export interface EventRegistration {
    id: string;
    event_id: string | null;
    user_id: string | null;
    registered_at: string | null;
    registration_status: string | null;
    payment_status: string | null;
    certificate_url: string | null;
    notes: string | null;
}

// Event Registration with full event details
export interface EventRegistrationWithEvent {
    id: string;
    event_id: string | null;
    user_id: string | null;
    registered_at: string | null;
    registration_status: string | null;
    payment_status: string | null;
    certificate_url: string | null;
    notes: string | null;
    event: {
        id: string;
        title: string;
        description: string | null;
        event_date: string | null;
        location: string | null;
        poster_url: string | null;
        event_type: {
            event_type_name: string;
        } | null;
    } | null;
}

// Update user profile data interface
export interface UpdateUserProfileData {
    name?: string;
    ssc_batch?: string;
    profile_image?: string;
    // Note: email is excluded as it should not be updated through the profile form
}

// React Query compatible functions
// export function getUserRegisteredEventsQuery(
//     client: TypedSupabaseClient,
//     userId: string
// ) {
//     const today = new Date().toISOString().split("T")[0];

//     return client
//         .from("event_registrations")
//         .select(
//             `
//             *,
//             event:events (
//                 id,
//                 title,
//                 description,
//                 event_date,
//                 location,
//                 poster_url,
//                 event_type:event_type (
//                     event_type_name
//                 )
//             )
//         `
//         )
//         .eq("user_id", userId)
//         .gte("event.event_date", today)
//         .order("event(event_date)", { ascending: true });
// }

// export function getUserPastEventsQuery(
//     client: TypedSupabaseClient,
//     userId: string
// ) {
//     const today = new Date().toISOString().split("T")[0];

//     return client
//         .from("event_registrations")
//         .select(
//             `
//             *,
//             event:events (
//                 id,
//                 title,
//                 description,
//                 event_date,
//                 location,
//                 poster_url,
//                 event_type:event_type (
//                     event_type_name
//                 )
//             )
//         `
//         )
//         .eq("user_id", userId)
//         .lt("event.event_date", today)
//         .order("event(event_date)", { ascending: false });
// }

// Update user profile
export async function updateUserProfile(
    client: TypedSupabaseClient,
    userId: string,
    profileData: UpdateUserProfileData
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .update({
                ...profileData,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();

        if (error) throw error;
        return QueryResponse.success<UserProfile>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// // Get user's registration statistics
// export async function getUserRegistrationStats(
//     client: TypedSupabaseClient,
//     userId: string
// ): Promise<
//     QueryResponseType<{
//         totalRegistrations: number;
//         upcomingEvents: number;
//         pastEvents: number;
//         completedEvents: number;
//     } | null>
// > {
//     try {
//         const today = new Date().toISOString().split("T")[0];

//         // Get all registrations
//         const { data: allRegistrations, error: allError } = await client
//             .from("event_registrations")
//             .select("id, event:events(event_date)")
//             .eq("user_id", userId);

//         if (allError) throw allError;

//         // Get upcoming events
//         const { data: upcomingRegistrations, error: upcomingError } =
//             await client
//                 .from("event_registrations")
//                 .select("id, event:events(event_date)")
//                 .eq("user_id", userId)
//                 .gte("event.event_date", today);

//         if (upcomingError) throw upcomingError;

//         // Get past events
//         const { data: pastRegistrations, error: pastError } = await client
//             .from("event_registrations")
//             .select("id, event:events(event_date)")
//             .eq("user_id", userId)
//             .lt("event.event_date", today);

//         if (pastError) throw pastError;

//         // Get completed events (past events with certificates)
//         const { data: completedRegistrations, error: completedError } =
//             await client
//                 .from("event_registrations")
//                 .select("id, certificate_url, event:events(event_date)")
//                 .eq("user_id", userId)
//                 .lt("event.event_date", today)
//                 .not("certificate_url", "is", null);

//         if (completedError) throw completedError;

//         const stats = {
//             totalRegistrations: allRegistrations?.length || 0,
//             upcomingEvents: upcomingRegistrations?.length || 0,
//             pastEvents: pastRegistrations?.length || 0,
//             completedEvents: completedRegistrations?.length || 0,
//         };

//         return QueryResponse.success(stats);
//     } catch (error: any) {
//         return QueryResponse.error(error.message);
//     }
// }
