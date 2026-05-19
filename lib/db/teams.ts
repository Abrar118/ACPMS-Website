import prisma from "@/lib/prisma";
import type { Team, TeamMember, Participant } from "@/lib/generated/prisma";

export type { Team, TeamMember };

export type TeamWithMembers = Team & {
  members: (TeamMember & { participant: Participant })[];
};

export interface CreateTeamData {
  name: string;
  institution: string;
}

export interface AddTeamMemberData {
  team_id: string;
  participant_id: string;
  role?: string;
}

export async function createTeam(data: CreateTeamData): Promise<Team> {
  const now = new Date();
  return prisma.team.create({
    data: {
      name: data.name,
      institution: data.institution,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getTeamById(teamId: string): Promise<TeamWithMembers | null> {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { participant: true },
      },
    },
  });
}

export async function getTeamsByCompetition(
  competitionId: string
): Promise<TeamWithMembers[]> {
  const registrations = await prisma.competitionParticipant.findMany({
    where: { competition_id: competitionId, team_id: { not: null } },
    select: { team_id: true },
    distinct: ["team_id"],
  });

  const teamIds = registrations
    .map((r) => r.team_id)
    .filter((id): id is string => id !== null);

  if (teamIds.length === 0) return [];

  return prisma.team.findMany({
    where: { id: { in: teamIds } },
    include: {
      members: {
        include: { participant: true },
      },
    },
  });
}

export async function addTeamMember(data: AddTeamMemberData): Promise<TeamMember> {
  return prisma.teamMember.create({
    data: {
      team_id: data.team_id,
      participant_id: data.participant_id,
      role: data.role ?? "member",
    },
  });
}

export async function removeTeamMember(
  teamId: string,
  participantId: string
): Promise<void> {
  await prisma.teamMember.deleteMany({
    where: { team_id: teamId, participant_id: participantId },
  });
}

export async function updateTeam(
  teamId: string,
  data: Partial<CreateTeamData>
): Promise<Team> {
  return prisma.team.update({
    where: { id: teamId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.institution !== undefined && { institution: data.institution }),
      updated_at: new Date(),
    },
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await prisma.team.delete({ where: { id: teamId } });
}
