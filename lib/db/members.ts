import prisma from "@/lib/prisma";
import type { Member } from "@/lib/generated/prisma";

export type CreateMemberData = {
  name: string;
  designation: string;
  position?: string;
  session?: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  facebook_id_link?: string;
  instagram_id_link?: string;
  linkedin_id_link?: string;
  user_id?: string;
};

export type UpdateMemberData = Partial<CreateMemberData>;

// Designation priority order for sorting within sessions
const DESIGNATION_PRIORITY = [
  "president",
  "vice president",
  "general secretary",
  "organising secretary",
  "organizing secretary",
];

function sortMembersByDesignation(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const aDesignation = (a.designation || "").toLowerCase().trim();
    const bDesignation = (b.designation || "").toLowerCase().trim();

    const aIndex = DESIGNATION_PRIORITY.findIndex(
      (des) => aDesignation === des
    );
    const bIndex = DESIGNATION_PRIORITY.findIndex(
      (des) => bDesignation === des
    );

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return aDesignation.localeCompare(bDesignation);
  });
}

/**
 * Get all members ordered by created_at desc
 */
export async function getAllMembers(): Promise<Member[]> {
  return prisma.member.findMany({
    orderBy: { created_at: "desc" },
  });
}

/**
 * Get members grouped by session, sorted within each group by designation priority
 */
export async function getMembersBySession(): Promise<Record<string, Member[]>> {
  const members = await prisma.member.findMany({
    orderBy: [{ session: "desc" }, { position: "asc" }],
  });

  const grouped: Record<string, Member[]> = {};

  for (const member of members) {
    const session = member.session || "Unknown";
    if (!grouped[session]) {
      grouped[session] = [];
    }
    grouped[session].push(member);
  }

  // Sort within each session by designation priority
  for (const session of Object.keys(grouped)) {
    grouped[session] = sortMembersByDesignation(grouped[session]);
  }

  return grouped;
}

/**
 * Get members whose designation contains the given string (case-insensitive), ordered by position asc
 */
export async function getMembersByDesignation(
  designation: string
): Promise<Member[]> {
  return prisma.member.findMany({
    where: {
      designation: { contains: designation, mode: "insensitive" },
    },
    orderBy: { position: "asc" },
  });
}

/**
 * Get founders (members with designation containing "founder")
 */
export async function getFounders(): Promise<Member[]> {
  return getMembersByDesignation("founder");
}

/**
 * Get unique sessions, sorted with "Moderators" last, then descending numeric
 */
export async function getUniqueSessions(): Promise<string[]> {
  const rows = await prisma.member.findMany({
    where: { session: { not: null } },
    select: { session: true },
    distinct: ["session"],
    orderBy: { session: "desc" },
  });

  const sessions = rows
    .map((r) => r.session)
    .filter((s): s is string => s !== null);

  sessions.sort((a, b) => {
    if (a.toLowerCase() === "moderators") return 1;
    if (b.toLowerCase() === "moderators") return -1;
    return b.localeCompare(a, undefined, { numeric: true });
  });

  return sessions;
}

/**
 * Create a new member
 */
export async function createMember(data: CreateMemberData): Promise<Member> {
  return prisma.member.create({ data });
}

/**
 * Update an existing member
 */
export async function updateMember(
  memberId: string,
  data: UpdateMemberData
): Promise<Member> {
  return prisma.member.update({
    where: { id: memberId },
    data: { ...data, updated_at: new Date() },
  });
}

/**
 * Delete a member
 */
export async function deleteMember(memberId: string): Promise<void> {
  await prisma.member.delete({ where: { id: memberId } });
}

export async function getMemberByUserId(userId: string): Promise<Member | null> {
  return prisma.member.findFirst({ where: { user_id: userId } });
}
