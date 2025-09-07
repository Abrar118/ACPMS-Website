import { notFound } from "next/navigation";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import { getEventById } from "@/queries/events";
import { getEventCompetitions } from "@/queries/competitions";
import { getEventParticipantsDetailed } from "@/queries/participants";
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

  const supabase = await createSupabaseServer();

  // Fetch event data
  const eventResult = await getEventById(supabase, eventId);
  if (eventResult.error || !eventResult.data) {
    notFound();
  }

  // Fetch competitions for this event
  const competitionsResult = await getEventCompetitions(supabase, eventId);
  if (competitionsResult.error) {
    console.error("Error fetching competitions:", competitionsResult.error);
  }

  // Fetch participants for this event
  const participantsResult = await getEventParticipantsDetailed(supabase, eventId);
  if (participantsResult.error) {
    console.error("Error fetching participants:", participantsResult.error);
  }

  return (
    <EventParticipantsClient
      event={eventResult.data}
      competitions={competitionsResult.data || []}
      participants={participantsResult.data || []}
      error={participantsResult.error || undefined}
    />
  );
}
