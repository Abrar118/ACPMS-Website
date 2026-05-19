"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type UserActionResult = {
    success: boolean;
    error?: string;
    message?: string;
    data?: any;
};

export async function createUserProfileAction(data: {
    name: string;
    email: string;
    ssc_batch: string;
    role: "member" | "executive" | "admin";
    status: "pending" | "approved";
}): Promise<UserActionResult> {
    try {
        const { user, profile } = await getCurrentUser();
        if (!user || !profile)
            return { success: false, error: "Authentication required" };
        if (!(await isAdminOrExecutive()))
            return { success: false, error: "Insufficient permissions" };

        // Check if email already exists
        const existing = await prisma.userProfile.findFirst({
            where: { email: data.email },
        });
        if (existing) {
            return { success: false, error: "A member with this email already exists" };
        }

        const newProfile = await prisma.userProfile.create({
            data: {
                email: data.email,
                name: data.name,
                ssc_batch: data.ssc_batch,
                role: data.role,
                status: data.status,
            },
        });

        revalidatePath("/admin/members", "page");

        return {
            success: true,
            message: `Member "${newProfile.name}" created successfully`,
            data: newProfile,
        };
    } catch (error) {
        console.error("createUserProfileAction error:", error);
        return { success: false, error: "Failed to create member" };
    }
}
