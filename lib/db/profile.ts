import prisma from "@/lib/prisma";
import type { UserProfile } from "@/lib/generated/prisma";

export interface UpdateUserProfileData {
  name?: string;
  ssc_batch?: string;
  profile_image?: string;
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileData
): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
}
