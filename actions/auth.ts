"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    SignInWithPasswordCredentials,
    SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { createUser } from "@/queries/auth";
import { handleError } from "@/lib/utils";

type AuthData = {
    email: string;
    password: string;
    name?: string;
    rememberMe?: boolean;
    ssc_batch?: string;
};

type AuthResult = {
    success: boolean;
    error?: string;
    message?: string;
};

export async function login(authData: AuthData): Promise<AuthResult> {
    try {
        const supabase = await createSupabaseServer();

        const data: SignInWithPasswordCredentials = {
            email: authData.email,
            password: authData.password,
        };

        const { data: userData, error } =
            await supabase.auth.signInWithPassword(data);

        if (error) {
            return { success: false, error: error.message };
        }

        // Check if user profile exists
        const existingUser = await supabase
            .from("user_profiles")
            .select("*")
            .eq("email", authData.email)
            .limit(1)
            .single();

        if (!existingUser.data) {
            const response = await createUser(supabase, {
                id: userData.user?.id,
                email: authData.email,
                name: authData.name || "",
                ssc_batch: authData.ssc_batch || "",
            });

            if (response.error) {
                await supabase.auth.signOut();
                return {
                    success: false,
                    error: response.error || "Failed to create user profile",
                };
            }
        }

        revalidatePath("/", "layout");
        return { success: true, message: "Login successful" };
    } catch (error) {
        return { success: false, error: handleError(error) };
    }
}

export async function signup(authData: AuthData): Promise<AuthResult> {
    try {
        const supabase = await createSupabaseServer();

        const data: SignUpWithPasswordCredentials = {
            email: authData.email,
            password: authData.password,
            options: {
                data: {
                    fullName: authData.name,
                    ssc_batch: authData.ssc_batch,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth?tab=login`,
            },
        };

        const { error } = await supabase.auth.signUp(data);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/", "layout");
        return {
            success: true,
            message:
                "Registration successful! Please check your email to confirm your account.",
        };
    } catch (error) {
        return { success: false, error: handleError(error) };
    }
}

export async function logout(): Promise<AuthResult> {
    try {
        const supabase = await createSupabaseServer();

        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/", "layout");
        return {
            success: true,
            message: "Logged out successfully",
        };
    } catch (error) {
        return { success: false, error: handleError(error) };
    }
}

export async function resetPassword(email: string): Promise<AuthResult> {
    try {
        const supabase = await createSupabaseServer();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${
                process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
            }/auth?tab=login`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            message: "Password reset link sent! Please check your email.",
        };
    } catch (error) {
        return { success: false, error: handleError(error) };
    }
}
