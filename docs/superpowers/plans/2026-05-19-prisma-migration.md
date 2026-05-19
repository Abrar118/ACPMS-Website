# Prisma Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all Supabase SDK database queries with Prisma ORM while keeping Supabase Auth and Storage unchanged.

**Architecture:** Prisma Client connects to the existing Supabase PostgreSQL database. Server components and server actions use Prisma directly. React Query is kept only for client-side mutations/optimistic UI. The `@supabase-cache-helpers/postgrest-react-query` package is removed entirely.

**Tech Stack:** Prisma ORM, Next.js 15 App Router, Supabase Auth (`@supabase/ssr`), Supabase Storage, React Query v5 (client-only)

---

## File Structure

### New files to create:
- `prisma/schema.prisma` — Prisma schema mirroring all 8 tables
- `lib/prisma.ts` — Singleton Prisma Client instance
- `lib/db/users.ts` — User profile queries (replaces `queries/auth.ts`)
- `lib/db/events.ts` — Event queries (replaces `queries/events.ts`)
- `lib/db/competitions.ts` — Competition queries (replaces `queries/competitions.ts`)
- `lib/db/participants.ts` — Participant/registration queries (replaces `queries/participants.ts`)
- `lib/db/members.ts` — Member queries (replaces `queries/members.ts`)
- `lib/db/resources.ts` — Resource queries (replaces `queries/resources.ts`)
- `lib/db/magazines.ts` — Magazine queries (new, currently inline)
- `lib/db/profile.ts` — Profile update queries (replaces `queries/profile.ts`)

### Files to modify:
- `lib/auth-server.ts` — Switch profile lookup from Supabase to Prisma
- `actions/auth.ts` — Switch `createUser` call to Prisma
- `actions/events.ts` — Switch to Prisma queries
- `actions/competitions.ts` — Switch to Prisma queries
- `actions/registration.ts` — Switch to Prisma with `$transaction`
- `actions/participants.ts` — Switch to Prisma queries
- `actions/members.ts` — Switch to Prisma queries
- `actions/resources.ts` — Switch to Prisma queries
- `actions/profile.ts` — Switch profile update to Prisma (keep Supabase Storage)
- `components/events/EventsClient.tsx` — Remove supabase-cache-helpers, use server data
- `components/events/admin/EventParticipants.tsx` — Switch from React Query + Supabase to server data
- `components/profile/PersonalInformation.tsx` — Switch mutation to server action
- `components/home/ClubHighlights.tsx` — Use server-fetched data
- `app/events/page.tsx` — Fetch data server-side with Prisma
- `app/events/[id]/page.tsx` — Fetch data server-side with Prisma
- `app/about/page.tsx` — Fetch members server-side with Prisma
- `app/resources/page.tsx` — Fetch resources server-side with Prisma
- `app/admin/events/page.tsx` — Fetch data server-side with Prisma
- `app/admin/members/page.tsx` — Fetch data server-side with Prisma
- `app/admin/resources/page.tsx` — Fetch data server-side with Prisma
- `package.json` — Add prisma deps, remove `@supabase-cache-helpers/postgrest-react-query`

### Files to delete (after migration complete):
- `queries/auth.ts`
- `queries/events.ts`
- `queries/competitions.ts`
- `queries/participants.ts`
- `queries/members.ts`
- `queries/resources.ts`
- `queries/profile.ts`
- `utils/query-response.ts`
- `utils/types.ts`
- `database.types.ts`

### Files kept unchanged:
- `utils/supabase/supabase-server.ts` — Still needed for auth + storage
- `utils/supabase/supabase-browser.ts` — Still needed for auth on client
- `utils/supabase/middleware.ts` — Session management unchanged
- `middleware.ts` — Route protection unchanged
- `components/ReactQueryClientProvider.tsx` — Kept for remaining client-side queries

---

### Task 1: Install Prisma and Introspect Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Modify: `package.json`
- Modify: `.env.local` (add DATABASE_URL)

- [ ] **Step 1: Install Prisma dependencies**

Run:
```bash
npm install @prisma/client && npm install -D prisma
```

Expected: Both packages install successfully

- [ ] **Step 2: Initialize Prisma**

Run:
```bash
npx prisma init --datasource-provider postgresql
```

Expected: Creates `prisma/schema.prisma` and updates `.env`

- [ ] **Step 3: Configure environment variables**

Add to `.env.local` (get connection strings from Supabase Dashboard → Settings → Database):
```
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

- [ ] **Step 4: Introspect the existing database**

Run:
```bash
npx prisma db pull
```

Expected: `prisma/schema.prisma` is populated with models matching the 8 Supabase tables

- [ ] **Step 5: Clean up the generated schema**

Replace the generated `prisma/schema.prisma` with a cleaned-up version that has proper naming, relations, and enums:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model UserProfile {
  id                 String    @id @default(uuid())
  email              String
  name               String
  ssc_batch          String
  role               String?
  status             String?
  executive_position String?
  profile_image      String?
  created_at         DateTime? @default(now())
  updated_at         DateTime? @default(now())

  events_created Event[]    @relation("EventCreator")
  resources_created Resource[] @relation("ResourceCreator")
  magazines_created Magazine[] @relation("MagazineCreator")

  @@map("user_profiles")
}

model Event {
  id                    String    @id @default(uuid())
  title                 String
  description           Json?
  event_date            DateTime?
  end_date              DateTime?
  venue                 String?
  registration_deadline DateTime?
  is_published          Boolean   @default(false)
  event_mode            String
  event_type            String?
  created_by            String?
  poster_url            String?
  tags                  String[]
  created_at            DateTime? @default(now())
  updated_at            DateTime? @default(now())

  creator      UserProfile?  @relation("EventCreator", fields: [created_by], references: [id])
  competitions Competition[]

  @@map("events")
}

model Competition {
  id            String   @id @default(uuid())
  event_id      String
  title         String
  description   Json?
  fee           Float    @default(0)
  display_order Int
  is_published  Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())

  event        Event                    @relation(fields: [event_id], references: [id], onDelete: Cascade)
  participants CompetitionParticipant[]

  @@map("competitions")
}

model Participant {
  id                String   @id @default(uuid())
  name              String
  institution       String
  class             Int
  id_at_institution String
  email             String?
  phone             String?
  note              String   @default("")
  transaction_id    String?
  payment_provider  String?
  created_at        DateTime @default(now())
  updated_at        DateTime @default(now())

  registrations CompetitionParticipant[]

  @@map("participants")
}

model CompetitionParticipant {
  id             String   @id @default(uuid())
  competition_id String
  participant_id String
  status         String
  created_at     DateTime @default(now())
  updated_at     DateTime @default(now())

  competition Competition @relation(fields: [competition_id], references: [id], onDelete: Cascade)
  participant Participant @relation(fields: [participant_id], references: [id], onDelete: Cascade)

  @@map("competitions_participants")
}

model Member {
  id                String   @id @default(uuid())
  name              String
  designation       String
  position          String?
  session           String?
  bio               String?
  image_url         String?
  email             String?
  phone             String?
  facebook_id_link  String?
  instagram_id_link String?
  linkedin_id_link  String?
  created_at        DateTime @default(now())
  updated_at        DateTime @default(now())

  @@map("members")
}

model Resource {
  id            String   @id @default(uuid())
  title         String
  description   String?
  category      String?
  resource_type String
  resource_url  String?
  author        String?
  status        String   @default("Draft")
  is_featured   Boolean  @default(false)
  is_archived   Boolean  @default(false)
  levels        String[]
  tags          String[]
  view_count    Int?     @default(0)
  created_by    String?
  created_at    DateTime? @default(now())
  updated_at    DateTime? @default(now())

  creator UserProfile? @relation("ResourceCreator", fields: [created_by], references: [id])

  @@map("resources")
}

model Magazine {
  id             String    @id @default(uuid())
  title          String
  summary        String?
  volume         Int?
  issue          Int?
  pdf_url        String?
  cover_image    String?
  published_date DateTime?
  is_published   Int?
  is_archived    Boolean?
  language       String?
  doi            String?
  download_count Int?
  access_level   String?
  chief_patron   String?
  tags           String[]
  created_by     String?
  created_at     DateTime? @default(now())
  updated_at     DateTime? @default(now())

  creator UserProfile? @relation("MagazineCreator", fields: [created_by], references: [id])

  @@map("magazines")
}
```

- [ ] **Step 6: Generate Prisma Client**

Run:
```bash
npx prisma generate
```

Expected: Prisma Client generated successfully

- [ ] **Step 7: Create the Prisma singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

- [ ] **Step 8: Verify connection**

Create a temporary test script and run it:

Run:
```bash
npx tsx -e "import prisma from './lib/prisma'; async function main() { const count = await prisma.userProfile.count(); console.log('User count:', count); } main().then(() => process.exit(0));"
```

Expected: Prints the number of users in the database without errors

- [ ] **Step 9: Commit**

```bash
git add prisma/ lib/prisma.ts package.json package-lock.json
git commit -m "feat: add Prisma ORM with introspected schema from Supabase PostgreSQL"
```

---

### Task 2: Create User/Auth Database Queries with Prisma

**Files:**
- Create: `lib/db/users.ts`
- Modify: `lib/auth-server.ts`

- [ ] **Step 1: Create `lib/db/users.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { UserProfile } from "@prisma/client";

export type { UserProfile };

export async function getAllUsers(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getApprovedUsers(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: { status: "approved" },
    orderBy: { created_at: "desc" },
  });
}

export async function getExecutives(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: { role: "executive", status: "approved" },
    orderBy: { executive_position: "asc" },
  });
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  return prisma.userProfile.findUnique({
    where: { id: userId },
  });
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  return prisma.userProfile.findFirst({
    where: { email },
  });
}

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

export async function updateUser(
  userId: string,
  data: Partial<Pick<UserProfile, "name" | "ssc_batch" | "role" | "status" | "executive_position" | "profile_image">>
): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
}

export async function updateUserStatus(userId: string, status: string | null): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: { status, updated_at: new Date() },
  });
}

export async function updateUserRole(
  userId: string,
  role: string | null,
  executivePosition?: string | null
): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: {
      role,
      executive_position: role === "executive" ? executivePosition : null,
      updated_at: new Date(),
    },
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.userProfile.delete({
    where: { id: userId },
  });
}

export async function getPendingUsers(): Promise<UserProfile[]> {
  return prisma.userProfile.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "desc" },
  });
}

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
```

- [ ] **Step 2: Update `lib/auth-server.ts` to use Prisma for profile lookup**

Replace the full file with:

```typescript
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { getUserById } from "@/lib/db/users";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@prisma/client";
import { printIfDev } from "./utils";

export interface AuthData {
  user: User | null;
  profile: UserProfile | null;
}

export async function getCurrentUser(): Promise<AuthData> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, profile: null };
    }

    printIfDev("Current user: " + JSON.stringify(user));

    const profile = await getUserById(user.id);

    if (!profile) {
      printIfDev("No profile found for user: " + user.id);
      return { user, profile: null };
    }

    return { user, profile };
  } catch (error) {
    printIfDev("Error getting current user: " + error);
    return { user: null, profile: null };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getCurrentUser();
  return !!user;
}

export async function hasRole(role: string): Promise<boolean> {
  const { profile } = await getCurrentUser();
  return profile?.role === role;
}

export async function isAdminOrExecutive(): Promise<boolean> {
  const { profile } = await getCurrentUser();
  return profile?.role === "admin" || profile?.role === "executive";
}
```

- [ ] **Step 3: Verify the app still loads**

Run:
```bash
npm run build
```

Expected: Build succeeds (auth-server.ts imports resolve, types match)

- [ ] **Step 4: Commit**

```bash
git add lib/db/users.ts lib/auth-server.ts
git commit -m "feat: add Prisma user queries and update auth-server to use Prisma"
```

---

### Task 3: Create Event and Competition Database Queries

**Files:**
- Create: `lib/db/events.ts`
- Create: `lib/db/competitions.ts`

- [ ] **Step 1: Create `lib/db/events.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Event, Competition } from "@prisma/client";

export type { Event };
export type EventWithCompetitions = Event & { competitions: Competition[] };

export async function getPublishedEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    where: { is_published: true },
    orderBy: { event_date: "asc" },
  });
}

export async function getEventsByType(eventType: string): Promise<Event[]> {
  return prisma.event.findMany({
    where: { is_published: true, event_type: eventType },
    orderBy: { event_date: "asc" },
  });
}

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

export async function getUpcomingEventsPaginated(page: number = 1, pageSize: number = 10): Promise<{ events: Event[]; total: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const where = { is_published: true, event_date: { gte: today } };

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

export async function getPastEventsPaginated(page: number = 1, pageSize: number = 10): Promise<{ events: Event[]; total: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const where = { is_published: true, event_date: { lt: today } };

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

export async function getPublishedEventById(eventId: string): Promise<Event | null> {
  return prisma.event.findFirst({
    where: { id: eventId, is_published: true },
  });
}

export async function getEventById(eventId: string): Promise<Event | null> {
  return prisma.event.findUnique({
    where: { id: eventId },
  });
}

export async function getEventWithCompetitions(eventId: string): Promise<EventWithCompetitions | null> {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: { competitions: { orderBy: { display_order: "asc" } } },
  });
}

export async function getAllEventsAdmin(): Promise<Event[]> {
  return prisma.event.findMany({
    orderBy: { created_at: "desc" },
  });
}

export interface CreateEventData {
  title: string;
  description?: any;
  event_date?: string;
  end_date?: string;
  venue?: string;
  registration_deadline?: string;
  event_type?: string;
  event_mode?: string;
  poster_url?: string;
  tags?: string[];
}

export async function createEvent(userId: string, data: CreateEventData): Promise<Event> {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      event_date: data.event_date ? new Date(data.event_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      venue: data.venue ?? null,
      registration_deadline: data.registration_deadline ? new Date(data.registration_deadline) : null,
      event_type: data.event_type ?? null,
      event_mode: data.event_mode ?? "In Person",
      poster_url: data.poster_url ?? null,
      tags: data.tags ?? [],
      created_by: userId,
      is_published: false,
    },
  });
}

export async function updateEvent(eventId: string, data: Partial<CreateEventData>): Promise<Event> {
  return prisma.event.update({
    where: { id: eventId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.event_date !== undefined && { event_date: data.event_date ? new Date(data.event_date) : null }),
      ...(data.end_date !== undefined && { end_date: data.end_date ? new Date(data.end_date) : null }),
      ...(data.venue !== undefined && { venue: data.venue ?? null }),
      ...(data.registration_deadline !== undefined && { registration_deadline: data.registration_deadline ? new Date(data.registration_deadline) : null }),
      ...(data.event_type !== undefined && { event_type: data.event_type ?? null }),
      ...(data.event_mode !== undefined && { event_mode: data.event_mode }),
      ...(data.poster_url !== undefined && { poster_url: data.poster_url ?? null }),
      ...(data.tags !== undefined && { tags: data.tags ?? [] }),
      updated_at: new Date(),
    },
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  await prisma.event.delete({
    where: { id: eventId },
  });
}

export async function toggleEventStatus(eventId: string, isPublished: boolean): Promise<Event> {
  return prisma.event.update({
    where: { id: eventId },
    data: { is_published: isPublished, updated_at: new Date() },
  });
}

export async function getHighlights() {
  const [event, resource, magazine] = await Promise.all([
    prisma.event.findFirst({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.resource.findFirst({
      where: { status: "Published", is_archived: false },
      orderBy: { view_count: "desc" },
    }),
    prisma.magazine.findFirst({
      where: { is_published: 1 },
      orderBy: { published_date: "desc" },
    }),
  ]);

  if (!event && !resource && !magazine) return null;

  return { event, resource, magazine };
}
```

- [ ] **Step 2: Create `lib/db/competitions.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Competition } from "@prisma/client";

export type { Competition };

export async function getEventCompetitions(eventId: string): Promise<Competition[]> {
  return prisma.competition.findMany({
    where: { event_id: eventId },
    orderBy: { display_order: "asc" },
  });
}

export async function createCompetition(data: {
  event_id: string;
  title: string;
  description?: any;
  fee?: number;
  display_order: number;
  is_published?: boolean;
}): Promise<Competition> {
  return prisma.competition.create({ data });
}

export async function updateCompetition(
  competitionId: string,
  data: Partial<{
    title: string;
    description: any;
    fee: number;
    display_order: number;
    is_published: boolean;
  }>
): Promise<Competition> {
  return prisma.competition.update({
    where: { id: competitionId },
    data: { ...data, updated_at: new Date() },
  });
}

export async function deleteCompetition(competitionId: string): Promise<void> {
  await prisma.competition.delete({
    where: { id: competitionId },
  });
}

export async function updateCompetitionOrder(
  competitions: { id: string; display_order: number }[]
): Promise<void> {
  await prisma.$transaction(
    competitions.map((comp) =>
      prisma.competition.update({
        where: { id: comp.id },
        data: { display_order: comp.display_order, updated_at: new Date() },
      })
    )
  );
}

export async function toggleCompetitionStatus(
  competitionId: string,
  isPublished: boolean
): Promise<Competition> {
  return prisma.competition.update({
    where: { id: competitionId },
    data: { is_published: isPublished, updated_at: new Date() },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/db/events.ts lib/db/competitions.ts
git commit -m "feat: add Prisma event and competition queries"
```

---

### Task 4: Create Participant, Member, Resource, and Profile Queries

**Files:**
- Create: `lib/db/participants.ts`
- Create: `lib/db/members.ts`
- Create: `lib/db/resources.ts`
- Create: `lib/db/profile.ts`

- [ ] **Step 1: Create `lib/db/participants.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Participant, CompetitionParticipant, Competition } from "@prisma/client";

export type { Participant, CompetitionParticipant };

export interface EventRegistrationData {
  name: string;
  institution: string;
  class: number;
  id_at_institution: string;
  email: string;
  phone: string;
  note?: string;
  competitions: string[];
  transaction_id?: string;
  payment_provider?: string;
}

export async function registerForEvent(data: EventRegistrationData) {
  return prisma.$transaction(async (tx) => {
    const participant = await tx.participant.create({
      data: {
        name: data.name,
        institution: data.institution,
        class: data.class,
        id_at_institution: data.id_at_institution,
        email: data.email,
        phone: data.phone,
        note: data.note ?? "",
        transaction_id: data.transaction_id,
        payment_provider: data.payment_provider,
      },
    });

    const registrations = await tx.competitionParticipant.createManyAndReturn({
      data: data.competitions.map((competitionId) => ({
        participant_id: participant.id,
        competition_id: competitionId,
        status: "pending",
      })),
    });

    return { participant, registrations };
  });
}

export async function checkExistingParticipant(
  email: string,
  idAtInstitution: string,
  institution: string
): Promise<Participant | null> {
  return prisma.participant.findFirst({
    where: {
      OR: [
        { email },
        { id_at_institution: idAtInstitution, institution },
      ],
    },
  });
}

export type ParticipantWithRegistrations = {
  participant: Participant;
  registrations: (CompetitionParticipant & { competition: Competition })[];
};

export async function getEventParticipantsDetailed(
  eventId: string
): Promise<ParticipantWithRegistrations[]> {
  const competitions = await prisma.competition.findMany({
    where: { event_id: eventId },
    select: { id: true },
  });

  const competitionIds = competitions.map((c) => c.id);

  if (competitionIds.length === 0) return [];

  const registrations = await prisma.competitionParticipant.findMany({
    where: { competition_id: { in: competitionIds } },
    include: {
      participant: true,
      competition: true,
    },
    orderBy: { created_at: "desc" },
  });

  const participantsMap = new Map<string, ParticipantWithRegistrations>();

  for (const reg of registrations) {
    const pid = reg.participant_id;
    if (!participantsMap.has(pid)) {
      participantsMap.set(pid, {
        participant: reg.participant,
        registrations: [],
      });
    }
    participantsMap.get(pid)!.registrations.push(reg);
  }

  return Array.from(participantsMap.values());
}

export async function updateParticipantStatus(
  registrationId: string,
  status: string
): Promise<CompetitionParticipant> {
  return prisma.competitionParticipant.update({
    where: { id: registrationId },
    data: { status, updated_at: new Date() },
  });
}

export async function updateAllParticipantStatuses(
  participantId: string,
  eventId: string,
  status: string
): Promise<number> {
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
    data: { status, updated_at: new Date() },
  });

  return result.count;
}
```

- [ ] **Step 2: Create `lib/db/members.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Member } from "@prisma/client";

export type { Member };
export type CreateMemberData = Omit<Member, "id" | "created_at" | "updated_at">;
export type UpdateMemberData = Partial<CreateMemberData>;

const DESIGNATION_ORDER = [
  "president",
  "vice president",
  "general secretary",
  "organising secretary",
  "organizing secretary",
];

function sortByDesignation(members: Member[]): Member[] {
  return members.sort((a, b) => {
    const aDesignation = (a.designation || "").toLowerCase().trim();
    const bDesignation = (b.designation || "").toLowerCase().trim();
    const aIndex = DESIGNATION_ORDER.findIndex((d) => aDesignation === d);
    const bIndex = DESIGNATION_ORDER.findIndex((d) => bDesignation === d);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return aDesignation.localeCompare(bDesignation);
  });
}

export async function getAllMembers(): Promise<Member[]> {
  return prisma.member.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getMembersBySession(): Promise<Record<string, Member[]>> {
  const members = await prisma.member.findMany({
    orderBy: [{ session: "desc" }, { position: "asc" }],
  });

  const grouped: Record<string, Member[]> = {};
  for (const member of members) {
    const session = member.session || "Unknown";
    if (!grouped[session]) grouped[session] = [];
    grouped[session].push(member);
  }

  for (const session of Object.keys(grouped)) {
    grouped[session] = sortByDesignation(grouped[session]);
  }

  return grouped;
}

export async function getMembersByDesignation(designation: string): Promise<Member[]> {
  return prisma.member.findMany({
    where: { designation: { contains: designation, mode: "insensitive" } },
    orderBy: { position: "asc" },
  });
}

export async function getFounders(): Promise<Member[]> {
  return getMembersByDesignation("founder");
}

export async function getUniqueSessions(): Promise<string[]> {
  const members = await prisma.member.findMany({
    where: { session: { not: null } },
    select: { session: true },
    distinct: ["session"],
    orderBy: { session: "desc" },
  });

  const sessions = members
    .map((m) => m.session!)
    .sort((a, b) => {
      if (a.toLowerCase() === "moderators") return 1;
      if (b.toLowerCase() === "moderators") return -1;
      return b.localeCompare(a, undefined, { numeric: true });
    });

  return sessions;
}

export async function createMember(data: CreateMemberData): Promise<Member> {
  return prisma.member.create({ data });
}

export async function updateMember(memberId: string, data: UpdateMemberData): Promise<Member> {
  return prisma.member.update({
    where: { id: memberId },
    data: { ...data, updated_at: new Date() },
  });
}

export async function deleteMember(memberId: string): Promise<void> {
  await prisma.member.delete({
    where: { id: memberId },
  });
}
```

- [ ] **Step 3: Create `lib/db/resources.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Resource } from "@prisma/client";

export type { Resource };

export async function createResource(
  userId: string,
  data: {
    title: string;
    description?: string;
    category?: string;
    resourceType: string;
    resourceUrl?: string;
    author?: string;
    status?: string;
    isFeatured?: boolean;
    levels?: { value: string }[];
    tags?: { value: string }[];
  }
): Promise<Resource> {
  return prisma.resource.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      category: data.category ?? null,
      resource_type: data.resourceType,
      resource_url: data.resourceUrl ?? null,
      author: data.author ?? null,
      status: data.status ?? "Draft",
      is_featured: data.isFeatured ?? false,
      is_archived: false,
      levels: data.levels?.map((l) => l.value) ?? [],
      tags: data.tags?.map((t) => t.value) ?? [],
      view_count: 0,
      created_by: userId,
    },
  });
}

export async function getAllResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: { is_archived: false },
    orderBy: { created_at: "desc" },
  });
}

export async function getPublishedResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: { status: "Published", is_archived: false },
    orderBy: { created_at: "desc" },
  });
}

export async function getFeaturedResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: { status: "Published", is_featured: true, is_archived: false },
    orderBy: { created_at: "desc" },
  });
}

export async function getResourceById(resourceId: string): Promise<Resource | null> {
  return prisma.resource.findUnique({
    where: { id: resourceId },
  });
}

export async function updateResource(
  resourceId: string,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    resourceType: string;
    resourceUrl: string;
    author: string;
    status: string;
    isFeatured: boolean;
    levels: { value: string }[];
    tags: { value: string }[];
  }>
): Promise<Resource> {
  return prisma.resource.update({
    where: { id: resourceId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.resourceType !== undefined && { resource_type: data.resourceType }),
      ...(data.resourceUrl !== undefined && { resource_url: data.resourceUrl }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.isFeatured !== undefined && { is_featured: data.isFeatured }),
      ...(data.levels !== undefined && { levels: data.levels.map((l) => l.value) }),
      ...(data.tags !== undefined && { tags: data.tags?.map((t) => t.value) ?? [] }),
      updated_at: new Date(),
    },
  });
}

export async function deleteResource(resourceId: string): Promise<void> {
  await prisma.resource.update({
    where: { id: resourceId },
    data: { is_archived: true, updated_at: new Date() },
  });
}

export async function incrementResourceViewCount(resourceId: string): Promise<void> {
  await prisma.resource.update({
    where: { id: resourceId },
    data: { view_count: { increment: 1 } },
  });
}

export async function getResourcesByCategory(category: string): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: { status: "Published", category, is_archived: false },
    orderBy: { created_at: "desc" },
  });
}
```

- [ ] **Step 4: Create `lib/db/profile.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { UserProfile } from "@prisma/client";

export interface UpdateUserProfileData {
  name?: string;
  ssc_batch?: string;
  profile_image?: string;
}

export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileData
): Promise<UserProfile> {
  return prisma.userProfile.update({
    where: { id: userId },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/participants.ts lib/db/members.ts lib/db/resources.ts lib/db/profile.ts
git commit -m "feat: add Prisma queries for participants, members, resources, and profile"
```

---

### Task 5: Migrate Server Actions to Use Prisma

**Files:**
- Modify: `actions/auth.ts`
- Modify: `actions/events.ts`
- Modify: `actions/competitions.ts`
- Modify: `actions/registration.ts`
- Modify: `actions/participants.ts`
- Modify: `actions/members.ts`
- Modify: `actions/resources.ts`
- Modify: `actions/profile.ts`

- [ ] **Step 1: Update `actions/auth.ts`**

Replace only the `createUser` import and usage. Auth flows (login, signup, logout, resetPassword) still use Supabase Auth — only the profile creation call changes:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { createUserProfile } from "@/lib/db/users";
import { getUserByEmail } from "@/lib/db/users";
import { handleError } from "@/lib/utils";

type AuthData = {
  email: string;
  password: string;
  name?: string;
  rememberMe?: boolean;
  ssc_batch?: string;
};

type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function login(authData: AuthData): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServer();

    const data: SignInWithPasswordCredentials = {
      email: authData.email,
      password: authData.password,
    };

    const { data: userData, error } =
      await supabase.auth.signInWithPassword(data);

    if (error) {
      return { success: false, error: error.message };
    }

    const existingUser = await getUserByEmail(authData.email);

    if (!existingUser) {
      try {
        await createUserProfile({
          id: userData.user?.id,
          email: authData.email,
          name: authData.name || "",
          ssc_batch: authData.ssc_batch || "",
        });
      } catch (err) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Failed to create user profile",
        };
      }
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Login successful" };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function signup(authData: AuthData): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServer();

    const data: SignUpWithPasswordCredentials = {
      email: authData.email,
      password: authData.password,
      options: {
        data: {
          fullName: authData.name,
          ssc_batch: authData.ssc_batch,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth?tab=login`,
      },
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      message:
        "Registration successful! Please check your email to confirm your account.",
    };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function logout(): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServer();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseServer();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      }/auth?tab=login`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Password reset link sent! Please check your email.",
    };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}
```

- [ ] **Step 2: Update `actions/events.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  type CreateEventData,
} from "@/lib/db/events";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type EventActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createEventAction(
  eventData: CreateEventData
): Promise<EventActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const event = await createEvent(user.id, eventData);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: "Event created successfully", data: event };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create event" };
  }
}

export async function updateEventAction(
  eventId: string,
  eventData: Partial<CreateEventData>
): Promise<EventActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const event = await updateEvent(eventId, eventData);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: "Event updated successfully", data: event };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update event" };
  }
}

export async function deleteEventAction(
  eventId: string
): Promise<EventActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    await deleteEvent(eventId);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: "Event deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete event" };
  }
}

export async function toggleEventStatusAction(
  eventId: string,
  isPublished: boolean
): Promise<EventActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const event = await toggleEventStatus(eventId, isPublished);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: `Event ${isPublished ? "published" : "unpublished"} successfully`,
      data: event,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update event status" };
  }
}
```

- [ ] **Step 3: Update `actions/competitions.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  toggleCompetitionStatus,
  updateCompetitionOrder,
} from "@/lib/db/competitions";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type CompetitionActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createCompetitionAction(
  competitionData: {
    event_id: string;
    title: string;
    description?: any;
    fee?: number;
    display_order: number;
    is_published?: boolean;
  }
): Promise<CompetitionActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const competition = await createCompetition(competitionData);

    revalidatePath(`/admin/events/${competitionData.event_id}`, "page");
    revalidatePath("/admin/events", "page");

    return { success: true, message: "Competition created successfully", data: competition };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create competition" };
  }
}

export async function updateCompetitionAction(
  competitionId: string,
  competitionData: Partial<{
    title: string;
    description: any;
    fee: number;
    display_order: number;
    is_published: boolean;
  }>
): Promise<CompetitionActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const competition = await updateCompetition(competitionId, competitionData);

    if (competition.event_id) {
      revalidatePath(`/admin/events/${competition.event_id}`, "page");
    }
    revalidatePath("/admin/events", "page");

    return { success: true, message: "Competition updated successfully", data: competition };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update competition" };
  }
}

export async function deleteCompetitionAction(
  competitionId: string,
  eventId: string
): Promise<CompetitionActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    await deleteCompetition(competitionId);

    revalidatePath(`/admin/events/${eventId}`, "page");
    revalidatePath("/admin/events", "page");

    return { success: true, message: "Competition deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete competition" };
  }
}

export async function toggleCompetitionStatusAction(
  competitionId: string,
  isPublished: boolean,
  eventId: string
): Promise<CompetitionActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const competition = await toggleCompetitionStatus(competitionId, isPublished);

    revalidatePath(`/admin/events/${eventId}`, "page");
    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: `Competition ${isPublished ? "published" : "unpublished"} successfully`,
      data: competition,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update competition status" };
  }
}

export async function updateCompetitionOrderAction(
  competitions: { id: string; display_order: number }[],
  eventId: string
): Promise<CompetitionActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    await updateCompetitionOrder(competitions);

    revalidatePath(`/admin/events/${eventId}`, "page");
    revalidatePath("/admin/events", "page");

    return { success: true, message: "Competition order updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update competition order" };
  }
}
```

- [ ] **Step 4: Update `actions/registration.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  registerForEvent,
  updateParticipantStatus,
  type EventRegistrationData,
} from "@/lib/db/participants";

type RegistrationActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function registerForEventAction(
  eventId: string,
  registrationData: EventRegistrationData
): Promise<RegistrationActionResult> {
  try {
    const result = await registerForEvent(registrationData);

    revalidatePath(`/events/${eventId}`, "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Registration successful, organizers will verify and reach out to you shortly",
      data: result,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to process registration" };
  }
}

export async function updateParticipantStatusAction(
  registrationId: string,
  status: string
): Promise<RegistrationActionResult> {
  try {
    const result = await updateParticipantStatus(registrationId, status);

    return {
      success: true,
      message: `Participant status updated to ${status}`,
      data: result,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update participant status" };
  }
}
```

- [ ] **Step 5: Update `actions/participants.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  updateParticipantStatus,
  updateAllParticipantStatuses,
} from "@/lib/db/participants";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type ParticipantActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function updateParticipantStatusAction(
  registrationId: string,
  status: string,
  eventId: string
): Promise<ParticipantActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const result = await updateParticipantStatus(registrationId, status);

    revalidatePath(`/admin/events/${eventId}/participants`, "page");

    return {
      success: true,
      message: `Participant status updated to ${status}`,
      data: result,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update participant status" };
  }
}

export async function updateAllParticipantStatusesAction(
  participantId: string,
  eventId: string,
  status: string
): Promise<ParticipantActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const count = await updateAllParticipantStatuses(participantId, eventId, status);

    revalidatePath(`/admin/events/${eventId}/participants`, "page");

    return {
      success: true,
      message: `All registrations for participant updated to ${status} (${count} updated)`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update all participant statuses" };
  }
}
```

- [ ] **Step 6: Update `actions/members.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createMember,
  updateMember,
  deleteMember,
  type CreateMemberData,
  type UpdateMemberData,
} from "@/lib/db/members";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type MemberActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createMemberAction(
  memberData: CreateMemberData
): Promise<MemberActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const member = await createMember(memberData);

    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return { success: true, message: "Member created successfully", data: member };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create member" };
  }
}

export async function updateMemberAction(
  memberId: string,
  memberData: UpdateMemberData
): Promise<MemberActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const member = await updateMember(memberId, memberData);

    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return { success: true, message: "Member updated successfully", data: member };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update member" };
  }
}

export async function deleteMemberAction(
  memberId: string
): Promise<MemberActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    await deleteMember(memberId);

    revalidatePath("/admin/members", "page");
    revalidatePath("/about", "page");

    return { success: true, message: "Member deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete member" };
  }
}
```

- [ ] **Step 7: Update `actions/resources.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createResource,
  updateResource,
  deleteResource,
  incrementResourceViewCount,
} from "@/lib/db/resources";
import { addResourceSchema } from "@/components/resources/admin/addResourceForm/AddResourceHelper";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";
import { z } from "zod";

type ResourceActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createResourceAction(
  resourceData: z.infer<typeof addResourceSchema>
): Promise<ResourceActionResult> {
  try {
    const validatedData = addResourceSchema.parse(resourceData);
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const resource = await createResource(user.id, validatedData);

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return { success: true, message: "Resource created successfully", data: resource };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input: " + error.issues.map((e: any) => e.message).join(", ") };
    }
    return { success: false, error: error.message || "Failed to create resource" };
  }
}

export async function updateResourceAction(
  resourceId: string,
  resourceData: Partial<z.infer<typeof addResourceSchema>>
): Promise<ResourceActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const resource = await updateResource(resourceId, resourceData);

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return { success: true, message: "Resource updated successfully", data: resource };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update resource" };
  }
}

export async function deleteResourceAction(
  resourceId: string
): Promise<ResourceActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    await deleteResource(resourceId);

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return { success: true, message: "Resource deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete resource" };
  }
}

export async function toggleResourceStatus(
  resourceId: string,
  newStatus: string
): Promise<ResourceActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const resource = await updateResource(resourceId, { status: newStatus });

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return { success: true, message: `Resource ${newStatus.toLowerCase()} successfully`, data: resource };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update resource status" };
  }
}

export async function toggleResourceFeatured(
  resourceId: string,
  isFeatured: boolean
): Promise<ResourceActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions" };

    const resource = await updateResource(resourceId, { isFeatured });

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return { success: true, message: `Resource ${isFeatured ? "featured" : "unfeatured"} successfully`, data: resource };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update featured status" };
  }
}

export async function incrementViewCount(resourceId: string): Promise<ResourceActionResult> {
  try {
    await incrementResourceViewCount(resourceId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to increment view count" };
  }
}
```

- [ ] **Step 8: Update `actions/profile.ts`**

Keep Supabase Storage for image uploads, switch profile DB update to Prisma:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import createSupabaseServer from "@/utils/supabase/supabase-server";
import { updateUserProfile, type UpdateUserProfileData } from "@/lib/db/profile";

type ProfileUpdateResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function updateProfile(
  userId: string,
  profileData: UpdateUserProfileData
): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await updateUserProfile(userId, profileData);

    revalidatePath("/profile", "page");
    revalidatePath("/", "layout");

    return { success: true, message: "Profile updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(fileName);

    try {
      await updateUserProfile(userId, { profile_image: publicUrl });
    } catch (err) {
      await supabase.storage.from("profile-images").remove([fileName]);
      return { success: false, error: "Failed to update profile with image URL" };
    }

    revalidatePath("/profile", "page");
    revalidatePath("/", "layout");

    return { success: true, message: "Profile image updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload profile image" };
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add actions/
git commit -m "feat: migrate all server actions from Supabase SDK to Prisma"
```

---

### Task 6: Update Components and Pages to Remove Supabase Client Queries

**Files:**
- Modify: All page files that currently fetch data via Supabase client
- Modify: Components that use `useQuery` with Supabase

This task requires careful component-by-component migration. The pattern is:
1. Server components: replace `createSupabaseBrowser()` + `getXQuery()` with direct Prisma calls
2. Client components that used `useQuery(getXQuery(supabase))`: receive data as props from server component parents

- [ ] **Step 1: Identify all client components using Supabase browser client for queries**

Run:
```bash
rg "createSupabaseBrowser|supabase-browser|useQuery.*getEventsQuery|useQuery.*supabase" --type tsx --type ts -l
```

Review the list and update each component to receive data as props instead of fetching client-side.

- [ ] **Step 2: Update each page to fetch data server-side with Prisma**

For each page (events, about, resources, admin pages), the pattern is:

```typescript
// Before (page.tsx):
// const supabase = createSupabaseBrowser();
// Pass supabase to client component which calls useQuery

// After (page.tsx):
import { getPublishedEvents } from "@/lib/db/events";

export default async function EventsPage() {
  const events = await getPublishedEvents();
  return <EventsClient events={events} />;
}
```

Update each affected client component to accept data as a prop instead of fetching internally.

- [ ] **Step 3: Build and verify**

Run:
```bash
npm run build
```

Expected: Build succeeds with no import errors

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: update pages and components to use Prisma server-side data fetching"
```

---

### Task 7: Remove Old Supabase Query Layer and Clean Up

**Files:**
- Delete: `queries/auth.ts`
- Delete: `queries/events.ts`
- Delete: `queries/competitions.ts`
- Delete: `queries/participants.ts`
- Delete: `queries/members.ts`
- Delete: `queries/resources.ts`
- Delete: `queries/profile.ts`
- Delete: `utils/query-response.ts`
- Delete: `utils/types.ts`
- Delete: `database.types.ts`
- Modify: `package.json` (remove `@supabase-cache-helpers/postgrest-react-query`)

- [ ] **Step 1: Remove the `@supabase-cache-helpers/postgrest-react-query` package**

Run:
```bash
npm uninstall @supabase-cache-helpers/postgrest-react-query @supabase/postgrest-js
```

- [ ] **Step 2: Delete old query files**

Run:
```bash
rm queries/auth.ts queries/events.ts queries/competitions.ts queries/participants.ts queries/members.ts queries/resources.ts queries/profile.ts
rmdir queries 2>/dev/null || true
rm utils/query-response.ts utils/types.ts
rm database.types.ts
```

- [ ] **Step 3: Search for any remaining references to deleted files**

Run:
```bash
rg "from.*queries/" --type ts --type tsx -l
rg "from.*utils/query-response" --type ts --type tsx -l
rg "from.*utils/types" --type ts --type tsx -l
rg "from.*database.types" --type ts --type tsx -l
```

Fix any remaining imports found.

- [ ] **Step 4: Remove the `update-types` script from `package.json`**

Remove this line from `package.json` scripts:
```json
"update-types": "npx supabase gen types --lang=typescript --project-id \"vwkhuivnxctstkhzrext\" > database.types.ts"
```

- [ ] **Step 5: Build and verify**

Run:
```bash
npm run build
```

Expected: Clean build with no errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove old Supabase query layer and unused dependencies"
```

---

### Task 8: Add `prisma generate` to Build Pipeline

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add postinstall script for Prisma**

In `package.json`, add to scripts:
```json
"postinstall": "prisma generate"
```

This ensures `prisma generate` runs after `npm install` on deployment (Vercel, etc.).

- [ ] **Step 2: Add `.env.local` variables to deployment platform**

Add `DATABASE_URL` and `DIRECT_URL` to your Vercel (or hosting) environment variables.

- [ ] **Step 3: Final build verification**

Run:
```bash
npm run build
```

Expected: Clean build, all pages render correctly

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: add prisma generate to postinstall for deployment"
```
