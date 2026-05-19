# Competition Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the event detail admin page to a tab-based layout and add Results, Teams, Payments, and Participants tabs for full competition management.

**Architecture:** The existing `AdminEventDetailClient` is refactored to use shadcn `Tabs`. Each tab is a separate component file in `components/events/admin/tabs/`. The server page expands its data fetching to include participants and payments. Results and teams are fetched client-side per competition selection to avoid loading everything upfront.

**Tech Stack:** Next.js 15 (App Router), shadcn/ui (Tabs, Card, Table, Badge, Button, Dialog, Select), React Hook Form, Sonner, Lucide icons

**Spec:** `docs/superpowers/specs/2026-05-19-competition-management-design.md`

**No test framework** configured. Verification uses `npm run build`.

---

## File Structure

### New files
| File | Purpose |
|---|---|
| `components/events/admin/tabs/ResultsTab.tsx` | Per-competition inline score table with bulk save + auto-rank |
| `components/events/admin/tabs/TeamsTab.tsx` | Team cards with expandable member management |
| `components/events/admin/tabs/PaymentsTab.tsx` | Summary stats + payment verification table |

### Modified files
| File | Changes |
|---|---|
| `app/admin/events/[eventId]/page.tsx` | Expand data fetching to include participants + payments |
| `components/events/admin/AdminEventDetailClient.tsx` | Refactor to shadcn Tabs, import tab components |

---

## Task 1: Expand Server Page Data Fetching

**Files:**
- Modify: `app/admin/events/[eventId]/page.tsx`

- [ ] **Step 1: Update imports and data fetching**

Replace the entire file with:

```tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getEventById } from "@/lib/db/events";
import { getEventCompetitions } from "@/lib/db/competitions";
import { getEventParticipantsDetailed } from "@/lib/db/participants";
import { getPaymentsByEvent } from "@/lib/db/payments";
import AdminEventDetailClient from "@/components/events/admin/AdminEventDetailClient";

interface AdminEventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

async function EventDetail({ eventId }: { eventId: string }) {
  const [event, competitions, participants, payments] = await Promise.all([
    getEventById(eventId),
    getEventCompetitions(eventId),
    getEventParticipantsDetailed(eventId),
    getPaymentsByEvent(eventId),
  ]);

  if (!event) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify({ event, competitions, participants, payments }));

  return (
    <AdminEventDetailClient
      event={serialized.event}
      competitions={serialized.competitions}
      participants={serialized.participants}
      payments={serialized.payments}
    />
  );
}

export default async function AdminEventDetailPage({ params }: AdminEventDetailPageProps) {
  const { eventId } = await params;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/events">Events</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Event Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<div>Loading event details...</div>}>
          <EventDetail eventId={eventId} />
        </Suspense>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (new props are passed but not yet consumed — TypeScript will warn but not error since AdminEventDetailClient will be updated in Task 2)

- [ ] **Step 3: Commit**

```bash
git add app/admin/events/[eventId]/page.tsx
git commit -m "feat: expand event detail data fetching for tabs"
```

---

## Task 2: Refactor AdminEventDetailClient to Tabs

**Files:**
- Modify: `components/events/admin/AdminEventDetailClient.tsx`

- [ ] **Step 1: Refactor the component to use shadcn Tabs**

Replace the entire file content. The existing Overview content (event details card + competitions card) moves into the Overview tab. New tabs import placeholder components that will be implemented in subsequent tasks.

The subagent should:

1. Read the current file at `components/events/admin/AdminEventDetailClient.tsx`
2. Refactor it to use shadcn `Tabs` from `@/components/ui/tabs`
3. Keep ALL existing content (event details card + competitions card + add competition dialog) inside `<TabsContent value="overview">`
4. Add tab triggers for: Overview, Results, Teams, Payments, Participants
5. Update the interface to accept the new props: `participants` and `payments`
6. Import and render the tab components (create stub placeholders inline for now — they'll be replaced in Tasks 3-5):
   - ResultsTab gets `competitions` and `eventId` props
   - TeamsTab gets `competitions` and `eventId` props
   - PaymentsTab gets `payments` prop
   - Participants tab renders `EventParticipantsClient` with `event`, `competitions`, `participants` props
7. Remove the "View Participants" button from the header (participants are now a tab)
8. Use `defaultValue="overview"` on the Tabs component

**Key imports to add:**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventParticipantsClient from "./EventParticipantsClient";
import type { ParticipantWithRegistrations } from "@/lib/db/participants";
import type { PaymentWithDetails } from "@/lib/db/payments";
```

**Updated interface:**
```tsx
interface AdminEventDetailClientProps {
  event: Event;
  competitions: Competition[];
  participants: ParticipantWithRegistrations[];
  payments: PaymentWithDetails[];
  error?: string;
}
```

**Tab structure (wrapping existing content):**
```tsx
<Tabs defaultValue="overview" className="space-y-6">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="results">Results</TabsTrigger>
    <TabsTrigger value="teams">Teams</TabsTrigger>
    <TabsTrigger value="payments">Payments</TabsTrigger>
    <TabsTrigger value="participants">Participants</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* existing event details card + competitions card + add competition dialog */}
  </TabsContent>

  <TabsContent value="results">
    <ResultsTab competitions={competitions} eventId={event.id} />
  </TabsContent>

  <TabsContent value="teams">
    <TeamsTab competitions={competitions} eventId={event.id} />
  </TabsContent>

  <TabsContent value="payments">
    <PaymentsTab payments={payments} />
  </TabsContent>

  <TabsContent value="participants">
    <EventParticipantsClient
      event={event}
      competitions={competitions}
      participants={participants}
    />
  </TabsContent>
</Tabs>
```

For now, create simple stub components for ResultsTab, TeamsTab, PaymentsTab inline or as separate files at `components/events/admin/tabs/ResultsTab.tsx`, etc. with just a placeholder `<Card><CardContent>Coming soon</CardContent></Card>`. They'll be fully implemented in Tasks 3-5.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -10`

- [ ] **Step 3: Commit**

```bash
git add components/events/admin/AdminEventDetailClient.tsx components/events/admin/tabs/
git commit -m "feat: refactor event detail to tab layout with Overview, Results, Teams, Payments, Participants"
```

---

## Task 3: Results Tab

**Files:**
- Create (or replace stub): `components/events/admin/tabs/ResultsTab.tsx`

- [ ] **Step 1: Create the full ResultsTab component**

The subagent should create `components/events/admin/tabs/ResultsTab.tsx` with:

**Props:** `competitions: Competition[]`, `eventId: string`

**Layout:**
1. Competition selector (`Select` from shadcn) listing all competitions
2. When a competition is selected, fetch its results + approved participants client-side
3. Inline editable table with columns: Participant/Team, Institution, Score (number Input), Rank (number Input), Remarks (text Input), Certificate URL (Input)
4. "Auto-rank by score" button that sorts by score descending and fills sequential ranks
5. "Save Results" button that processes all rows

**Key implementation details:**
- Use `useState` for selected competition, results rows, loading state
- Use `useEffect` to fetch data when competition changes — create a server action wrapper:

```tsx
// At the top of the file, create a server action for fetching results
"use server" actions cannot be in client components, so create a helper:
```

Actually, since we can't call Prisma directly from client components, the component should:
- Accept all competitions as props
- When a competition is selected, call a lightweight server action (or use `fetch`) to get results + approved participants
- We need a new server action for fetching: create `actions/competition-results.ts` already has `createResultAction`, `updateResultAction`, `bulkCreateResultsAction` — but we need a read action too.

**Solution:** Add a `getResultsForCompetitionAction` server action that wraps `getResultsByCompetition` and `getEventParticipantsDetailed`. Or simpler: pass all participants from the parent (already available) and fetch results per competition.

**Recommended approach:** The parent already has `participants` data. Results are fetched via a new server action:

Create a helper server action in `actions/competition-results.ts`:
```tsx
export async function getResultsForCompetitionAction(competitionId: string) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Auth required", data: [] };
    if (!(await isAdminOrExecutive())) return { success: false, error: "Insufficient permissions", data: [] };
    
    const results = await getResultsByCompetition(competitionId);
    return { success: true, data: JSON.parse(JSON.stringify(results)) };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}
```

**Component features:**
- State: `selectedCompetitionId`, `rows` (array of { participantId?, teamId?, name, institution, score, rank, remarks, certificateUrl, existingResultId? }), `loading`
- When competition selected: fetch existing results, merge with approved participants list to build editable rows
- Auto-rank: sort rows by score desc, assign sequential ranks
- Save: for rows with `existingResultId`, call `updateResultAction`; for new rows with scores, call `bulkCreateResultsAction`
- Toast on success/error

**Imports:**
```tsx
import { getResultsForCompetitionAction, bulkCreateResultsAction, updateResultAction } from "@/actions/competition-results";
import type { Competition } from "@/lib/db/competitions";
```

- [ ] **Step 2: Add the `getResultsForCompetitionAction` to `actions/competition-results.ts`**

Append to the existing file:
```tsx
import { getResultsByCompetition } from "@/lib/db/competition-results";

export async function getResultsForCompetitionAction(
  competitionId: string
): Promise<ResultActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions" };

    const results = await getResultsByCompetition(competitionId);
    return { success: true, data: JSON.parse(JSON.stringify(results)) };
  } catch (error: any) {
    console.error("Error fetching results:", error);
    return { success: false, error: error.message || "Failed to fetch results" };
  }
}
```

Note: `getResultsByCompetition` is already imported at the top of the actions file — check and add if missing.

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add components/events/admin/tabs/ResultsTab.tsx actions/competition-results.ts
git commit -m "feat: add Results tab with inline score entry and auto-rank"
```

---

## Task 4: Teams Tab

**Files:**
- Create (or replace stub): `components/events/admin/tabs/TeamsTab.tsx`

- [ ] **Step 1: Create the full TeamsTab component**

**Props:** `competitions: Competition[]`, `eventId: string`

**Layout:**
1. "Create Team" button at top → opens Dialog with Name + Institution fields
2. Team cards below — fetched client-side via a new server action
3. Each card: team name, institution, member count, competition badge, expand/collapse
4. Expanded: member list with name + role badge (captain/member) + remove X button
5. "Add Member" form at bottom of expanded section: participant Select + role Select + "Add" button

**Need a new server action for fetching teams.** Add to `actions/teams.ts`:
```tsx
import { getTeamsByCompetition } from "@/lib/db/teams";

export async function getTeamsForEventAction(
  competitionIds: string[]
): Promise<TeamActionResult> {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user || !profile) return { success: false, error: "Authentication required" };
    if (!(await isAdminOrExecutive()))
      return { success: false, error: "Insufficient permissions" };

    const allTeams = [];
    for (const compId of competitionIds) {
      const teams = await getTeamsByCompetition(compId);
      allTeams.push(...teams);
    }
    // Deduplicate by team ID
    const uniqueTeams = Array.from(new Map(allTeams.map(t => [t.id, t])).values());
    return { success: true, data: JSON.parse(JSON.stringify(uniqueTeams)) };
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return { success: false, error: error.message || "Failed to fetch teams" };
  }
}
```

**Component features:**
- State: `teams` array, `isCreateOpen` (dialog), `expandedTeamId`, `loading`
- On mount: fetch teams for all competition IDs via `getTeamsForEventAction`
- Create team: `createTeamAction({ name, institution })` → refetch teams
- Add member: `addTeamMemberAction({ team_id, participant_id, role })` → refetch
- Remove member: `removeTeamMemberAction(teamId, participantId)` → refetch
- Delete team: `deleteTeamAction(teamId)` with confirmation → refetch
- Participant dropdown: populated from participants that are approved (need participants prop or fetch)

**Note:** Pass `participants` from the parent component (already available in AdminEventDetailClient) as a prop to TeamsTab so the "Add Member" dropdown can list approved participants.

Update TeamsTab props: `competitions: Competition[]`, `eventId: string`, `participants: ParticipantWithRegistrations[]`

**Imports:**
```tsx
import { createTeamAction, deleteTeamAction, addTeamMemberAction, removeTeamMemberAction, getTeamsForEventAction } from "@/actions/teams";
import type { Competition } from "@/lib/db/competitions";
import type { ParticipantWithRegistrations } from "@/lib/db/participants";
```

- [ ] **Step 2: Add `getTeamsForEventAction` to `actions/teams.ts`**

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add components/events/admin/tabs/TeamsTab.tsx actions/teams.ts
git commit -m "feat: add Teams tab with team CRUD and member management"
```

---

## Task 5: Payments Tab

**Files:**
- Create (or replace stub): `components/events/admin/tabs/PaymentsTab.tsx`

- [ ] **Step 1: Create the full PaymentsTab component**

**Props:** `payments: PaymentWithDetails[]`

This tab receives all data from the server (already fetched in the page). No client-side fetching needed.

**Layout:**
1. **Summary stats cards** (4-column grid): Total, Pending (yellow), Verified (green), Rejected (red)
2. **Status filter** dropdown: All / Pending / Verified / Rejected
3. **Payments table**: Participant, Competition, Amount, Provider, Transaction ID, Status (badge), Verified By, Actions
4. **Actions** (only for pending): "Verify" button (green), "Reject" button (red)

**Component features:**
- State: `statusFilter` (string), `isPending` (useTransition)
- `filteredPayments` computed via `useMemo` based on filter
- Summary stats computed from full `payments` array (not filtered)
- Verify: `verifyPaymentAction(id, "verified")` → toast
- Reject: `verifyPaymentAction(id, "rejected")` → toast
- Status badges: pending=`bg-yellow-500`, verified=`bg-green-500`, rejected=`bg-red-500`

**Imports:**
```tsx
import { verifyPaymentAction } from "@/actions/payments";
import type { PaymentWithDetails } from "@/lib/db/payments";
```

The component is self-contained — pure presentation + action calls. No dialogs or complex state.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/events/admin/tabs/PaymentsTab.tsx
git commit -m "feat: add Payments tab with verification workflow"
```

---

## Task 6: Final Verification

- [ ] **Step 1: Run full build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds. `/admin/events/[eventId]` still in route list.

- [ ] **Step 2: Verify all tab components are wired up**

Check that `AdminEventDetailClient.tsx` imports all three real tab components (not stubs):
```bash
rg "import.*ResultsTab\|import.*TeamsTab\|import.*PaymentsTab" components/events/admin/AdminEventDetailClient.tsx
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`
- Navigate to `/admin/events/[eventId]`
- Verify 5 tabs appear: Overview, Results, Teams, Payments, Participants
- Overview tab shows existing event details + competitions
- Results tab shows competition selector
- Teams tab shows "Create Team" button
- Payments tab shows summary stats + table
- Participants tab shows the participant table (moved from separate route)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification — competition management complete"
```

---

## Summary

| Task | What | Files |
|---|---|---|
| 1 | Expand server page data fetching | `app/admin/events/[eventId]/page.tsx` |
| 2 | Refactor to tabs layout | `AdminEventDetailClient.tsx`, stub tab files |
| 3 | Results tab | `tabs/ResultsTab.tsx`, `actions/competition-results.ts` |
| 4 | Teams tab | `tabs/TeamsTab.tsx`, `actions/teams.ts` |
| 5 | Payments tab | `tabs/PaymentsTab.tsx` |
| 6 | Final verification | — |
