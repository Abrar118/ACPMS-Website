# Database Schema Redesign — ACPSCM

**Date:** 2026-05-19
**Scope:** Full audit — fix existing inconsistencies + add new domain tables
**Approach:** Targeted Expansion (Approach B) — two-tiered rollout

---

## Overview

The current schema has 8 tables serving ACPSCM's core domain: user accounts, events, competitions, participant registration, resources, magazines, and a club member showcase. This redesign:

1. **Fixes inconsistencies** in existing tables (status fields, type mismatches, missing links)
2. **Adds 9 new tables** to capture competition results/teams, payments, blog posts, announcements, a photo gallery, and a contact form

Total tables after redesign: **17**.

---

## Part 1: Fixes to Existing Tables

### 1.1 Status Field Standardization

| Table | Current | Change |
|---|---|---|
| `magazines.is_published` | `integer` (0/1) | → `boolean` (data migration: 0→false, 1→true) |
| `resources.status` | `text` ("Published"/"Pending"), default `'"Pending"'` (bug: extra quotes) | → `is_published boolean DEFAULT false` |
| `user_profiles.status` | `text` ("pending"/"approved") | Keep as text, add Prisma enum `UserStatus { pending, approved }` |
| `competitions_participants.status` | `text` ("pending"/"approved"/"rejected") | Keep as text, add Prisma enum `RegistrationStatus { pending, approved, rejected }` |

**Rationale:** Binary visibility toggles (published/draft) use booleans for consistency with `events.is_published` and `competitions.is_published`. Multi-state workflows (user approval, registration status) stay as text with Prisma-level enums for type safety.

### 1.2 Members ↔ User Profiles Link

Add optional FK to `members`:

```sql
ALTER TABLE members ADD COLUMN user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;
```

- Links executive committee members to their login accounts when applicable
- `SET NULL` on delete so historical/alumni member records survive if a user account is removed
- Optional (nullable) — not every showcase member needs an account

### 1.3 Payment Fields Deprecation on Participants

After the new `payments` table is created and data migrated:

```sql
-- Migrate existing data first, then:
ALTER TABLE participants DROP COLUMN transaction_id;
ALTER TABLE participants DROP COLUMN payment_provider;
```

### 1.4 Competitions — Team Support Flag

```sql
ALTER TABLE competitions ADD COLUMN is_team_event boolean NOT NULL DEFAULT false;
```

### 1.5 Competitions Participants — Team Link

```sql
ALTER TABLE competitions_participants ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE CASCADE;
```

- NULL for individual competitions
- Set for team competitions (each team member gets their own row linked to the same team)

### 1.6 Minor Fixes

- **`resources.status` default** — fix from `'"Pending"'` (double-quoted) to proper value (becomes moot if migrated to `is_published` boolean)
- **`updated_at` consistency** — ensure all tables with `updated_at` have application-level or trigger-based auto-update

---

## Part 2: New Tables — Tier 1 (Core Domain)

These tables fill gaps in the competition and registration flow.

### 2.1 teams

```sql
CREATE TABLE teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  institution text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

### 2.2 team_members

```sql
CREATE TABLE team_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  participant_id  uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member', -- 'captain' | 'member'
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, participant_id)
);
```

- UNIQUE constraint prevents the same participant from being added to a team twice

### 2.3 competition_results

```sql
CREATE TABLE competition_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  uuid NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  participant_id  uuid REFERENCES participants(id) ON DELETE SET NULL,
  team_id         uuid REFERENCES teams(id) ON DELETE SET NULL,
  score           decimal,
  rank            smallint,
  certificate_url text,
  remarks         text, -- "Gold Medal", "Honorable Mention", etc.
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT result_has_participant_or_team
    CHECK (
      (participant_id IS NOT NULL AND team_id IS NULL) OR
      (participant_id IS NULL AND team_id IS NOT NULL) OR
      (participant_id IS NULL AND team_id IS NULL)  -- orphaned historical record
    )
);
```

- CHECK constraint enforces mutual exclusivity: a result belongs to either an individual or a team, never both
- Both-NULL is permitted for orphaned historical records (when a participant or team is deleted, `ON DELETE SET NULL` creates this state)
- `ON DELETE SET NULL` preserves results as historical records even if the participant or team is removed

### 2.4 payments

```sql
CREATE TABLE payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id    uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  competition_id    uuid REFERENCES competitions(id) ON DELETE SET NULL,
  amount            decimal NOT NULL,
  payment_provider  text,           -- 'bKash', etc.
  transaction_id    text,
  status            text NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
  verified_by       uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  verified_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
```

- One payment per participant per competition (or a general event payment with `competition_id` NULL)
- `verified_by` + `verified_at` create an admin audit trail for manual verification
- Record-keeping only — no gateway integration planned

---

## Part 3: New Tables — Tier 2 (Content & Engagement)

### 3.1 blog_posts

```sql
CREATE TABLE blog_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  content       jsonb,                          -- TipTap rich text (matches events/competitions pattern)
  excerpt       text,
  cover_image   text,
  tags          text[] DEFAULT '{}',
  is_published  boolean NOT NULL DEFAULT false,
  is_featured   boolean NOT NULL DEFAULT false,
  published_at  timestamptz,                    -- distinct from created_at (drafts sit before publishing)
  view_count    integer NOT NULL DEFAULT 0,
  created_by    uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

- `slug` for clean URLs (`/blog/how-to-solve-diophantine-equations`)
- `content` as `jsonb` reuses the existing TipTap editor component
- `published_at` separate from `created_at` for correct chronological sorting
- `view_count` follows the same atomic increment pattern as `resources`

### 3.2 announcements

```sql
CREATE TABLE announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  body        text NOT NULL,                    -- plain text or simple markdown
  priority    text NOT NULL DEFAULT 'normal',   -- 'low' | 'normal' | 'urgent'
  is_pinned   boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  expires_at  timestamptz,                      -- auto-hide after this date
  created_by  uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

- `body` is plain `text` — announcements are short notices, not articles
- Query pattern: `WHERE is_active = true AND (expires_at IS NULL OR expires_at > now())`
- `is_pinned` keeps important notices at the top regardless of date

### 3.3 gallery_albums

```sql
CREATE TABLE gallery_albums (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  event_id      uuid REFERENCES events(id) ON DELETE SET NULL,
  cover_image   text,
  is_published  boolean NOT NULL DEFAULT false,
  display_order smallint NOT NULL DEFAULT 0,
  created_by    uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

- Optional `event_id` link — albums can be standalone or tied to an event
- `display_order` follows the `competitions` reordering pattern

### 3.4 gallery_images

```sql
CREATE TABLE gallery_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id      uuid NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url     text NOT NULL,                  -- Supabase Storage URL
  caption       text,
  display_order smallint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

- CASCADE delete: deleting an album removes all its images
- No `updated_at` — images are immutable once uploaded; replace rather than edit

### 3.5 contact_submissions

```sql
CREATE TABLE contact_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text NOT NULL,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'new',      -- 'new' | 'read' | 'replied' | 'archived'
  replied_by  uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  replied_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

- No auth required to submit (public form)
- Admin workflow: `new` → `read` → `replied` → `archived`
- `replied_by`/`replied_at` for minimal audit trail

---

## Part 4: Prisma Enums

Add these Prisma-level enums for type safety (mapped to text columns in Postgres):

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
  new_submission  // 'new' is reserved in some contexts
  read
  replied
  archived
}
```

---

## Part 5: Entity Relationship Summary

```
user_profiles ──1:N──► events
user_profiles ──1:N──► resources
user_profiles ──1:N──► magazines
user_profiles ──1:N──► blog_posts
user_profiles ──1:N──► announcements
user_profiles ──1:N──► gallery_albums
user_profiles ◄──0:1── members (optional link)

events ──1:N──► competitions
events ◄──0:N── gallery_albums (optional link)

competitions ──N:M──► participants (via competitions_participants)
competitions ──1:N──► competition_results
competitions ◄──0:N── payments

participants ──N:M──► teams (via team_members)
participants ──1:N──► payments

teams ──1:N──► team_members
teams ──1:N──► competition_results

competitions_participants ──0:1──► teams (optional, for team events)
```

---

## Part 6: Migration Strategy

### Phase 1 — Non-breaking additions
1. Create all 9 new tables (purely additive, no existing code breaks)
2. Add `members.user_id` nullable FK
3. Add `competitions.is_team_event` boolean with default false
4. Add `competitions_participants.team_id` nullable FK

### Phase 2 — Data migrations
1. Migrate `magazines.is_published` from integer to boolean
2. Migrate `resources.status` to `is_published` boolean
3. Migrate `participants.transaction_id`/`payment_provider` data into `payments` table

### Phase 3 — Cleanup
1. Drop deprecated columns from `participants` (`transaction_id`, `payment_provider`)
2. Fix `resources.status` default value (or remove column after migration to `is_published`)
3. Update Prisma schema with new enums and models
4. Update `lib/db/` query layer for affected tables
5. Update server actions for affected tables

### Rollout order for new features
1. **Tier 1 first:** teams, competition_results, payments (directly supports the existing competition flow)
2. **Tier 2 second:** blog_posts, announcements, gallery, contact_submissions (independent features)

---

## Table Summary

| # | Table | Status | Purpose |
|---|---|---|---|
| 1 | `user_profiles` | Modified | Add Prisma enum for status |
| 2 | `events` | Unchanged | — |
| 3 | `competitions` | Modified | Add `is_team_event` |
| 4 | `participants` | Modified | Drop payment columns after migration |
| 5 | `competitions_participants` | Modified | Add `team_id`, add Prisma enum for status |
| 6 | `members` | Modified | Add `user_id` FK |
| 7 | `magazines` | Modified | `is_published` int → boolean |
| 8 | `resources` | Modified | `status` text → `is_published` boolean |
| 9 | `teams` | **New** | Team identity for group competitions |
| 10 | `team_members` | **New** | Links participants to teams |
| 11 | `competition_results` | **New** | Scores, rankings, certificates |
| 12 | `payments` | **New** | Fee tracking with admin verification |
| 13 | `blog_posts` | **New** | Math articles, problem discussions |
| 14 | `announcements` | **New** | Site-wide notices with expiry |
| 15 | `gallery_albums` | **New** | Photo album containers |
| 16 | `gallery_images` | **New** | Individual images within albums |
| 17 | `contact_submissions` | **New** | Public feedback form entries |
