import prisma from "@/lib/prisma";
import type {
  Participant,
  CompetitionParticipant,
  Competition,
} from "@/lib/generated/prisma";

export interface EventRegistrationData {
  name: string;
  institution: string;
  class: number;
  id_at_institution: string;
  email: string;
  phone: string;
  note?: string;
  competitions: string[]; // Array of competition IDs
  transaction_id?: string;
  payment_provider?: string;
}

export type ParticipantWithRegistrations = {
  participant: Participant;
  registrations: (CompetitionParticipant & { competition: Competition })[];
};

/**
 * Create a new participant and register them for competitions atomically
 */
export async function registerForEvent(
  data: EventRegistrationData
): Promise<{ participant: Participant; registrations: CompetitionParticipant[] }> {
  return prisma.$transaction(async (tx) => {
    const participant = await tx.participant.create({
      data: {
        name: data.name,
        institution: data.institution,
        class: data.class,
        id_at_institution: data.id_at_institution,
        email: data.email,
        phone: data.phone,
        note: data.note || "",
        transaction_id: data.transaction_id,
        payment_provider: data.payment_provider,
      },
    });

    await tx.competitionParticipant.createMany({
      data: data.competitions.map((competitionId) => ({
        competition_id: competitionId,
        participant_id: participant.id,
        status: "pending",
      })),
    });

    const registrations = await tx.competitionParticipant.findMany({
      where: { participant_id: participant.id },
    });

    return { participant, registrations };
  });
}

/**
 * Check if a participant with the same email or student ID already exists for the same institution
 */
export async function checkExistingParticipant(
  email: string,
  idAtInstitution: string,
  institution: string
): Promise<Participant | null> {
  return prisma.participant.findFirst({
    where: {
      OR: [
        { email },
        {
          id_at_institution: idAtInstitution,
          institution,
        },
      ],
    },
  });
}

/**
 * Get detailed participants data for an event with all their registrations grouped by participant
 */
export async function getEventParticipantsDetailed(
  eventId: string
): Promise<ParticipantWithRegistrations[]> {
  // First get all competition IDs for this event
  const competitions = await prisma.competition.findMany({
    where: { event_id: eventId },
    select: { id: true },
  });

  const competitionIds = competitions.map((c) => c.id);

  if (competitionIds.length === 0) {
    return [];
  }

  // Get all registrations for these competitions with participant and competition data
  const registrations = await prisma.competitionParticipant.findMany({
    where: { competition_id: { in: competitionIds } },
    include: {
      participant: true,
      competition: true,
    },
    orderBy: { created_at: "desc" },
  });

  // Group by participant ID
  const participantsMap = new Map<string, ParticipantWithRegistrations>();

  for (const registration of registrations) {
    const participantId = registration.participant_id;

    if (!participantsMap.has(participantId)) {
      participantsMap.set(participantId, {
        participant: registration.participant,
        registrations: [],
      });
    }

    participantsMap.get(participantId)!.registrations.push({
      id: registration.id,
      competition_id: registration.competition_id,
      participant_id: registration.participant_id,
      team_id: registration.team_id,
      status: registration.status,
      created_at: registration.created_at,
      updated_at: registration.updated_at,
      competition: registration.competition,
    });
  }

  return Array.from(participantsMap.values());
}

/**
 * Update a single participant's registration status
 */
export async function updateParticipantStatus(
  registrationId: string,
  status: string
): Promise<CompetitionParticipant> {
  return prisma.competitionParticipant.update({
    where: { id: registrationId },
    data: {
      status,
      updated_at: new Date(),
    },
  });
}

/**
 * Update all registration statuses for a participant across an event's competitions
 */
export async function updateAllParticipantStatuses(
  participantId: string,
  eventId: string,
  status: string
): Promise<number> {
  // Get competition IDs for this event
  const competitions = await prisma.competition.findMany({
    where: { event_id: eventId },
    select: { id: true },
  });

  const competitionIds = competitions.map((c) => c.id);

  const result = await prisma.competitionParticipant.updateMany({
    where: {
      participant_id: participantId,
      competition_id: { in: competitionIds },
    },
    data: {
      status,
      updated_at: new Date(),
    },
  });

  return result.count;
}
