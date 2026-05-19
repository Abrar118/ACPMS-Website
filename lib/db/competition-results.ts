import prisma from "@/lib/prisma";
import { Prisma, type CompetitionResult, type Participant, type Team } from "@/lib/generated/prisma";

export type { CompetitionResult };

export type ResultWithDetails = CompetitionResult & {
  participant: Participant | null;
  team: Team | null;
};

export interface CreateResultData {
  competition_id: string;
  participant_id?: string;
  team_id?: string;
  score?: number;
  rank?: number;
  certificate_url?: string;
  remarks?: string;
}

export async function createResult(data: CreateResultData): Promise<CompetitionResult> {
  const now = new Date();
  return prisma.competitionResult.create({
    data: {
      competition_id: data.competition_id,
      participant_id: data.participant_id ?? null,
      team_id: data.team_id ?? null,
      score: data.score != null ? new Prisma.Decimal(data.score) : null,
      rank: data.rank ?? null,
      certificate_url: data.certificate_url ?? null,
      remarks: data.remarks ?? null,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getResultsByCompetition(
  competitionId: string
): Promise<ResultWithDetails[]> {
  return prisma.competitionResult.findMany({
    where: { competition_id: competitionId },
    include: { participant: true, team: true },
    orderBy: { rank: "asc" },
  });
}

export async function getResultsByParticipant(
  participantId: string
): Promise<ResultWithDetails[]> {
  return prisma.competitionResult.findMany({
    where: { participant_id: participantId },
    include: { participant: true, team: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getResultsByTeam(
  teamId: string
): Promise<ResultWithDetails[]> {
  return prisma.competitionResult.findMany({
    where: { team_id: teamId },
    include: { participant: true, team: true },
    orderBy: { created_at: "desc" },
  });
}

export async function updateResult(
  resultId: string,
  data: Partial<Omit<CreateResultData, "competition_id">>
): Promise<CompetitionResult> {
  return prisma.competitionResult.update({
    where: { id: resultId },
    data: {
      ...(data.participant_id !== undefined && { participant_id: data.participant_id ?? null }),
      ...(data.team_id !== undefined && { team_id: data.team_id ?? null }),
      ...(data.score !== undefined && {
        score: data.score != null ? new Prisma.Decimal(data.score) : null,
      }),
      ...(data.rank !== undefined && { rank: data.rank ?? null }),
      ...(data.certificate_url !== undefined && { certificate_url: data.certificate_url ?? null }),
      ...(data.remarks !== undefined && { remarks: data.remarks ?? null }),
      updated_at: new Date(),
    },
  });
}

export async function deleteResult(resultId: string): Promise<void> {
  await prisma.competitionResult.delete({ where: { id: resultId } });
}

export async function bulkCreateResults(
  results: CreateResultData[]
): Promise<number> {
  const now = new Date();
  const result = await prisma.competitionResult.createMany({
    data: results.map((r) => ({
      competition_id: r.competition_id,
      participant_id: r.participant_id ?? null,
      team_id: r.team_id ?? null,
      score: r.score != null ? new Prisma.Decimal(r.score) : null,
      rank: r.rank ?? null,
      certificate_url: r.certificate_url ?? null,
      remarks: r.remarks ?? null,
      created_at: now,
      updated_at: now,
    })),
  });
  return result.count;
}
