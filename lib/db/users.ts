import prisma from "@/lib/prisma";
import type { UserProfile } from "@/lib/generated/prisma";

export type { UserProfile };

// Get all users (admin only)
export async function getAllUsers(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    orderBy: { created_at: "desc" },
  });
}

// Get approved users only (public)
export async function getApprovedUsers(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: { status: "approved" },
    orderBy: { created_at: "desc" },
  });
}

// Get executives (public)
export async function getExecutives(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: {
      role: "executive",
      status: "approved",
    },
    orderBy: { executive_position: "asc" },
  });
}

// Get user by ID
export async function getUserById(userId: string): Promise<UserProfile | null> {
  return prisma.userProfile.findUnique({
    where: { id: userId },
  });
}

// Get user by email
export async function getUserByEmail(
  email: string
): Promise<UserProfile | null> {
  return prisma.userProfile.findFirst({
    where: { email },
  });
}

// Create new user profile
export async function createUserProfile(data: {
  id: string;
  email: string;
  name: string;
  ssc_batch: string;
}): Promise<UserProfile> {
  return prisma.userProfile.create({
    data: {
      ...data,
      role: "member",
      status: "pending",
    },
  });
}

// Update user profile
export async function updateUser(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
}

// Update user status (admin only)
export async function updateUserStatus(
  userId: string,
  status: string | null
): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: {
      status,
      updated_at: new Date(),
    },
  });
}

// Update user role (admin only)
export async function updateUserRole(
  userId: string,
  role: string | null,
  executivePosition?: string | null
): Promise<UserProfile> {
  const updateData: Parameters<typeof prisma.userProfile.update>[0]["data"] = {
    role,
    updated_at: new Date(),
  };

  if (role === "executive" && executivePosition) {
    updateData.executive_position = executivePosition;
  } else {
    updateData.executive_position = null;
  }

  return prisma.userProfile.update({
    where: { id: userId },
    data: updateData,
  });
}

// Delete user (admin only)
export async function deleteUser(userId: string): Promise<void> {
  await prisma.userProfile.delete({
    where: { id: userId },
  });
}

// Get pending users (admin only)
export async function getPendingUsers(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "desc" },
  });
}

// Search users by name or email (approved only)
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: {
      status: "approved",
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
}
