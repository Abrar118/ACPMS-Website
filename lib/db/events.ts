import prisma from "@/lib/prisma";
import { Prisma, type Event, type Competition } from "@/lib/generated/prisma";

export type { Event };

export interface CreateEventData {
  title: string;
  description?: unknown;
  event_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
  registration_deadline?: string | null;
  event_type?: string | null;
  event_mode?: string;
  poster_url?: string | null;
  tags?: string[];
}

export type EventWithCompetitions = Event & {
  competitions: Competition[];
};

// Get all published events ordered by event_date ascending
export async function getPublishedEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    where: { is_published: true },
    orderBy: { event_date: "asc" },
  });
}

// Get published events filtered by event_type
export async function getEventsByType(eventType: string): Promise<Event[]> {
  return prisma.event.findMany({
    where: {
      is_published: true,
      event_type: eventType,
    },
    orderBy: { event_date: "asc" },
  });
}

// Get upcoming published events (event_date >= today)
export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.event.findMany({
    where: {
      is_published: true,
      event_date: { gte: today },
    },
    orderBy: { event_date: "asc" },
  });
}

// Get upcoming events with pagination
export async function getUpcomingEventsPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<{ events: Event[]; total: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where = {
    is_published: true,
    event_date: { gte: today },
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { event_date: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total };
}

// Get past published events (event_date < today), ordered descending, limited
export async function getPastEvents(limit: number = 6): Promise<Event[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.event.findMany({
    where: {
      is_published: true,
      event_date: { lt: today },
    },
    orderBy: { event_date: "desc" },
    take: limit,
  });
}

// Get past events with pagination
export async function getPastEventsPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<{ events: Event[]; total: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where = {
    is_published: true,
    event_date: { lt: today },
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { event_date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total };
}

// Get a single published event by ID (public)
export async function getPublishedEventById(
  eventId: string
): Promise<Event | null> {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      is_published: true,
    },
  });
}

// Get any event by ID (admin)
export async function getEventById(eventId: string): Promise<Event | null> {
  return prisma.event.findUnique({
    where: { id: eventId },
  });
}

// Get event with competitions included, ordered by display_order
export async function getEventWithCompetitions(
  eventId: string
): Promise<EventWithCompetitions | null> {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      competitions: {
        orderBy: { display_order: "asc" },
      },
    },
  });
}

// Get all events for admin, ordered by created_at descending
export async function getAllEventsAdmin(): Promise<Event[]> {
  return prisma.event.findMany({
    orderBy: { created_at: "desc" },
  });
}

// Create a new event (starts as unpublished)
export async function createEvent(
  userId: string,
  data: CreateEventData
): Promise<Event> {
  const now = new Date();

  return prisma.event.create({
    data: {
      title: data.title,
      description: (data.description as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      event_date: data.event_date ? new Date(data.event_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      venue: data.venue ?? null,
      registration_deadline: data.registration_deadline
        ? new Date(data.registration_deadline)
        : null,
      event_type: data.event_type ?? null,
      event_mode: data.event_mode ?? "In Person",
      poster_url: data.poster_url ?? null,
      tags: data.tags ?? [],
      created_by: userId,
      is_published: false,
      created_at: now,
      updated_at: now,
    },
  });
}

// Update an existing event (partial update)
export async function updateEvent(
  eventId: string,
  data: Partial<CreateEventData>
): Promise<Event> {
  const updateData: Parameters<typeof prisma.event.update>[0]["data"] = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined)
    updateData.description = (data.description as Prisma.InputJsonValue) ?? Prisma.JsonNull;
  if (data.event_date !== undefined)
    updateData.event_date = data.event_date ? new Date(data.event_date) : null;
  if (data.end_date !== undefined)
    updateData.end_date = data.end_date ? new Date(data.end_date) : null;
  if (data.venue !== undefined) updateData.venue = data.venue ?? null;
  if (data.registration_deadline !== undefined)
    updateData.registration_deadline = data.registration_deadline
      ? new Date(data.registration_deadline)
      : null;
  if (data.event_type !== undefined)
    updateData.event_type = data.event_type ?? null;
  if (data.event_mode !== undefined) updateData.event_mode = data.event_mode;
  if (data.poster_url !== undefined)
    updateData.poster_url = data.poster_url ?? null;
  if (data.tags !== undefined) updateData.tags = data.tags ?? [];

  return prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });
}

// Hard delete an event
export async function deleteEvent(eventId: string): Promise<void> {
  await prisma.event.delete({
    where: { id: eventId },
  });
}

// Toggle event published status
export async function toggleEventStatus(
  eventId: string,
  isPublished: boolean
): Promise<Event> {
  return prisma.event.update({
    where: { id: eventId },
    data: {
      is_published: isPublished,
      updated_at: new Date(),
    },
  });
}

export async function getClubStats() {
  const [memberCount, eventCount, competitionCount, resourceCount] = await Promise.all([
    prisma.member.count(),
    prisma.event.count({ where: { is_published: true } }),
    prisma.competition.count({ where: { is_published: true } }),
    prisma.resource.count({ where: { status: "Published", is_archived: false } }),
  ]);
  return { memberCount, eventCount, competitionCount, resourceCount };
}

export async function getNextOrLatestEvent(): Promise<Event | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = await prisma.event.findFirst({
    where: { is_published: true, event_date: { gte: today } },
    orderBy: { event_date: "asc" },
  });
  if (upcoming) return upcoming;

  return prisma.event.findFirst({
    where: { is_published: true },
    orderBy: { event_date: "desc" },
  });
}

// Highlights: latest published event, most-viewed published resource, latest published magazine
export async function getHighlights(): Promise<{
  event: Awaited<ReturnType<typeof prisma.event.findFirst>>;
  resource: Awaited<ReturnType<typeof prisma.resource.findFirst>>;
  magazine: Awaited<ReturnType<typeof prisma.magazine.findFirst>>;
} | null> {
  const [event, resource, magazine] = await Promise.all([
    prisma.event.findFirst({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.resource.findFirst({
      where: {
        status: "Published",
        is_archived: false,
      },
      orderBy: { view_count: "desc" },
    }),
    prisma.magazine.findFirst({
      where: { is_published: 1 },
      orderBy: { published_date: "desc" },
    }),
  ]);

  if (!event && !resource && !magazine) {
    return null;
  }

  return { event, resource, magazine };
}
