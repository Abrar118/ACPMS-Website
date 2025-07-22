import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getUserById } from "@/queries/auth";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/queries/auth";
import { printIfDev } from "./utils";

export interface AuthData {
    user: User | null;
    profile: UserProfile | null;
}

/**
 * Get current authenticated user and their profile (server-side)
 * Use this in server components and server actions
 */
export async function getCurrentUser(): Promise<AuthData> {
    try {
        const supabase = await createSupabaseServer();

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return { user: null, profile: null };
        }

        printIfDev("Current user: " + JSON.stringify(user));

        // Get user profile from database
        const profileResponse = await getUserById(supabase, user.id);

        if (profileResponse.error) {
            printIfDev("Error fetching user profile: " + profileResponse.error);
            return { user, profile: null };
        }

        return {
            user,
            profile: profileResponse.data,
        };
    } catch (error) {
        printIfDev("Error getting current user: " + error);
        return { user: null, profile: null };
    }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
    const { user } = await getCurrentUser();
    return !!user;
}

/**
 * Check if user has specific role (server-side)
 */
export async function hasRole(role: string): Promise<boolean> {
    const { profile } = await getCurrentUser();
    return profile?.role === role;
}

/**
 * Check if user is admin or executive (server-side)
 */
export async function isAdminOrExecutive(): Promise<boolean> {
    const { profile } = await getCurrentUser();
    return profile?.role === "admin" || profile?.role === "executive";
}
