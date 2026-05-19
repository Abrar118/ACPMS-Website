# ACPSCM: Prisma Migration + UI Revamp

## Problem

The current Supabase SDK + React Query + `@supabase-cache-helpers` setup has compounding maintenance issues:

- Two competing query patterns (PostgREST query builders vs evaluated `QueryResponseType` wrappers)
- Manual cache invalidation scattered across actions with no centralized strategy
- No database transactions — multi-step operations (registration, profile image upload) risk orphaned/inconsistent data
- Permission checks (`isAdminOrExecutive()`) copy-pasted across ~30+ call sites
- No RLS — all security is application-level
- Type safety gaps between generated Supabase types and actual query results

## Decision

Replace the Supabase database/query layer with Prisma ORM pointing at the existing Supabase PostgreSQL. Simultaneously revamp the UI with a dark glass aesthetic.

**Keep:** Supabase Auth (cookie-based via `@supabase/ssr`) + Supabase Storage (profile images)
**Replace:** All Supabase SDK database queries → Prisma ORM
**Remove:** `@supabase-cache-helpers/postgrest-react-query`, most React Query usage
**Add:** Prisma Client, dark glass UI design system

---

## Phase 1: Prisma Migration

### Architecture

```
Next.js App (App Router)
├── Server Components → Prisma Client (typed queries, direct DB access)
├── Server Actions → Prisma Client with $transaction() for mutations
├── Supabase Auth (unchanged — cookie-based via @supabase/ssr)
├── Supabase Storage (unchanged — profile images bucket)
└── React Query (kept ONLY for client-side mutations/optimistic UI)
```

### Prisma Schema

Map existing 8 Supabase tables to Prisma models:

| Supabase Table | Prisma Model | Notes |
|---|---|---|
| `user_profiles` | `UserProfile` | Links to Supabase Auth user via `id` |
| `events` | `Event` | `description` stored as JSON |
| `competitions` | `Competition` | Belongs to Event |
| `participants` | `Participant` | Public registrants |
| `competitions_participants` | `CompetitionParticipant` | Join table with status enum |
| `members` | `Member` | Club team roster |
| `resources` | `Resource` | Learning materials with categories |
| `magazines` | `Magazine` | PDF publications |

Key relationships:
- `Event` 1→N `Competition`
- `Participant` N→M `Competition` (via `CompetitionParticipant`)
- `CompetitionParticipant` has status enum: `pending | approved | rejected`

### Migration Strategy

1. Add Prisma with `prisma db pull` to introspect existing Supabase PostgreSQL schema
2. Clean up generated schema (add relations, enums, proper naming)
3. Rewrite `queries/` files to use Prisma (drop `QueryResponseType` wrapper)
4. Rewrite `actions/` files to use Prisma with `$transaction()` where needed
5. Update `getCurrentUser()` — Supabase Auth for session, Prisma for profile lookup
6. Remove `@supabase-cache-helpers/postgrest-react-query` dependency
7. Keep React Query only in components that need client-side state (search, filters, optimistic updates)

### Transaction Fixes

**Registration** (`registerForEventAction`):
```
prisma.$transaction([
  prisma.participant.create({ data: participantData }),
  prisma.competitionParticipant.createMany({ data: competitionJoins })
])
```

**View count** (`incrementResourceViewCount`):
```
prisma.resource.update({
  where: { id },
  data: { view_count: { increment: 1 } }
})
```

### Auth Integration

- `getCurrentUser()` uses Supabase Auth `getUser()` for session/JWT
- Profile data fetched via `prisma.userProfile.findUnique({ where: { id: authUser.id } })`
- `isAdminOrExecutive()` checks profile role via Prisma
- Middleware unchanged — still validates Supabase Auth cookies

### What Gets Removed

- `utils/supabase/supabase-browser.ts` — no longer needed for database queries (kept for auth/storage)
- `@supabase-cache-helpers/postgrest-react-query` — entire package
- `QueryResponseType` wrapper pattern — replaced by Prisma's native typed returns
- PostgREST query builder pattern in `queries/events.ts`

---

## Phase 2: UI Revamp (Public Pages)

### Design Direction

Dark glass aesthetic inspired by Linear/Raycast with ambient red glow effects.

### Design Tokens

**Colors:**
- Base background: `#0a0a0b` with warm undertone
- Surface cards: `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.06)`
- Card borders: `rgba(255, 255, 255, 0.06)` to `rgba(255, 255, 255, 0.10)`
- Accent primary: `#dc2626` (crimson red)
- Accent hover: `#b91c1c`
- Accent glow: Red-orange radial gradients for ambient lighting
- Text primary: `#f5f5f5`
- Text secondary: `#a3a3a3`
- Text muted: `#737373`

**Surfaces:**
- Glass panels: `backdrop-blur-xl` + low-opacity white borders + subtle inner shadow
- Red ambient glow behind hero sections and key content areas (nebula/aurora style)
- Rounded corners: `rounded-xl` to `rounded-2xl`

**Typography:**
- Font: Inter or Geist Sans
- Generous whitespace and letter-spacing
- Clean hierarchy: large bold headings, regular body, muted labels

**Motion:**
- Aceternity UI entrance animations for hero, cards, sections
- Smooth hover transitions on interactive elements
- Subtle parallax or float effects on background shapes

### Component Libraries

- **shadcn/ui** — base component layer (buttons, dialogs, forms, tables)
- **Aceternity UI** — animation components (text effects, card hover, spotlight, moving borders)
- **KokonutUI** — hero backgrounds (shape-hero, gradient meshes)
- **SeraUI** — specialty components as needed

### Page Designs

**1. Landing Page**
- Hero: KokonutUI shape background with red ambient glow, large heading with Aceternity text animation, CTA buttons
- Club highlights: Bento grid with glass cards, stats, featured events
- Objectives section: Icon cards with glass surface
- Footer: Minimal dark with subtle border top

**2. Events Page**
- Filter bar with glass surface
- Event cards: glass panels with poster image, date badge, red accent on hover
- Event detail: full-width hero with poster, glass info cards, registration dialog

**3. About Page**
- Team/member grid with glass avatar cards
- Contributors section
- Mission statement with ambient glow background

**4. Magazine Page**
- Glass card grid for publications
- PDF thumbnail previews
- Download count badges

**5. Resources Page**
- Category filter tabs
- Resource cards with type indicators
- Featured resources highlighted with red accent border

### Admin Pages (Phase 3 — deferred)

Admin pages keep functional layouts but adopt the dark theme and glass surface tokens for visual consistency. No Aceternity animations — focus on data density and usability.

---

## Technical Notes

### Database Connection

Prisma connects to Supabase PostgreSQL via the connection string from Supabase dashboard (Settings → Database → Connection string). Use the `pooler` URL for serverless environments.

### Environment Variables

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Dependencies to Add

- `prisma` (dev dependency)
- `@prisma/client`

### Dependencies to Remove

- `@supabase-cache-helpers/postgrest-react-query`

### Dependencies to Keep

- `@supabase/supabase-js` (auth + storage)
- `@supabase/ssr` (auth cookie handling)
- `@tanstack/react-query` (client-side mutations only)
- `tailwindcss`, `shadcn/ui` components
