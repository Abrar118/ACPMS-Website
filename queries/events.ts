import { QueryResponse, QueryResponseType } from "@/utils/query-response";
import { TypedSupabaseClient } from "@/utils/types";
import { PostgrestError } from "@supabase/postgrest-js";
import { Database } from "@/database.types";
import { EResourceStatus } from "@/components/shared/enums";

type Json = Database["public"]["Tables"]["events"]["Row"]["description"];

// Event types based on your database schema
export interface EventType {
    id: string;
    event_code: string;
    event_type_name: string;
}

export interface Event {
    id: string;
    title: string;
    description: Json | null;
    event_date: string | null;
    end_date: string | null;
    venue: string | null;
    registration_deadline: string | null;
    is_published: boolean;
    event_mode: string;
    event_type: string | null; // This is the foreign key ID
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    poster_url: string | null;
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
    venue?: string;
    registration_deadline?: string;
    event_type?: string;
    event_mode?: string;
    poster_url?: string;
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
        .eq("is_published", true)
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
        .eq("is_published", true)
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
        .eq("is_published", true)
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
        .eq("is_published", true)
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
        .eq("is_published", true)
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
        .eq("is_published", true)
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
        .eq("is_published", true)
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
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Get most viewed public resource
    const { data: resource, error: resourceError } = await client
        .from('resources')
        .select('*')
        .eq('status', EResourceStatus.Published)
        .eq('is_archived', false)
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
        .eq("is_published", true)
        .gte("event_date", today);
}

export function getPastEventsCountQuery(client: TypedSupabaseClient) {
    const today = new Date().toISOString().split("T")[0];
    
    return client
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .lt("event_date", today);
}

// Admin Functions for Event Management
export type EventRow = Database["public"]["Tables"]["events"]["Row"];

export async function createOneEvent(
    client: TypedSupabaseClient,
    userId: string,
    eventData: CreateEventData
): Promise<QueryResponseType<EventRow | null>> {
    try {
        const insertData: Database["public"]["Tables"]["events"]["Insert"] = {
            title: eventData.title,
            description: eventData.description || null,
            event_date: eventData.event_date || null,
            end_date: eventData.end_date || null,
            venue: eventData.venue || null,
            registration_deadline: eventData.registration_deadline || null,
            event_type: eventData.event_type || null,
            event_mode: eventData.event_mode || "In Person",
            poster_url: eventData.poster_url || null,
            tags: eventData.tags || null,
            created_by: userId,
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await client
            .from("events")
            .insert(insertData)
            .select()
            .single();

        if (error) throw error;
        return QueryResponse.success<EventRow>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

export async function getAllEventsAdmin(
    client: TypedSupabaseClient
): Promise<QueryResponseType<EventRow[] | null>> {
    try {
        const { data, error } = await client
            .from("events")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return QueryResponse.success<EventRow[]>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

export async function updateEvent(
    client: TypedSupabaseClient,
    eventId: string,
    updateData: Partial<CreateEventData>
): Promise<QueryResponseType<EventRow | null>> {
    try {
        const transformedData: Database["public"]["Tables"]["events"]["Update"] = {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.description !== undefined && {
                description: updateData.description || null,
            }),
            ...(updateData.event_date && { event_date: updateData.event_date }),
            ...(updateData.end_date && { end_date: updateData.end_date }),
            ...(updateData.venue && { venue: updateData.venue }),
            ...(updateData.registration_deadline && {
                registration_deadline: updateData.registration_deadline,
            }),
            ...(updateData.event_type && { event_type: updateData.event_type }),
            ...(updateData.event_mode && { event_mode: updateData.event_mode }),
            ...(updateData.poster_url && { poster_url: updateData.poster_url }),
            ...(updateData.tags !== undefined && { tags: updateData.tags || null }),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await client
            .from("events")
            .update(transformedData)
            .eq("id", eventId)
            .select()
            .single();

        if (error) throw error;
        return QueryResponse.success<EventRow>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

export async function deleteEvent(
    client: TypedSupabaseClient,
    eventId: string
): Promise<QueryResponseType<null>> {
    try {
        const { error } = await client
            .from("events")
            .delete()
            .eq("id", eventId);

        if (error) throw error;
        return QueryResponse.success<null>(null);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

export async function toggleEventStatus(
    client: TypedSupabaseClient,
    eventId: string,
    isPublished: boolean
): Promise<QueryResponseType<EventRow | null>> {
    try {
        const { data, error } = await client
            .from("events")
            .update({
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            })
            .eq("id", eventId)
            .select()
            .single();

        if (error) throw error;
        return QueryResponse.success<EventRow>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}
