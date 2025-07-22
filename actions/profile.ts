"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import {
    updateUserProfile,
    type UpdateUserProfileData,
} from "@/queries/profile";

type ProfileUpdateResult = {
    success: boolean;
    error?: string;
    message?: string;
};

export async function updateProfile(
    userId: string,
    profileData: UpdateUserProfileData
): Promise<ProfileUpdateResult> {
    try {
        const supabase = await createSupabaseServer();

        // Validate that user is authenticated and can only update their own profile
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user || user.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        const result = await updateUserProfile(supabase, userId, profileData);

        if (result.error) {
            return { success: false, error: result.error };
        }

        revalidatePath("/profile", "page");
        revalidatePath("/", "layout"); // Revalidate layout to update navbar

        return {
            success: true,
            message: "Profile updated successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to update profile",
        };
    }
}

export async function uploadProfileImage(
    userId: string,
    file: File
): Promise<ProfileUpdateResult> {
    try {
        const supabase = await createSupabaseServer();

        // Validate that user is authenticated
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user || user.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Upload image to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("profile-images")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from("profile-images").getPublicUrl(fileName);

        // Update user profile with new image URL
        const updateResult = await updateUserProfile(supabase, userId, {
            profile_image: publicUrl,
        });

        if (updateResult.error) {
            // Delete uploaded file if profile update fails
            await supabase.storage.from("profile-images").remove([fileName]);

            return { success: false, error: updateResult.error };
        }

        revalidatePath("/profile", "page");
        revalidatePath("/", "layout");

        return {
            success: true,
            message: "Profile image updated successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to upload profile image",
        };
    }
}
