import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublishedEventById } from "@/lib/db/events";
import { getEventCompetitions } from "@/lib/db/competitions";
import { Skeleton } from "@/components/ui/skeleton";
import EventDetailClient from "@/components/events/EventDetailClient";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublishedEventById(id);

  if (!event) {
    return {
      title: "Event Not Found",
      description: "The requested event could not be found.",
    };
  }

  return {
    title: `${event.title} | ACPSCM Events`,
    description: typeof event.description === 'string'
      ? event.description.substring(0, 160)
      : "Join this exciting ACPSCM event",
    openGraph: {
      title: event.title,
      description: typeof event.description === 'string'
        ? event.description.substring(0, 160)
        : "Join this exciting ACPSCM event",
      images: event.poster_url ? [event.poster_url] : [],
    },
  };
}

async function EventDetail({ eventId }: { eventId: string }) {
  // Fetch event details and competitions in parallel
  const [event, competitions] = await Promise.all([
    getPublishedEventById(eventId),
    getEventCompetitions(eventId),
  ]);

  if (!event) {
    notFound();
  }

  // Serialize dates for client component and filter to published competitions
  const serializedEvent = JSON.parse(JSON.stringify(event));
  const serializedCompetitions = JSON.parse(
    JSON.stringify(competitions.filter((comp) => comp.is_published))
  );

  return (
    <EventDetailClient
      event={serializedEvent}
      competitions={serializedCompetitions}
    />
  );
}

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Poster skeleton */}
        <Skeleton className="w-full h-64 md:h-96 rounded-lg mb-8" />
        
        {/* Title skeleton */}
        <Skeleton className="h-12 w-3/4 mb-4" />
        
        {/* Meta info skeleton */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-4 mb-12">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        {/* Competitions skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetail eventId={id} />
    </Suspense>
  );
}
