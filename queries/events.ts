import { QueryResponse, QueryResponseType } from "@/utils/query-response";
import { TypedSupabaseClient } from "@/utils/types";
import { PostgrestError } from "@supabase/postgrest-js";
import { Database } from "@/database.types";

type Json = Database["public"]["Tables"]["events"]["Row"]["additional_info"];

// Event types based on your database schema
export interface EventType {
    id: string;
    event_code: string;
    event_type_name: string;
}

export interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string | null;
    end_date: string | null;
    location: string | null;
    registration_deadline: string | null;
    is_published: number;
    is_online: number;
    event_type: string | null; // This is the foreign key ID
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    poster_url: string | null;
    additional_info: Json | null;
    tags: string[] | null;
}

// Type for events with joined event type data
export type EventWithType = Omit<Event, 'event_type'> & {
    event_type: EventType | null; // This replaces the string ID with the full object
}

export interface CreateEventData {
    title: string;
    description?: string;
    event_date?: string;
    end_date?: string;
    location?: string;
    registration_deadline?: string;
    event_type?: string;
    is_online?: number;
    poster_url?: string;
    additional_info?: Json;
    tags?: string[];
}

// React Query compatible functions (return query builders for useQuery)
export function getEventsQuery(client: TypedSupabaseClient) {
    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("is_published", 1)
        .order("event_date", { ascending: true });
}

export function getEventsByTypeQuery(
    client: TypedSupabaseClient,
    eventType: string
) {
    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("is_published", 1)
        .eq("event_type", eventType)
        .order("event_date", { ascending: true });
}

export function getUpcomingEventsQuery(client: TypedSupabaseClient) {
    const today = new Date().toISOString().split("T")[0];

    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("is_published", 1)
        .gte("event_date", today)
        .order("event_date", { ascending: true });
}

// Paginated version of upcoming events
export function getUpcomingEventsWithPaginationQuery(
    client: TypedSupabaseClient,
    page: number = 1,
    pageSize: number = 10
) {
    const today = new Date().toISOString().split("T")[0];
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("is_published", 1)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .range(from, to);
}

export function getPastEventsQuery(client: TypedSupabaseClient) {
    const today = new Date().toISOString().split("T")[0];

    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("is_published", 1)
        .lt("event_date", today)
        .order("event_date", { ascending: false })
        .limit(6);
}

// Paginated version of past events
export function getPastEventsWithPaginationQuery(
    client: TypedSupabaseClient,
    page: number = 1,
    pageSize: number = 10
) {
    const today = new Date().toISOString().split("T")[0];
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("is_published", 1)
        .lt("event_date", today)
        .order("event_date", { ascending: false })
        .range(from, to);
}

export function getEventByIdQuery(
    client: TypedSupabaseClient,
    eventId: string
) {
    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .eq("id", eventId)
        .eq("is_published", 1)
        .single();
}

export function getAllEventsQuery(client: TypedSupabaseClient) {
    return client
        .from("events")
        .select(`
            *,
            event_type (
                id,
                event_code,
                event_type_name
            )
        `)
        .order("event_date", { ascending: false });
}

export function getEventTypesQuery(client: TypedSupabaseClient) {
    return client
        .from("event_type")
        .select("*")
        .order("event_type_name", { ascending: true });
}

// Highlights function for landing page
export async function getHighlights(client: TypedSupabaseClient) {
    // Get latest published event
    const { data: event, error: eventError } = await client
        .from('events')
        .select('*')
        .eq('is_published', 1)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Get most viewed public resource
    const { data: resource, error: resourceError } = await client
        .from('resources')
        .select('*')
        .eq('is_verified', true)
        .eq('visibility', 'public')
        .order('view_count', { ascending: false })
        .limit(1)
        .single();

    // Get latest published magazine
    const { data: magazine, error: magazineError } = await client
        .from('magazines')
        .select('*')
        .eq('is_published', 1)
        .order('published_date', { ascending: false })
        .limit(1)
        .single();

    if (eventError || resourceError || magazineError) {
        console.error('Error fetching highlights:', { eventError, resourceError, magazineError });
        return null;
    }

    return {
        event,
        resource,
        magazine
    };
}

// React Query version for highlights
export function getHighlightsQuery(client: TypedSupabaseClient) {
    return {
        queryKey: ['highlights'],
        queryFn: () => getHighlights(client),
    };
}

// Count functions for pagination
export function getUpcomingEventsCountQuery(client: TypedSupabaseClient) {
    const today = new Date().toISOString().split("T")[0];
    
    return client
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_published", 1)
        .gte("event_date", today);
}

export function getPastEventsCountQuery(client: TypedSupabaseClient) {
    const today = new Date().toISOString().split("T")[0];
    
    return client
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_published", 1)
        .lt("event_date", today);
}
