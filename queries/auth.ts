import { QueryResponse, QueryResponseType } from "@/utils/query-response";
import { TypedSupabaseClient } from "@/utils/types";
import { PostgrestError } from "@supabase/postgrest-js";

// User authentication and profile types based on your database schema
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    ssc_batch: string; // Required field based on your schema
    role: string | null; // Can be null in database
    status: string | null; // Can be null in database
    executive_position: string | null;
    profile_image: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface CreateUserData {
    id: string;
    email: string;
    name: string;
    ssc_batch: string;
}

// Get all users (admin only)
export async function getAllUsers(
    client: TypedSupabaseClient
): Promise<QueryResponseType<UserProfile[] | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return QueryResponse.success<UserProfile[]>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Get approved users only (public)
export async function getApprovedUsers(
    client: TypedSupabaseClient
): Promise<QueryResponseType<UserProfile[] | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .eq("status", "approved")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return QueryResponse.success<UserProfile[]>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Get executives (public)
export async function getExecutives(
    client: TypedSupabaseClient
): Promise<QueryResponseType<UserProfile[] | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .eq("role", "executive")
            .eq("status", "approved")
            .order("executive_position", { ascending: true });

        if (error) throw error;
        return QueryResponse.success<UserProfile[]>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Get user by ID
export async function getUserById(
    client: TypedSupabaseClient,
    userId: string
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) throw error;
        return QueryResponse.success<UserProfile>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Get user by email
export async function getUserByEmail(
    client: TypedSupabaseClient,
    email: string
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .eq("email", email)
            .single();

        if (error) throw error;
        return QueryResponse.success<UserProfile>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Create new user profile
export async function createUser(
    client: TypedSupabaseClient,
    userData: CreateUserData
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .insert({
                ...userData,
                role: "member",
                status: "pending",
            })
            .select()
            .single();

        if (error) throw error;
        return QueryResponse.success<UserProfile>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Update user profile
export async function updateUser(
    client: TypedSupabaseClient,
    userId: string,
    userData: Partial<UserProfile>
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .update({
                ...userData,
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

// Update user status (admin only)
export async function updateUserStatus(
    client: TypedSupabaseClient,
    userId: string,
    status: string | null
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .update({
                status,
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

// Update user role (admin only)
export async function updateUserRole(
    client: TypedSupabaseClient,
    userId: string,
    role: string | null,
    executivePosition?: string | null
): Promise<QueryResponseType<UserProfile | null>> {
    try {
        const updateData: any = {
            role,
            updated_at: new Date().toISOString(),
        };

        if (role === "executive" && executivePosition) {
            updateData.executive_position = executivePosition;
        } else if (role !== "executive") {
            updateData.executive_position = null;
        }

        const { data, error } = await client
            .from("user_profiles")
            .update(updateData)
            .eq("id", userId)
            .select()
            .single();

        if (error) throw error;
        return QueryResponse.success<UserProfile>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Delete user (admin only)
export async function deleteUser(
    client: TypedSupabaseClient,
    userId: string
): Promise<QueryResponseType<null>> {
    try {
        const { error } = await client
            .from("user_profiles")
            .delete()
            .eq("id", userId);

        if (error) throw error;
        return QueryResponse.success<null>(null);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Get pending users (admin only)
export async function getPendingUsers(
    client: TypedSupabaseClient
): Promise<QueryResponseType<UserProfile[] | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return QueryResponse.success<UserProfile[]>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}

// Search users by name or email
export async function searchUsers(
    client: TypedSupabaseClient,
    searchTerm: string
): Promise<QueryResponseType<UserProfile[] | null>> {
    try {
        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
            .eq("status", "approved")
            .order("name", { ascending: true });

        if (error) throw error;
        return QueryResponse.success<UserProfile[]>(data);
    } catch (error: any) {
        return QueryResponse.error(error.message);
    }
}
