import prisma from "@/lib/prisma";
import { Prisma, type Competition } from "@/lib/generated/prisma";

export type { Competition };

export interface CreateCompetitionData {
  event_id: string;
  title: string;
  description?: unknown;
  fee?: number;
  display_order: number;
  is_published?: boolean;
}

// Get all competitions for an event, ordered by display_order ascending
export async function getEventCompetitions(
  eventId: string
): Promise<Competition[]> {
  return prisma.competition.findMany({
    where: { event_id: eventId },
    orderBy: { display_order: "asc" },
  });
}

// Create a new competition
export async function createCompetition(
  data: CreateCompetitionData
): Promise<Competition> {
  const now = new Date();

  return prisma.competition.create({
    data: {
      event_id: data.event_id,
      title: data.title,
      description: (data.description as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      fee: data.fee ?? 0,
      display_order: data.display_order,
      is_published: data.is_published ?? false,
      created_at: now,
      updated_at: now,
    },
  });
}

// Partial update of a competition
export async function updateCompetition(
  competitionId: string,
  data: Partial<Omit<CreateCompetitionData, "event_id">>
): Promise<Competition> {
  const updateData: Parameters<typeof prisma.competition.update>[0]["data"] = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined)
    updateData.description = (data.description as Prisma.InputJsonValue) ?? Prisma.JsonNull;
  if (data.fee !== undefined) updateData.fee = data.fee;
  if (data.display_order !== undefined)
    updateData.display_order = data.display_order;
  if (data.is_published !== undefined)
    updateData.is_published = data.is_published;

  return prisma.competition.update({
    where: { id: competitionId },
    data: updateData,
  });
}

// Hard delete a competition
export async function deleteCompetition(competitionId: string): Promise<void> {
  await prisma.competition.delete({
    where: { id: competitionId },
  });
}

// Atomically update display_order for multiple competitions
export async function updateCompetitionOrder(
  competitions: { id: string; display_order: number }[]
): Promise<void> {
  await prisma.$transaction(
    competitions.map((comp) =>
      prisma.competition.update({
        where: { id: comp.id },
        data: {
          display_order: comp.display_order,
          updated_at: new Date(),
        },
      })
    )
  );
}

// Toggle competition published status
export async function toggleCompetitionStatus(
  competitionId: string,
  isPublished: boolean
): Promise<Competition> {
  return prisma.competition.update({
    where: { id: competitionId },
    data: {
      is_published: isPublished,
      updated_at: new Date(),
    },
  });
}
