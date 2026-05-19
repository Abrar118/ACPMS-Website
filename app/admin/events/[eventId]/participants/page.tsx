import { notFound } from "next/navigation";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import { getEventById } from "@/lib/db/events";
import { getEventCompetitions } from "@/lib/db/competitions";
import { getEventParticipantsDetailed } from "@/lib/db/participants";
import EventParticipantsClient from "@/components/events/admin/EventParticipantsClient";


interface EventParticipantsPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventParticipantsPage({
  params,
}: EventParticipantsPageProps) {
  // Await params in Next.js 15+
  const { eventId } = await params;

  // Check if user is authenticated and has admin/executive permissions
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    notFound();
  }

  if (!(await isAdminOrExecutive())) {
    notFound();
  }

  // Fetch event, competitions, and participants in parallel
  const [event, competitions, participants] = await Promise.all([
    getEventById(eventId),
    getEventCompetitions(eventId),
    getEventParticipantsDetailed(eventId),
  ]);

  if (!event) {
    notFound();
  }

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify({ event, competitions, participants }));

  return (
    <EventParticipantsClient
      event={serialized.event}
      competitions={serialized.competitions}
      participants={serialized.participants}
    />
  );
}
