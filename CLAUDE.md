# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ACPSCM (Adamjee Cantonment Public School Club of Mathematics) — a Next.js web app for managing a mathematics club's events, competitions, resources, magazines, and members. Uses Supabase for auth/storage/database with a Prisma migration in progress.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm start            # Start production server
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db pull   # Pull schema from remote Supabase PostgreSQL
```

No test framework is configured.

## Architecture

### Data Flow

**Server components** fetch data directly (via Prisma or Supabase queries) and pass it as props to client components. **Server actions** (`actions/`) handle all mutations with auth checks, then call `revalidatePath()` to refresh. **React Query** is used only for client-side state (search, filters, optimistic updates) — not for server data fetching.

### Authentication

Supabase Auth manages sessions via `@supabase/ssr` cookies. The middleware (`middleware.ts`) refreshes tokens on every request and redirects unauthenticated users away from protected routes. Public paths: `/`, `/auth`, `/events`, `/about`, `/magazine`.

- `lib/auth-server.ts` — `getCurrentUser()` returns `{ user, profile }` server-side
- `isAdminOrExecutive()` — role check used by all admin server actions
- Roles: `member`, `executive`, `admin` (stored in `user_profiles.role`)

### Database

8 PostgreSQL tables hosted on Supabase: `user_profiles`, `events`, `competitions`, `participants`, `competitions_participants`, `members`, `resources`, `magazines`.

**Active migration:** Moving from Supabase SDK queries (`queries/`) to Prisma ORM (`lib/db/`). See `docs/superpowers/plans/2026-05-19-prisma-migration.md`. During migration, both patterns coexist — new code should use Prisma via `lib/db/`.

### Server Actions Pattern

Every action in `actions/` follows the same structure:
1. Call `getCurrentUser()` to verify authentication
2. Call `isAdminOrExecutive()` for admin operations
3. Execute the database operation
4. Call `revalidatePath()` for affected routes
5. Return `{ success: boolean; error?: string; message?: string; data?: any }`

### Key Enums

Defined in `components/shared/enums.ts`: `EResourceStatus`, `EResourceType`, `EResourceCategory`, `EResourceLevel`, `EEventType`, `EEventMode`. Use these instead of string literals.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui (New York style), Framer Motion
- **Database:** Supabase PostgreSQL, migrating to Prisma ORM
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Storage:** Supabase Storage (`profile-images` bucket)
- **Forms:** React Hook Form + Zod validation (`lib/validations.ts`)
- **Rich Text:** TipTap editor
- **Toasts:** Sonner
- **Theme:** next-themes with dark mode support

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon/public key
NEXT_PUBLIC_BASE_URL           # App URL (http://localhost:3000 in dev)
DATABASE_URL                   # Prisma connection (pooler, port 6543)
DIRECT_URL                     # Prisma direct connection (port 5432)
```

## Conventions

- Path alias: `@/*` maps to project root
- Supabase browser client: `utils/supabase/supabase-browser.ts` (for auth/storage on client)
- Supabase server client: `utils/supabase/supabase-server.ts` (for auth/storage in server actions)
- Prisma client singleton: `lib/prisma.ts`
- Font: Poppins (loaded in root layout)
- `cn()` utility from `lib/utils.ts` for class merging (clsx + tailwind-merge)
