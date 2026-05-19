# Database Schema Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the ACPSCM database from 8 tables to 17 — fixing existing inconsistencies and adding support for teams, competition results, payments, blog posts, announcements, a photo gallery, and a contact form.

**Architecture:** All new code follows the established pattern: Prisma models in `prisma/schema.prisma`, query functions in `lib/db/<domain>.ts`, server actions in `actions/<domain>.ts`, and Zod validations in `lib/validations.ts`. The migration is additive-first (new tables, then data migration, then cleanup) so existing features never break.

**Tech Stack:** Next.js 15 (App Router), Prisma ORM, Supabase PostgreSQL, TypeScript 5, Zod, `revalidatePath` for cache invalidation

**Spec:** `docs/superpowers/specs/2026-05-19-database-schema-redesign.md`

**No test framework** is configured. Verification uses `npx prisma generate` (type safety), `npm run build` (compilation), and `npm run lint` (linting).

---

## File Structure

### New files
| File | Purpose |
|---|---|
| `lib/db/teams.ts` | Team + team member CRUD queries |
| `lib/db/competition-results.ts` | Competition result CRUD + leaderboard queries |
| `lib/db/payments.ts` | Payment CRUD + verification workflow queries |
| `lib/db/blog-posts.ts` | Blog post CRUD + slug-based lookup |
| `lib/db/announcements.ts` | Announcement CRUD + expiry-aware queries |
| `lib/db/gallery.ts` | Gallery album + image CRUD queries |
| `lib/db/contact.ts` | Contact submission CRUD + status workflow |
| `lib/db/magazines.ts` | Magazine CRUD queries (currently missing) |
| `actions/teams.ts` | Team server actions |
| `actions/competition-results.ts` | Competition result server actions |
| `actions/payments.ts` | Payment server actions with verification |
| `actions/blog.ts` | Blog post server actions |
| `actions/announcements.ts` | Announcement server actions |
| `actions/gallery.ts` | Gallery server actions |
| `actions/contact.ts` | Contact submission server actions |
| `actions/magazines.ts` | Magazine server actions (currently missing) |
| `scripts/migrate-data.ts` | One-time data migration script |

### Modified files
| File | Changes |
|---|---|
| `prisma/schema.prisma` | Add 9 models, modify 5 existing, add enums |
| `components/shared/enums.ts` | Add 6 new enum types |
| `lib/validations.ts` | Add 9 new Zod schemas |
| `lib/db/competitions.ts` | Add `is_team_event` to create/update interfaces |
| `lib/db/participants.ts` | Remove payment fields from registration data |
| `lib/db/members.ts` | Add `user_id` to create/update interfaces |
| `lib/db/resources.ts` | Migrate `status` string to `is_published` boolean |
| `actions/resources.ts` | Update `toggleResourceStatus` to use boolean |
| `actions/registration.ts` | Remove payment fields from registration flow |

---

## Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Prisma enums at the top of the schema (after `datasource db`)**

Add these enums after line 8 in `prisma/schema.prisma`:

```prisma
enum UserStatus {
  pending
  approved
}

enum RegistrationStatus {
  pending
  approved
  rejected
}

enum TeamRole {
  captain
  member
}

enum PaymentStatus {
  pending
  verified
  rejected
}

enum AnnouncementPriority {
  low
  normal
  urgent
}

enum ContactStatus {
  new_submission
  read
  replied
  archived
}
```

- [ ] **Step 2: Add `is_team_event` to Competition model and `team_id` to CompetitionParticipant**

In the `Competition` model (currently lines 52–67), add the `is_team_event` field and `results` relation:

```prisma
model Competition {
  id            String   @id @default(uuid())
  event_id      String
  title         String
  description   Json?
  fee           Float    @default(0)
  display_order Int
  is_published  Boolean  @default(false)
  is_team_event Boolean  @default(false)
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())

  event        Event                    @relation(fields: [event_id], references: [id], onDelete: Cascade)
  participants CompetitionParticipant[]
  results      CompetitionResult[]
  payments     Payment[]

  @@map("competitions")
}
```

In the `CompetitionParticipant` model (currently lines 88–100), add `team_id`:

```prisma
model CompetitionParticipant {
  id             String   @id @default(uuid())
  competition_id String
  participant_id String
  team_id        String?
  status         String
  created_at     DateTime @default(now())
  updated_at     DateTime @default(now())

  competition Competition @relation(fields: [competition_id], references: [id], onDelete: Cascade)
  participant Participant @relation(fields: [participant_id], references: [id], onDelete: Cascade)
  team        Team?       @relation(fields: [team_id], references: [id], onDelete: Cascade)

  @@map("competitions_participants")
}
```

- [ ] **Step 3: Add `user_id` FK to Member model**

Update the `Member` model (currently lines 102–119):

```prisma
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
  user_id           String?
  created_at        DateTime @default(now())
  updated_at        DateTime @default(now())

  user UserProfile? @relation("MemberUser", fields: [user_id], references: [id], onDelete: SetNull)

  @@map("members")
}
```

Also add the reverse relation to `UserProfile` (add after line 24):

```prisma
  member_profile Member? @relation("MemberUser")
```

- [ ] **Step 4: Update Resource model — rename `status` to `is_published`**

Replace the `Resource` model (currently lines 121–142):

```prisma
model Resource {
  id            String    @id @default(uuid())
  title         String
  description   String?
  category      String?
  resource_type String
  resource_url  String?
  author        String?
  is_published  Boolean   @default(false)
  is_featured   Boolean   @default(false)
  is_archived   Boolean   @default(false)
  levels        String[]
  tags          String[]
  view_count    Int?      @default(0)
  created_by    String?
  created_at    DateTime? @default(now())
  updated_at    DateTime? @default(now())

  creator UserProfile? @relation("ResourceCreator", fields: [created_by], references: [id])

  @@map("resources")
}
```

Note: The column rename from `status` to `is_published` is a breaking change — it needs a data migration (Task 11). For now, keep both columns during migration by adding `is_published` as a new nullable column and keeping `status` temporarily. **Alternative approach (simpler):** Since this is a Prisma-level rename, we can use `@map("status")` temporarily during migration, then do the actual SQL rename. For simplicity, we'll add `is_published` as a new column in this task, and handle the migration in Task 11.

**Revised Resource model (migration-safe):**

```prisma
model Resource {
  id            String    @id @default(uuid())
  title         String
  description   String?
  category      String?
  resource_type String
  resource_url  String?
  author        String?
  status        String    @default("Draft")
  is_published  Boolean   @default(false)
  is_featured   Boolean   @default(false)
  is_archived   Boolean   @default(false)
  levels        String[]
  tags          String[]
  view_count    Int?      @default(0)
  created_by    String?
  created_at    DateTime? @default(now())
  updated_at    DateTime? @default(now())

  creator UserProfile? @relation("ResourceCreator", fields: [created_by], references: [id])

  @@map("resources")
}
```

We keep `status` for now and add `is_published`. Task 11 migrates data and Task 12 drops `status`.

- [ ] **Step 5: Update Magazine model — change `is_published` from Int to Boolean**

Like resources, this is a type change that requires data migration. Add a new `published` boolean alongside the existing `is_published` int:

```prisma
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
  published      Boolean   @default(false)
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

We add `published` (boolean) alongside `is_published` (int). Task 11 migrates data, Task 12 drops the int column and renames.

- [ ] **Step 6: Add Participant relations for payments and teams**

Update the `Participant` model (currently lines 69–86) to add relations:

```prisma
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
  team_memberships TeamMember[]
  results       CompetitionResult[]
  payments      Payment[]

  @@map("participants")
}
```

- [ ] **Step 7: Add UserProfile relations for new tables**

Add these relations to the `UserProfile` model (after the existing relations):

```prisma
  member_profile       Member?          @relation("MemberUser")
  blog_posts_created   BlogPost[]       @relation("BlogPostCreator")
  announcements_created Announcement[]  @relation("AnnouncementCreator")
  gallery_albums_created GalleryAlbum[] @relation("GalleryAlbumCreator")
  payments_verified    Payment[]        @relation("PaymentVerifier")
  contact_replies      ContactSubmission[] @relation("ContactReplier")
```

Add the Event relation for gallery albums:

```prisma
  // In Event model, add:
  gallery_albums GalleryAlbum[]
```

- [ ] **Step 8: Add all 9 new models**

Append these models at the end of `prisma/schema.prisma`:

```prisma
model Team {
  id          String   @id @default(uuid())
  name        String
  institution String
  created_at  DateTime @default(now())
  updated_at  DateTime @default(now())

  members                TeamMember[]
  competition_participants CompetitionParticipant[]
  results                CompetitionResult[]

  @@map("teams")
}

model TeamMember {
  id             String   @id @default(uuid())
  team_id        String
  participant_id String
  role           String   @default("member")
  created_at     DateTime @default(now())

  team        Team        @relation(fields: [team_id], references: [id], onDelete: Cascade)
  participant Participant @relation(fields: [participant_id], references: [id], onDelete: Cascade)

  @@unique([team_id, participant_id])
  @@map("team_members")
}

model CompetitionResult {
  id              String   @id @default(uuid())
  competition_id  String
  participant_id  String?
  team_id         String?
  score           Decimal?
  rank            Int?
  certificate_url String?
  remarks         String?
  created_at      DateTime @default(now())
  updated_at      DateTime @default(now())

  competition Competition  @relation(fields: [competition_id], references: [id], onDelete: Cascade)
  participant Participant?  @relation(fields: [participant_id], references: [id], onDelete: SetNull)
  team        Team?         @relation(fields: [team_id], references: [id], onDelete: SetNull)

  @@map("competition_results")
}

model Payment {
  id               String    @id @default(uuid())
  participant_id   String
  competition_id   String?
  amount           Decimal
  payment_provider String?
  transaction_id   String?
  status           String    @default("pending")
  verified_by      String?
  verified_at      DateTime?
  created_at       DateTime  @default(now())
  updated_at       DateTime  @default(now())

  participant Participant  @relation(fields: [participant_id], references: [id], onDelete: Cascade)
  competition Competition? @relation(fields: [competition_id], references: [id], onDelete: SetNull)
  verifier    UserProfile? @relation("PaymentVerifier", fields: [verified_by], references: [id], onDelete: SetNull)

  @@map("payments")
}

model BlogPost {
  id           String    @id @default(uuid())
  title        String
  slug         String    @unique
  content      Json?
  excerpt      String?
  cover_image  String?
  tags         String[]  @default([])
  is_published Boolean   @default(false)
  is_featured  Boolean   @default(false)
  published_at DateTime?
  view_count   Int       @default(0)
  created_by   String?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @default(now())

  creator UserProfile? @relation("BlogPostCreator", fields: [created_by], references: [id], onDelete: SetNull)

  @@map("blog_posts")
}

model Announcement {
  id         String    @id @default(uuid())
  title      String
  body       String
  priority   String    @default("normal")
  is_pinned  Boolean   @default(false)
  is_active  Boolean   @default(true)
  expires_at DateTime?
  created_by String?
  created_at DateTime  @default(now())
  updated_at DateTime  @default(now())

  creator UserProfile? @relation("AnnouncementCreator", fields: [created_by], references: [id], onDelete: SetNull)

  @@map("announcements")
}

model GalleryAlbum {
  id            String   @id @default(uuid())
  title         String
  description   String?
  event_id      String?
  cover_image   String?
  is_published  Boolean  @default(false)
  display_order Int      @default(0)
  created_by    String?
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())

  event   Event?        @relation(fields: [event_id], references: [id], onDelete: SetNull)
  creator UserProfile?  @relation("GalleryAlbumCreator", fields: [created_by], references: [id], onDelete: SetNull)
  images  GalleryImage[]

  @@map("gallery_albums")
}

model GalleryImage {
  id            String   @id @default(uuid())
  album_id      String
  image_url     String
  caption       String?
  display_order Int      @default(0)
  created_at    DateTime @default(now())

  album GalleryAlbum @relation(fields: [album_id], references: [id], onDelete: Cascade)

  @@map("gallery_images")
}

model ContactSubmission {
  id         String    @id @default(uuid())
  name       String
  email      String
  subject    String
  message    String
  status     String    @default("new")
  replied_by String?
  replied_at DateTime?
  created_at DateTime  @default(now())

  replier UserProfile? @relation("ContactReplier", fields: [replied_by], references: [id], onDelete: SetNull)

  @@map("contact_submissions")
}
```

- [ ] **Step 9: Verify the schema compiles**

Run: `npx prisma validate`
Expected: "The schema at prisma/schema.prisma is valid."

- [ ] **Step 10: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add 9 new models, enums, and modify existing schema for redesign"
```

---

## Task 2: Generate Prisma Migration

**Files:**
- Auto-generated: `prisma/migrations/<timestamp>_schema_redesign/migration.sql`

- [ ] **Step 1: Generate the migration (do NOT run against production yet)**

Run: `npx prisma migrate dev --name schema_redesign --create-only`

This creates the SQL migration file without applying it. Review the generated SQL to verify:
- 9 new tables created (teams, team_members, competition_results, payments, blog_posts, announcements, gallery_albums, gallery_images, contact_submissions)
- `competitions` gets `is_team_event` column
- `competitions_participants` gets `team_id` column
- `members` gets `user_id` column
- `resources` gets `is_published` boolean column (alongside existing `status`)
- `magazines` gets `published` boolean column (alongside existing `is_published` int)
- CHECK constraint on `competition_results` for mutual exclusivity
- UNIQUE constraint on `team_members(team_id, participant_id)`

- [ ] **Step 1b: Manually add CHECK constraint to generated migration SQL**

Open the generated migration file and add this after the `CREATE TABLE competition_results` statement:

```sql
ALTER TABLE "competition_results" ADD CONSTRAINT "result_has_participant_or_team"
  CHECK (
    ("participant_id" IS NOT NULL AND "team_id" IS NULL) OR
    ("participant_id" IS NULL AND "team_id" IS NOT NULL) OR
    ("participant_id" IS NULL AND "team_id" IS NULL)
  );
```

Prisma does not support CHECK constraints natively, so this must be added manually.

- [ ] **Step 2: Apply the migration to the dev database**

Run: `npx prisma migrate dev`
Expected: "Your database is now in sync with your schema."

- [ ] **Step 3: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Build succeeds (existing code still references `status` on Resource, which still exists)

- [ ] **Step 5: Commit**

```bash
git add prisma/
git commit -m "feat(db): generate schema redesign migration"
```

---

## Task 3: Update Shared Enums and Zod Validations

**Files:**
- Modify: `components/shared/enums.ts`
- Modify: `lib/validations.ts`

- [ ] **Step 1: Add new enums to `components/shared/enums.ts`**

Append after the existing `EEventMode` enum (after line 40):

```typescript
export enum ETeamRole {
  Captain = "captain",
  Member = "member",
}

export enum EPaymentStatus {
  Pending = "pending",
  Verified = "verified",
  Rejected = "rejected",
}

export enum EPaymentProvider {
  BKash = "BKash",
}

export enum EAnnouncementPriority {
  Low = "low",
  Normal = "normal",
  Urgent = "urgent",
}

export enum EContactStatus {
  New = "new",
  Read = "read",
  Replied = "replied",
  Archived = "archived",
}

export enum ERegistrationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}
```

- [ ] **Step 2: Add new Zod schemas to `lib/validations.ts`**

Append after the existing `eventRegistrationSchema` (after line 58):

```typescript
// Team validations
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  institution: z.string().min(2, "Institution name must be at least 2 characters"),
});

export const addTeamMemberSchema = z.object({
  team_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  role: z.enum(["captain", "member"]).default("member"),
});

// Competition result validations
export const createCompetitionResultSchema = z.object({
  competition_id: z.string().uuid(),
  participant_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  score: z.number().optional(),
  rank: z.number().int().positive().optional(),
  certificate_url: z.string().url().optional(),
  remarks: z.string().max(200).optional(),
}).refine(
  (data) =>
    (data.participant_id && !data.team_id) ||
    (!data.participant_id && data.team_id),
  { message: "Exactly one of participant_id or team_id must be provided" }
);

// Payment validations
export const createPaymentSchema = z.object({
  participant_id: z.string().uuid(),
  competition_id: z.string().uuid().optional(),
  amount: z.number().positive("Amount must be positive"),
  payment_provider: z.string().optional(),
  transaction_id: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

// Blog post validations
export const createBlogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  content: z.any().optional(),
  excerpt: z.string().max(300, "Excerpt must be under 300 characters").optional(),
  cover_image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

// Announcement validations
export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  priority: z.enum(["low", "normal", "urgent"]).default("normal"),
  is_pinned: z.boolean().default(false),
  expires_at: z.string().datetime().optional(),
});

// Gallery validations
export const createGalleryAlbumSchema = z.object({
  title: z.string().min(2, "Album title must be at least 2 characters"),
  description: z.string().optional(),
  event_id: z.string().uuid().optional(),
  cover_image: z.string().optional(),
  is_published: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

export const addGalleryImageSchema = z.object({
  album_id: z.string().uuid(),
  image_url: z.string().url("Must be a valid image URL"),
  caption: z.string().max(200).optional(),
  display_order: z.number().int().default(0),
});

// Contact form validations
export const contactSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Member validations (previously missing)
export const createMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  position: z.string().optional(),
  session: z.string().optional(),
  bio: z.string().optional(),
  image_url: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  facebook_id_link: z.string().url().optional().or(z.literal("")),
  instagram_id_link: z.string().url().optional().or(z.literal("")),
  linkedin_id_link: z.string().url().optional().or(z.literal("")),
  user_id: z.string().uuid().optional(),
});

// Magazine validations (previously missing)
export const createMagazineSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  summary: z.string().optional(),
  volume: z.number().int().positive().optional(),
  issue: z.number().int().positive().optional(),
  pdf_url: z.string().url().optional(),
  cover_image: z.string().optional(),
  published_date: z.string().optional(),
  language: z.string().default("English"),
  doi: z.string().optional(),
  access_level: z.enum(["public", "restricted", "members_only"]).default("public"),
  chief_patron: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
```

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/shared/enums.ts lib/validations.ts
git commit -m "feat: add enums and Zod validations for all new domain tables"
```

---

## Task 4: Teams Query Layer

**Files:**
- Create: `lib/db/teams.ts`

- [ ] **Step 1: Create `lib/db/teams.ts`**

```typescript
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
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20` (or `npm run build`)
Expected: No errors related to `lib/db/teams.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/db/teams.ts
git commit -m "feat(db): add teams query layer"
```

---

## Task 5: Competition Results Query Layer

**Files:**
- Create: `lib/db/competition-results.ts`

- [ ] **Step 1: Create `lib/db/competition-results.ts`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/competition-results.ts
git commit -m "feat(db): add competition results query layer"
```

---

## Task 6: Payments Query Layer

**Files:**
- Create: `lib/db/payments.ts`

- [ ] **Step 1: Create `lib/db/payments.ts`**

```typescript
import prisma from "@/lib/prisma";
import { Prisma, type Payment, type Participant, type Competition } from "@/lib/generated/prisma";

export type { Payment };

export type PaymentWithDetails = Payment & {
  participant: Participant;
  competition: Competition | null;
};

export interface CreatePaymentData {
  participant_id: string;
  competition_id?: string;
  amount: number;
  payment_provider?: string;
  transaction_id?: string;
}

export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  const now = new Date();
  return prisma.payment.create({
    data: {
      participant_id: data.participant_id,
      competition_id: data.competition_id ?? null,
      amount: new Prisma.Decimal(data.amount),
      payment_provider: data.payment_provider ?? null,
      transaction_id: data.transaction_id ?? null,
      status: "pending",
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPaymentsByParticipant(
  participantId: string
): Promise<PaymentWithDetails[]> {
  return prisma.payment.findMany({
    where: { participant_id: participantId },
    include: { participant: true, competition: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getPaymentsByCompetition(
  competitionId: string
): Promise<PaymentWithDetails[]> {
  return prisma.payment.findMany({
    where: { competition_id: competitionId },
    include: { participant: true, competition: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getPaymentsByEvent(
  eventId: string
): Promise<PaymentWithDetails[]> {
  const competitions = await prisma.competition.findMany({
    where: { event_id: eventId },
    select: { id: true },
  });

  const competitionIds = competitions.map((c) => c.id);

  return prisma.payment.findMany({
    where: { competition_id: { in: competitionIds } },
    include: { participant: true, competition: true },
    orderBy: { created_at: "desc" },
  });
}

export async function getPendingPayments(): Promise<PaymentWithDetails[]> {
  return prisma.payment.findMany({
    where: { status: "pending" },
    include: { participant: true, competition: true },
    orderBy: { created_at: "asc" },
  });
}

export async function verifyPayment(
  paymentId: string,
  status: "verified" | "rejected",
  verifiedBy: string
): Promise<Payment> {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      verified_by: verifiedBy,
      verified_at: new Date(),
      updated_at: new Date(),
    },
  });
}

export async function getPaymentById(paymentId: string): Promise<PaymentWithDetails | null> {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: { participant: true, competition: true },
  });
}

export async function deletePayment(paymentId: string): Promise<void> {
  await prisma.payment.delete({ where: { id: paymentId } });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/payments.ts
git commit -m "feat(db): add payments query layer"
```

---

## Task 7: Update Existing Tier 1 Queries

**Files:**
- Modify: `lib/db/competitions.ts`
- Modify: `lib/db/members.ts`

- [ ] **Step 1: Add `is_team_event` to competition interfaces in `lib/db/competitions.ts`**

Update `CreateCompetitionData` (line 6) to include `is_team_event`:

```typescript
export interface CreateCompetitionData {
  event_id: string;
  title: string;
  description?: unknown;
  fee?: number;
  display_order: number;
  is_published?: boolean;
  is_team_event?: boolean;
}
```

In `createCompetition` (line 31), add `is_team_event` to the create data:

```typescript
      is_team_event: data.is_team_event ?? false,
```

In `updateCompetition` (line 46), add the conditional update (after line 61):

```typescript
  if (data.is_team_event !== undefined)
    updateData.is_team_event = data.is_team_event;
```

Note: The `Partial<Omit<CreateCompetitionData, "event_id">>` type on `updateCompetition` already picks up `is_team_event` automatically.

- [ ] **Step 2: Add `user_id` to member interfaces in `lib/db/members.ts`**

Update `CreateMemberData` (line 4) to include `user_id`:

```typescript
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
```

Add a query to find a member by their linked user account (append after `deleteMember`):

```typescript
export async function getMemberByUserId(userId: string): Promise<Member | null> {
  return prisma.member.findFirst({ where: { user_id: userId } });
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add lib/db/competitions.ts lib/db/members.ts
git commit -m "feat(db): add is_team_event to competitions, user_id to members"
```

---

## Task 8: Tier 1 Server Actions (Teams, Results, Payments)

**Files:**
- Create: `actions/teams.ts`
- Create: `actions/competition-results.ts`
- Create: `actions/payments.ts`

- [ ] **Step 1: Create `actions/teams.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  type CreateTeamData,
  type AddTeamMemberData,
} from "@/lib/db/teams";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type TeamActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createTeamAction(
  teamData: CreateTeamData
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create teams" };

    const team = await createTeam(teamData);

    revalidatePath("/admin/events", "page");

    return { success: true, message: "Team created successfully", data: team };
  } catch (error: any) {
    console.error("Error creating team:", error);
    return { success: false, error: error.message || "Failed to create team" };
  }
}

export async function updateTeamAction(
  teamId: string,
  teamData: Partial<CreateTeamData>
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update teams" };

    const team = await updateTeam(teamId, teamData);

    revalidatePath("/admin/events", "page");

    return { success: true, message: "Team updated successfully", data: team };
  } catch (error: any) {
    console.error("Error updating team:", error);
    return { success: false, error: error.message || "Failed to update team" };
  }
}

export async function deleteTeamAction(
  teamId: string
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete teams" };

    await deleteTeam(teamId);

    revalidatePath("/admin/events", "page");

    return { success: true, message: "Team deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting team:", error);
    return { success: false, error: error.message || "Failed to delete team" };
  }
}

export async function addTeamMemberAction(
  data: AddTeamMemberData
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage team members" };

    const member = await addTeamMember(data);

    revalidatePath("/admin/events", "page");

    return { success: true, message: "Team member added successfully", data: member };
  } catch (error: any) {
    console.error("Error adding team member:", error);
    return { success: false, error: error.message || "Failed to add team member" };
  }
}

export async function removeTeamMemberAction(
  teamId: string,
  participantId: string
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage team members" };

    await removeTeamMember(teamId, participantId);

    revalidatePath("/admin/events", "page");

    return { success: true, message: "Team member removed successfully" };
  } catch (error: any) {
    console.error("Error removing team member:", error);
    return { success: false, error: error.message || "Failed to remove team member" };
  }
}
```

- [ ] **Step 2: Create `actions/competition-results.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createResult,
  updateResult,
  deleteResult,
  bulkCreateResults,
  type CreateResultData,
} from "@/lib/db/competition-results";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type ResultActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createResultAction(
  resultData: CreateResultData
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create results" };

    const result = await createResult(resultData);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: "Result recorded successfully", data: result };
  } catch (error: any) {
    console.error("Error creating result:", error);
    return { success: false, error: error.message || "Failed to create result" };
  }
}

export async function updateResultAction(
  resultId: string,
  resultData: Partial<Omit<CreateResultData, "competition_id">>
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update results" };

    const result = await updateResult(resultId, resultData);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: "Result updated successfully", data: result };
  } catch (error: any) {
    console.error("Error updating result:", error);
    return { success: false, error: error.message || "Failed to update result" };
  }
}

export async function deleteResultAction(
  resultId: string
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete results" };

    await deleteResult(resultId);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: "Result deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting result:", error);
    return { success: false, error: error.message || "Failed to delete result" };
  }
}

export async function bulkCreateResultsAction(
  results: CreateResultData[]
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create results" };

    const count = await bulkCreateResults(results);

    revalidatePath("/admin/events", "page");
    revalidatePath("/events", "page");

    return { success: true, message: `${count} results recorded successfully`, data: { count } };
  } catch (error: any) {
    console.error("Error bulk creating results:", error);
    return { success: false, error: error.message || "Failed to create results" };
  }
}
```

- [ ] **Step 3: Create `actions/payments.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createPayment,
  verifyPayment,
  deletePayment,
  type CreatePaymentData,
} from "@/lib/db/payments";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type PaymentActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createPaymentAction(
  paymentData: CreatePaymentData
): Promise<PaymentActionResult> {
  try {
    const payment = await createPayment(paymentData);

    return { success: true, message: "Payment recorded successfully", data: payment };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message || "Failed to record payment" };
  }
}

export async function verifyPaymentAction(
  paymentId: string,
  status: "verified" | "rejected"
): Promise<PaymentActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to verify payments" };

    const payment = await verifyPayment(paymentId, status, user.id);

    revalidatePath("/admin/events", "page");

    return {
      success: true,
      message: `Payment ${status} successfully`,
      data: payment,
    };
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error.message || "Failed to verify payment" };
  }
}

export async function deletePaymentAction(
  paymentId: string
): Promise<PaymentActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete payments" };

    await deletePayment(paymentId);

    revalidatePath("/admin/events", "page");

    return { success: true, message: "Payment deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting payment:", error);
    return { success: false, error: error.message || "Failed to delete payment" };
  }
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add actions/teams.ts actions/competition-results.ts actions/payments.ts
git commit -m "feat: add server actions for teams, competition results, and payments"
```

---

## Task 9: Tier 2 Query Layer (Blog, Announcements, Gallery, Contact, Magazines)

**Files:**
- Create: `lib/db/blog-posts.ts`
- Create: `lib/db/announcements.ts`
- Create: `lib/db/gallery.ts`
- Create: `lib/db/contact.ts`
- Create: `lib/db/magazines.ts`

- [ ] **Step 1: Create `lib/db/blog-posts.ts`**

```typescript
import prisma from "@/lib/prisma";
import { Prisma, type BlogPost } from "@/lib/generated/prisma";

export type { BlogPost };

export interface CreateBlogPostData {
  title: string;
  slug: string;
  content?: unknown;
  excerpt?: string;
  cover_image?: string;
  tags?: string[];
  is_published?: boolean;
  is_featured?: boolean;
}

export async function createBlogPost(
  userId: string,
  data: CreateBlogPostData
): Promise<BlogPost> {
  const now = new Date();
  return prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: (data.content as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      excerpt: data.excerpt ?? null,
      cover_image: data.cover_image ?? null,
      tags: data.tags ?? [],
      is_published: data.is_published ?? false,
      is_featured: data.is_featured ?? false,
      published_at: data.is_published ? now : null,
      view_count: 0,
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    where: { is_published: true },
    orderBy: { published_at: "desc" },
  });
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    where: { is_published: true, is_featured: true },
    orderBy: { published_at: "desc" },
  });
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getBlogPostById(postId: string): Promise<BlogPost | null> {
  return prisma.blogPost.findUnique({ where: { id: postId } });
}

export async function updateBlogPost(
  postId: string,
  data: Partial<CreateBlogPostData>
): Promise<BlogPost> {
  const updateData: Parameters<typeof prisma.blogPost.update>[0]["data"] = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined)
    updateData.content = (data.content as Prisma.InputJsonValue) ?? Prisma.JsonNull;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt ?? null;
  if (data.cover_image !== undefined) updateData.cover_image = data.cover_image ?? null;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
  if (data.is_published !== undefined) {
    updateData.is_published = data.is_published;
    if (data.is_published) {
      updateData.published_at = new Date();
    }
  }

  return prisma.blogPost.update({ where: { id: postId }, data: updateData });
}

export async function deleteBlogPost(postId: string): Promise<void> {
  await prisma.blogPost.delete({ where: { id: postId } });
}

export async function incrementBlogPostViewCount(postId: string): Promise<void> {
  await prisma.blogPost.update({
    where: { id: postId },
    data: { view_count: { increment: 1 } },
  });
}
```

- [ ] **Step 2: Create `lib/db/announcements.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Announcement } from "@/lib/generated/prisma";

export type { Announcement };

export interface CreateAnnouncementData {
  title: string;
  body: string;
  priority?: string;
  is_pinned?: boolean;
  expires_at?: string | Date;
}

export async function createAnnouncement(
  userId: string,
  data: CreateAnnouncementData
): Promise<Announcement> {
  const now = new Date();
  return prisma.announcement.create({
    data: {
      title: data.title,
      body: data.body,
      priority: data.priority ?? "normal",
      is_pinned: data.is_pinned ?? false,
      is_active: true,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  return prisma.announcement.findMany({
    where: {
      is_active: true,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
    orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
  });
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  return prisma.announcement.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getAnnouncementById(
  announcementId: string
): Promise<Announcement | null> {
  return prisma.announcement.findUnique({ where: { id: announcementId } });
}

export async function updateAnnouncement(
  announcementId: string,
  data: Partial<CreateAnnouncementData & { is_active?: boolean }>
): Promise<Announcement> {
  return prisma.announcement.update({
    where: { id: announcementId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.is_pinned !== undefined && { is_pinned: data.is_pinned }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
      ...(data.expires_at !== undefined && {
        expires_at: data.expires_at ? new Date(data.expires_at) : null,
      }),
      updated_at: new Date(),
    },
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await prisma.announcement.delete({ where: { id: announcementId } });
}
```

- [ ] **Step 3: Create `lib/db/gallery.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { GalleryAlbum, GalleryImage } from "@/lib/generated/prisma";

export type { GalleryAlbum, GalleryImage };

export type AlbumWithImages = GalleryAlbum & { images: GalleryImage[] };

export interface CreateAlbumData {
  title: string;
  description?: string;
  event_id?: string;
  cover_image?: string;
  is_published?: boolean;
  display_order?: number;
}

export interface AddImageData {
  album_id: string;
  image_url: string;
  caption?: string;
  display_order?: number;
}

export async function createAlbum(
  userId: string,
  data: CreateAlbumData
): Promise<GalleryAlbum> {
  const now = new Date();
  return prisma.galleryAlbum.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      event_id: data.event_id ?? null,
      cover_image: data.cover_image ?? null,
      is_published: data.is_published ?? false,
      display_order: data.display_order ?? 0,
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPublishedAlbums(): Promise<AlbumWithImages[]> {
  return prisma.galleryAlbum.findMany({
    where: { is_published: true },
    include: { images: { orderBy: { display_order: "asc" } } },
    orderBy: { display_order: "asc" },
  });
}

export async function getAllAlbums(): Promise<AlbumWithImages[]> {
  return prisma.galleryAlbum.findMany({
    include: { images: { orderBy: { display_order: "asc" } } },
    orderBy: { created_at: "desc" },
  });
}

export async function getAlbumById(albumId: string): Promise<AlbumWithImages | null> {
  return prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: { images: { orderBy: { display_order: "asc" } } },
  });
}

export async function getAlbumsByEvent(eventId: string): Promise<AlbumWithImages[]> {
  return prisma.galleryAlbum.findMany({
    where: { event_id: eventId, is_published: true },
    include: { images: { orderBy: { display_order: "asc" } } },
    orderBy: { display_order: "asc" },
  });
}

export async function updateAlbum(
  albumId: string,
  data: Partial<CreateAlbumData>
): Promise<GalleryAlbum> {
  return prisma.galleryAlbum.update({
    where: { id: albumId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.event_id !== undefined && { event_id: data.event_id ?? null }),
      ...(data.cover_image !== undefined && { cover_image: data.cover_image ?? null }),
      ...(data.is_published !== undefined && { is_published: data.is_published }),
      ...(data.display_order !== undefined && { display_order: data.display_order }),
      updated_at: new Date(),
    },
  });
}

export async function deleteAlbum(albumId: string): Promise<void> {
  await prisma.galleryAlbum.delete({ where: { id: albumId } });
}

export async function addImage(data: AddImageData): Promise<GalleryImage> {
  return prisma.galleryImage.create({
    data: {
      album_id: data.album_id,
      image_url: data.image_url,
      caption: data.caption ?? null,
      display_order: data.display_order ?? 0,
    },
  });
}

export async function deleteImage(imageId: string): Promise<void> {
  await prisma.galleryImage.delete({ where: { id: imageId } });
}

export async function updateImageOrder(
  images: { id: string; display_order: number }[]
): Promise<void> {
  await prisma.$transaction(
    images.map((img) =>
      prisma.galleryImage.update({
        where: { id: img.id },
        data: { display_order: img.display_order },
      })
    )
  );
}
```

- [ ] **Step 4: Create `lib/db/contact.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { ContactSubmission } from "@/lib/generated/prisma";

export type { ContactSubmission };

export interface CreateContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createContactSubmission(
  data: CreateContactData
): Promise<ContactSubmission> {
  return prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: "new",
    },
  });
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getContactSubmissionsByStatus(
  status: string
): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    where: { status },
    orderBy: { created_at: "desc" },
  });
}

export async function getNewContactSubmissions(): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    where: { status: "new" },
    orderBy: { created_at: "asc" },
  });
}

export async function getContactSubmissionById(
  submissionId: string
): Promise<ContactSubmission | null> {
  return prisma.contactSubmission.findUnique({ where: { id: submissionId } });
}

export async function updateContactStatus(
  submissionId: string,
  status: string
): Promise<ContactSubmission> {
  return prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { status },
  });
}

export async function markContactAsReplied(
  submissionId: string,
  repliedBy: string
): Promise<ContactSubmission> {
  return prisma.contactSubmission.update({
    where: { id: submissionId },
    data: {
      status: "replied",
      replied_by: repliedBy,
      replied_at: new Date(),
    },
  });
}

export async function deleteContactSubmission(submissionId: string): Promise<void> {
  await prisma.contactSubmission.delete({ where: { id: submissionId } });
}
```

- [ ] **Step 5: Create `lib/db/magazines.ts`**

```typescript
import prisma from "@/lib/prisma";
import type { Magazine } from "@/lib/generated/prisma";

export type { Magazine };

export interface CreateMagazineData {
  title: string;
  summary?: string;
  volume?: number;
  issue?: number;
  pdf_url?: string;
  cover_image?: string;
  published_date?: string | Date;
  language?: string;
  doi?: string;
  access_level?: string;
  chief_patron?: string;
  tags?: string[];
}

export async function createMagazine(
  userId: string,
  data: CreateMagazineData
): Promise<Magazine> {
  const now = new Date();
  return prisma.magazine.create({
    data: {
      title: data.title,
      summary: data.summary ?? null,
      volume: data.volume ?? null,
      issue: data.issue ?? null,
      pdf_url: data.pdf_url ?? null,
      cover_image: data.cover_image ?? null,
      published_date: data.published_date ? new Date(data.published_date) : null,
      is_published: 0,
      published: false,
      is_archived: false,
      language: data.language ?? "English",
      doi: data.doi ?? null,
      access_level: data.access_level ?? "public",
      chief_patron: data.chief_patron ?? null,
      download_count: 0,
      tags: data.tags ?? [],
      created_by: userId,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function getPublishedMagazines(): Promise<Magazine[]> {
  return prisma.magazine.findMany({
    where: { published: true, is_archived: false },
    orderBy: { published_date: "desc" },
  });
}

export async function getAllMagazines(): Promise<Magazine[]> {
  return prisma.magazine.findMany({
    where: { is_archived: { not: true } },
    orderBy: { created_at: "desc" },
  });
}

export async function getMagazineById(magazineId: string): Promise<Magazine | null> {
  return prisma.magazine.findUnique({ where: { id: magazineId } });
}

export async function updateMagazine(
  magazineId: string,
  data: Partial<CreateMagazineData & { is_archived?: boolean }>
): Promise<Magazine> {
  return prisma.magazine.update({
    where: { id: magazineId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.summary !== undefined && { summary: data.summary ?? null }),
      ...(data.volume !== undefined && { volume: data.volume ?? null }),
      ...(data.issue !== undefined && { issue: data.issue ?? null }),
      ...(data.pdf_url !== undefined && { pdf_url: data.pdf_url ?? null }),
      ...(data.cover_image !== undefined && { cover_image: data.cover_image ?? null }),
      ...(data.published_date !== undefined && {
        published_date: data.published_date ? new Date(data.published_date) : null,
      }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.doi !== undefined && { doi: data.doi ?? null }),
      ...(data.access_level !== undefined && { access_level: data.access_level }),
      ...(data.chief_patron !== undefined && { chief_patron: data.chief_patron ?? null }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.is_archived !== undefined && { is_archived: data.is_archived }),
      updated_at: new Date(),
    },
  });
}

export async function toggleMagazinePublished(
  magazineId: string,
  isPublished: boolean
): Promise<Magazine> {
  return prisma.magazine.update({
    where: { id: magazineId },
    data: {
      published: isPublished,
      is_published: isPublished ? 1 : 0,
      updated_at: new Date(),
    },
  });
}

export async function deleteMagazine(magazineId: string): Promise<Magazine> {
  return prisma.magazine.update({
    where: { id: magazineId },
    data: { is_archived: true, updated_at: new Date() },
  });
}

export async function incrementMagazineDownloadCount(magazineId: string): Promise<void> {
  await prisma.magazine.update({
    where: { id: magazineId },
    data: { download_count: { increment: 1 } },
  });
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add lib/db/blog-posts.ts lib/db/announcements.ts lib/db/gallery.ts lib/db/contact.ts lib/db/magazines.ts
git commit -m "feat(db): add query layers for blog, announcements, gallery, contact, and magazines"
```

---

## Task 10: Tier 2 Server Actions (Blog, Announcements, Gallery, Contact, Magazines)

**Files:**
- Create: `actions/blog.ts`
- Create: `actions/announcements.ts`
- Create: `actions/gallery.ts`
- Create: `actions/contact.ts`
- Create: `actions/magazines.ts`

- [ ] **Step 1: Create `actions/blog.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  incrementBlogPostViewCount,
  type CreateBlogPostData,
} from "@/lib/db/blog-posts";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type BlogActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createBlogPostAction(
  postData: CreateBlogPostData
): Promise<BlogActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create blog posts" };

    const post = await createBlogPost(user.id, postData);

    revalidatePath("/admin/blog", "page");
    revalidatePath("/blog", "page");

    return { success: true, message: "Blog post created successfully", data: post };
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    return { success: false, error: error.message || "Failed to create blog post" };
  }
}

export async function updateBlogPostAction(
  postId: string,
  postData: Partial<CreateBlogPostData>
): Promise<BlogActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update blog posts" };

    const post = await updateBlogPost(postId, postData);

    revalidatePath("/admin/blog", "page");
    revalidatePath("/blog", "page");
    revalidatePath(`/blog/${post.slug}`, "page");

    return { success: true, message: "Blog post updated successfully", data: post };
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return { success: false, error: error.message || "Failed to update blog post" };
  }
}

export async function deleteBlogPostAction(
  postId: string
): Promise<BlogActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete blog posts" };

    await deleteBlogPost(postId);

    revalidatePath("/admin/blog", "page");
    revalidatePath("/blog", "page");

    return { success: true, message: "Blog post deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message || "Failed to delete blog post" };
  }
}

export async function incrementBlogPostViewAction(
  postId: string
): Promise<BlogActionResult> {
  try {
    await incrementBlogPostViewCount(postId);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment view count:", error);
    return { success: false, error: error.message || "Failed to increment view count" };
  }
}
```

- [ ] **Step 2: Create `actions/announcements.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type CreateAnnouncementData,
} from "@/lib/db/announcements";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type AnnouncementActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createAnnouncementAction(
  announcementData: CreateAnnouncementData
): Promise<AnnouncementActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create announcements" };

    const announcement = await createAnnouncement(user.id, announcementData);

    revalidatePath("/admin/announcements", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Announcement created successfully", data: announcement };
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message || "Failed to create announcement" };
  }
}

export async function updateAnnouncementAction(
  announcementId: string,
  announcementData: Partial<CreateAnnouncementData & { is_active?: boolean }>
): Promise<AnnouncementActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update announcements" };

    const announcement = await updateAnnouncement(announcementId, announcementData);

    revalidatePath("/admin/announcements", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Announcement updated successfully", data: announcement };
  } catch (error: any) {
    console.error("Error updating announcement:", error);
    return { success: false, error: error.message || "Failed to update announcement" };
  }
}

export async function deleteAnnouncementAction(
  announcementId: string
): Promise<AnnouncementActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete announcements" };

    await deleteAnnouncement(announcementId);

    revalidatePath("/admin/announcements", "page");
    revalidatePath("/", "page");

    return { success: true, message: "Announcement deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message || "Failed to delete announcement" };
  }
}
```

- [ ] **Step 3: Create `actions/gallery.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImage,
  deleteImage,
  updateImageOrder,
  type CreateAlbumData,
  type AddImageData,
} from "@/lib/db/gallery";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type GalleryActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createAlbumAction(
  albumData: CreateAlbumData
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create albums" };

    const album = await createAlbum(user.id, albumData);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");

    return { success: true, message: "Album created successfully", data: album };
  } catch (error: any) {
    console.error("Error creating album:", error);
    return { success: false, error: error.message || "Failed to create album" };
  }
}

export async function updateAlbumAction(
  albumId: string,
  albumData: Partial<CreateAlbumData>
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update albums" };

    const album = await updateAlbum(albumId, albumData);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");

    return { success: true, message: "Album updated successfully", data: album };
  } catch (error: any) {
    console.error("Error updating album:", error);
    return { success: false, error: error.message || "Failed to update album" };
  }
}

export async function deleteAlbumAction(
  albumId: string
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete albums" };

    await deleteAlbum(albumId);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");

    return { success: true, message: "Album deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting album:", error);
    return { success: false, error: error.message || "Failed to delete album" };
  }
}

export async function addImageAction(
  imageData: AddImageData
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to add images" };

    const image = await addImage(imageData);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");

    return { success: true, message: "Image added successfully", data: image };
  } catch (error: any) {
    console.error("Error adding image:", error);
    return { success: false, error: error.message || "Failed to add image" };
  }
}

export async function deleteImageAction(
  imageId: string
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete images" };

    await deleteImage(imageId);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");

    return { success: true, message: "Image deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message || "Failed to delete image" };
  }
}

export async function updateImageOrderAction(
  images: { id: string; display_order: number }[]
): Promise<GalleryActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to reorder images" };

    await updateImageOrder(images);

    revalidatePath("/admin/gallery", "page");
    revalidatePath("/gallery", "page");

    return { success: true, message: "Image order updated successfully" };
  } catch (error: any) {
    console.error("Error updating image order:", error);
    return { success: false, error: error.message || "Failed to update image order" };
  }
}
```

- [ ] **Step 4: Create `actions/contact.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createContactSubmission,
  updateContactStatus,
  markContactAsReplied,
  deleteContactSubmission,
  type CreateContactData,
} from "@/lib/db/contact";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type ContactActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function submitContactFormAction(
  formData: CreateContactData
): Promise<ContactActionResult> {
  try {
    const submission = await createContactSubmission(formData);

    return { success: true, message: "Message sent successfully", data: submission };
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: error.message || "Failed to send message" };
  }
}

export async function updateContactStatusAction(
  submissionId: string,
  status: string
): Promise<ContactActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage contact submissions" };

    const submission = await updateContactStatus(submissionId, status);

    revalidatePath("/admin/contact", "page");

    return { success: true, message: "Status updated successfully", data: submission };
  } catch (error: any) {
    console.error("Error updating contact status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

export async function markContactAsRepliedAction(
  submissionId: string
): Promise<ContactActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to manage contact submissions" };

    const submission = await markContactAsReplied(submissionId, user.id);

    revalidatePath("/admin/contact", "page");

    return { success: true, message: "Marked as replied", data: submission };
  } catch (error: any) {
    console.error("Error marking contact as replied:", error);
    return { success: false, error: error.message || "Failed to mark as replied" };
  }
}

export async function deleteContactSubmissionAction(
  submissionId: string
): Promise<ContactActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete contact submissions" };

    await deleteContactSubmission(submissionId);

    revalidatePath("/admin/contact", "page");

    return { success: true, message: "Submission deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting contact submission:", error);
    return { success: false, error: error.message || "Failed to delete submission" };
  }
}
```

- [ ] **Step 5: Create `actions/magazines.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  createMagazine,
  updateMagazine,
  deleteMagazine,
  toggleMagazinePublished,
  incrementMagazineDownloadCount,
  type CreateMagazineData,
} from "@/lib/db/magazines";
import { getCurrentUser, isAdminOrExecutive } from "@/lib/auth-server";

type MagazineActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
};

export async function createMagazineAction(
  magazineData: CreateMagazineData
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to create magazines" };

    const magazine = await createMagazine(user.id, magazineData);

    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");

    return { success: true, message: "Magazine created successfully", data: magazine };
  } catch (error: any) {
    console.error("Error creating magazine:", error);
    return { success: false, error: error.message || "Failed to create magazine" };
  }
}

export async function updateMagazineAction(
  magazineId: string,
  magazineData: Partial<CreateMagazineData>
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to update magazines" };

    const magazine = await updateMagazine(magazineId, magazineData);

    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");

    return { success: true, message: "Magazine updated successfully", data: magazine };
  } catch (error: any) {
    console.error("Error updating magazine:", error);
    return { success: false, error: error.message || "Failed to update magazine" };
  }
}

export async function deleteMagazineAction(
  magazineId: string
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to delete magazines" };

    await deleteMagazine(magazineId);

    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");

    return { success: true, message: "Magazine archived successfully" };
  } catch (error: any) {
    console.error("Error deleting magazine:", error);
    return { success: false, error: error.message || "Failed to archive magazine" };
  }
}

export async function toggleMagazinePublishedAction(
  magazineId: string,
  isPublished: boolean
): Promise<MagazineActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to change magazine status" };

    const magazine = await toggleMagazinePublished(magazineId, isPublished);

    revalidatePath("/admin/magazines", "page");
    revalidatePath("/magazine", "page");

    return {
      success: true,
      message: `Magazine ${isPublished ? "published" : "unpublished"} successfully`,
      data: magazine,
    };
  } catch (error: any) {
    console.error("Error toggling magazine status:", error);
    return { success: false, error: error.message || "Failed to update magazine status" };
  }
}

export async function incrementMagazineDownloadAction(
  magazineId: string
): Promise<MagazineActionResult> {
  try {
    await incrementMagazineDownloadCount(magazineId);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to increment download count:", error);
    return { success: false, error: error.message || "Failed to increment download count" };
  }
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add actions/blog.ts actions/announcements.ts actions/gallery.ts actions/contact.ts actions/magazines.ts
git commit -m "feat: add server actions for blog, announcements, gallery, contact, and magazines"
```

---

## Task 11: Update Existing Actions for Schema Changes

**Files:**
- Modify: `lib/db/resources.ts`
- Modify: `actions/resources.ts`
- Modify: `actions/registration.ts`
- Modify: `lib/db/participants.ts`

- [ ] **Step 1: Add `is_published` boolean support to resource queries**

In `lib/db/resources.ts`, update queries to use both `status` and `is_published` during the transition period. This lets new code use the boolean field while old data still has the string field.

Update `createResource` (line 24) to set both fields:

Add `is_published: data.status === "Published" || false,` after the `status` line in the create data.

Update `getPublishedResources` (line 60) to use both:

```typescript
export async function getPublishedResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: {
      OR: [
        { status: "Published" },
        { is_published: true },
      ],
      is_archived: false,
    },
    orderBy: { created_at: "desc" },
  });
}
```

Update `getFeaturedResources` (line 70) similarly:

```typescript
export async function getFeaturedResources(): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: {
      OR: [
        { status: "Published" },
        { is_published: true },
      ],
      is_featured: true,
      is_archived: false,
    },
    orderBy: { created_at: "desc" },
  });
}
```

Update `getResourcesByCategory` (line 146) similarly:

```typescript
export async function getResourcesByCategory(
  category: string
): Promise<Resource[]> {
  return prisma.resource.findMany({
    where: {
      OR: [
        { status: "Published" },
        { is_published: true },
      ],
      category,
      is_archived: false,
    },
    orderBy: { created_at: "desc" },
  });
}
```

- [ ] **Step 2: Update `toggleResourceStatus` in `actions/resources.ts` to set both fields**

In `actions/resources.ts`, update `toggleResourceStatus` (line 155) to set both the old `status` and new `is_published`:

```typescript
export async function toggleResourceStatus(
  resourceId: string,
  newStatus: EResourceStatus
): Promise<ResourceActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions to change resource status" };

    const resource = await updateResource(resourceId, {
      status: newStatus,
      isFeatured: undefined,
    });

    revalidatePath("/admin/resources", "page");
    revalidatePath("/resources", "page");

    return {
      success: true,
      message: `Resource ${newStatus.toLowerCase()} successfully`,
      data: resource,
    };
  } catch (error: any) {
    console.error("Error updating resource status:", error);
    return { success: false, error: error.message || "Failed to update resource status" };
  }
}
```

Also update the `updateResource` function in `lib/db/resources.ts` to keep `is_published` in sync when `status` changes. Add after the `status` conditional (line 108):

```typescript
      ...(data.status !== undefined && {
        status: data.status,
        is_published: data.status === "Published",
      }),
```

- [ ] **Step 3: Update registration to create payment records**

In `lib/db/participants.ts`, update `registerForEvent` to stop storing payment fields on the participant and instead return them for the caller to use with the payments system. The participant row no longer needs `transaction_id` and `payment_provider` — but we keep passing them for backward compatibility during migration:

No changes needed to `lib/db/participants.ts` yet — the columns still exist. The caller (`actions/registration.ts`) will be updated to also create a payment record when payment info is provided.

Update `actions/registration.ts` to create payment records:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import {
  registerForEvent,
  updateParticipantStatus,
  type EventRegistrationData,
} from "@/lib/db/participants";
import { createPayment } from "@/lib/db/payments";

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

    if (registrationData.transaction_id) {
      for (const competitionId of registrationData.competitions) {
        await createPayment({
          participant_id: result.participant.id,
          competition_id: competitionId,
          amount: 0,
          payment_provider: registrationData.payment_provider,
          transaction_id: registrationData.transaction_id,
        });
      }
    }

    revalidatePath(`/events/${eventId}`, "page");
    revalidatePath("/events", "page");

    return {
      success: true,
      message: "Registration successful, organizers will verify and reach out to you shortly",
      data: result,
    };
  } catch (error: any) {
    console.error("Error processing registration:", error);
    return {
      success: false,
      error: error.message || "Failed to process registration",
    };
  }
}

export async function updateParticipantStatusAction(
  registrationId: string,
  status: string
): Promise<RegistrationActionResult> {
  try {
    const registration = await updateParticipantStatus(registrationId, status);

    return {
      success: true,
      message: `Participant status updated to ${status}`,
      data: registration,
    };
  } catch (error: any) {
    console.error("Error updating participant status:", error);
    return {
      success: false,
      error: error.message || "Failed to update participant status",
    };
  }
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add lib/db/resources.ts lib/db/participants.ts actions/resources.ts actions/registration.ts
git commit -m "feat: update resources for is_published transition, registration for payments"
```

---

## Task 12: Data Migration Script

**Files:**
- Create: `scripts/migrate-data.ts`

- [ ] **Step 1: Create `scripts/migrate-data.ts`**

This script handles the three data migrations: magazines int→bool, resources status→is_published, and participants payment→payments.

```typescript
import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: 5,
});
const prisma = new PrismaClient({ adapter });

async function migrateMagazinePublishedStatus() {
  console.log("Migrating magazines.is_published (int) → published (boolean)...");

  const magazines = await prisma.magazine.findMany();
  let count = 0;

  for (const magazine of magazines) {
    await prisma.magazine.update({
      where: { id: magazine.id },
      data: { published: magazine.is_published === 1 },
    });
    count++;
  }

  console.log(`  Migrated ${count} magazines`);
}

async function migrateResourcePublishedStatus() {
  console.log('Migrating resources.status (text) → is_published (boolean)...');

  const resources = await prisma.resource.findMany();
  let count = 0;

  for (const resource of resources) {
    await prisma.resource.update({
      where: { id: resource.id },
      data: { is_published: resource.status === "Published" },
    });
    count++;
  }

  console.log(`  Migrated ${count} resources`);
}

async function migratePaymentData() {
  console.log("Migrating participants payment fields → payments table...");

  const participants = await prisma.participant.findMany({
    where: {
      transaction_id: { not: null },
    },
    include: {
      registrations: true,
    },
  });

  let count = 0;

  for (const participant of participants) {
    if (!participant.transaction_id) continue;

    for (const registration of participant.registrations) {
      await prisma.payment.create({
        data: {
          participant_id: participant.id,
          competition_id: registration.competition_id,
          amount: 0,
          payment_provider: participant.payment_provider,
          transaction_id: participant.transaction_id,
          status: "pending",
          created_at: participant.created_at,
          updated_at: participant.updated_at,
        },
      });
      count++;
    }
  }

  console.log(`  Created ${count} payment records`);
}

async function main() {
  console.log("Starting data migration...\n");

  try {
    await migrateMagazinePublishedStatus();
    await migrateResourcePublishedStatus();
    await migratePaymentData();

    console.log("\nData migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

- [ ] **Step 2: Run the data migration**

Run: `npx tsx scripts/migrate-data.ts`
Expected:
```
Starting data migration...

Migrating magazines.is_published (int) → published (boolean)...
  Migrated N magazines
Migrating resources.status (text) → is_published (boolean)...
  Migrated N resources
Migrating participants payment fields → payments table...
  Created N payment records

Data migration completed successfully!
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-data.ts
git commit -m "feat: add data migration script for schema redesign"
```

---

## Task 13: Final Verification and Build

**Files:**
- None new — verification only

- [ ] **Step 1: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run full build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 4: Verify database state**

Run: `npx prisma db pull --print | head -100`
Expected: Schema includes all 17 tables with correct columns

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification — schema redesign complete"
```

---

## Summary

| Task | What | Files |
|---|---|---|
| 1 | Prisma schema — 9 new models, modify 5 existing, add enums | `prisma/schema.prisma` |
| 2 | Generate + apply Prisma migration | `prisma/migrations/` |
| 3 | Shared enums + Zod validations | `components/shared/enums.ts`, `lib/validations.ts` |
| 4 | Teams query layer | `lib/db/teams.ts` |
| 5 | Competition results query layer | `lib/db/competition-results.ts` |
| 6 | Payments query layer | `lib/db/payments.ts` |
| 7 | Update existing Tier 1 queries | `lib/db/competitions.ts`, `lib/db/members.ts` |
| 8 | Tier 1 server actions | `actions/teams.ts`, `actions/competition-results.ts`, `actions/payments.ts` |
| 9 | Tier 2 query layer | `lib/db/blog-posts.ts`, `lib/db/announcements.ts`, `lib/db/gallery.ts`, `lib/db/contact.ts`, `lib/db/magazines.ts` |
| 10 | Tier 2 server actions | `actions/blog.ts`, `actions/announcements.ts`, `actions/gallery.ts`, `actions/contact.ts`, `actions/magazines.ts` |
| 11 | Update existing actions for schema changes | `lib/db/resources.ts`, `actions/resources.ts`, `actions/registration.ts` |
| 12 | Data migration script | `scripts/migrate-data.ts` |
| 13 | Final verification + build | — |
