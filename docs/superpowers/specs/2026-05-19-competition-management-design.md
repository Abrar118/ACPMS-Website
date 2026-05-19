# Competition Management Admin — Design Spec

**Date:** 2026-05-19
**Scope:** Refactor event detail page to tabs + add Results, Teams, Payments, and Participants tabs
**Depends on:** Database schema redesign (complete), content admin pages (complete)

---

## Overview

Refactor the existing `/admin/events/[eventId]` page from a vertical card layout to a tab-based interface. The existing Overview + Competitions content becomes the first tab. Four new tabs are added: Results (inline score entry), Teams (team CRUD + member management), Payments (verification workflow), and Participants (moved from separate route).

---

## 1. Tab Structure

### `/admin/events/[eventId]` — Tab-based Layout

**Tabs:** Overview | Results | Teams | Payments | Participants

The `AdminEventDetailClient` component is refactored to use shadcn `Tabs`. Each tab renders its own content component.

**Server page changes:** The async data-fetching component in `app/admin/events/[eventId]/page.tsx` expands its `Promise.all()` to also fetch:
- `getEventParticipantsDetailed(eventId)` — for Participants tab
- `getResultsByCompetition(competitionId)` — for Results tab (per-competition, fetched client-side on tab/competition change instead)
- `getPaymentsByEvent(eventId)` — for Payments tab
- Teams: fetched client-side per competition selection

**Tab state:** Managed via URL search params (`?tab=results`) so tabs are linkable and refresh-safe.

---

## 2. Overview Tab (Existing Content)

No changes to the existing event details card + competitions list. Just wrapped in a `TabsContent` with `value="overview"`.

---

## 3. Results Tab

### Competition selector + inline score table

**Layout:**
- **Competition dropdown** at top — lists all competitions for this event. Selecting one triggers a client-side fetch of results + approved participants for that competition.
- **Results table** below. Columns:
  - Participant/Team name (read-only)
  - Institution (read-only)
  - Score — inline `Input` type="number"
  - Rank — inline `Input` type="number"
  - Remarks — inline `Input` text (e.g. "Gold Medal", "Honorable Mention")
  - Certificate URL — inline `Input` (optional)

**Behavior:**
- Table pre-populates from existing `competition_results` for the selected competition. If no results exist yet, shows all approved participants with empty score/rank fields.
- **"Auto-rank by score"** button — sorts rows by score descending and fills in sequential rank numbers (1, 2, 3...).
- **"Save Results"** button — processes all rows. Creates new results (via `bulkCreateResultsAction`) or updates existing ones (via `updateResultAction`). Shows toast on success/error.
- **Empty state:** "No approved participants for this competition. Approve participants first." shown when no approved participants exist.

**Data flow:** Results are fetched client-side when a competition is selected (not in the server page's `Promise.all()`). This avoids fetching results for all competitions upfront. Uses `useEffect` + `fetch` pattern or calls the query function via a lightweight server action wrapper.

---

## 4. Teams Tab

### Team list with expandable member management

**Layout:**
- **"Create Team"** button at top — opens a dialog with Team Name + Institution fields.
- **Team cards** below — one card per team registered in this event's competitions.

**Each team card shows:**
- Team name, institution, member count
- Competition they're registered for (badge)
- Expand/collapse toggle to show members

**Expanded member view:**
- List of team members: Participant name + Role badge (captain/member) + Remove (X) button
- **"Add Member"** form at bottom: Select from approved participants (dropdown) + Role select (captain/member) + "Add" button

**Actions:**
- Create team: `createTeamAction(data)` → then admin adds members
- Add member: `addTeamMemberAction({ team_id, participant_id, role })`
- Remove member: `removeTeamMemberAction(teamId, participantId)`
- Delete team: `deleteTeamAction(teamId)` with confirmation dialog

**Data:** Teams for this event are derived from `competitions_participants` records that have a `team_id` set, plus any teams created but not yet registered. Fetched client-side.

---

## 5. Payments Tab

### Payment verification table with summary stats

**Summary cards** at top (4-column grid):
- Total Payments (count)
- Pending (count, yellow)
- Verified (count, green)
- Rejected (count, red)

**Filter:** Status dropdown (All / Pending / Verified / Rejected)

**Payments table.** Columns:
- Participant name
- Competition name
- Amount
- Provider
- Transaction ID
- Status — Badge (pending=yellow `bg-yellow-500`, verified=green `bg-green-500`, rejected=red `bg-red-500`)
- Verified By (admin name if verified, "—" otherwise)
- Actions

**Actions per row (only when status is "pending"):**
- "Verify" button (green) — calls `verifyPaymentAction(id, "verified")`
- "Reject" button (red) — calls `verifyPaymentAction(id, "rejected")`

No create/edit — payments are created during registration. Admin only verifies or rejects.

**Data:** Fetched server-side via `getPaymentsByEvent(eventId)` in the page's `Promise.all()`.

---

## 6. Participants Tab (Moved)

Move the existing `EventParticipantsClient` content from the separate `/admin/events/[eventId]/participants` route into this tab.

**The separate route stays functional** — the server page at `app/admin/events/[eventId]/participants/page.tsx` can either redirect to the main event page with `?tab=participants`, or render the same content. This preserves existing bookmarks.

**No changes to the participants component itself** — it already works. Just imported into the new tab.

---

## 7. File Structure

### New files:
```
components/events/admin/tabs/
  ResultsTab.tsx              — Competition selector + inline score table + save
  TeamsTab.tsx                — Team cards + expandable members + CRUD
  PaymentsTab.tsx             — Summary stats + verification table
```

### Modified files:
```
app/admin/events/[eventId]/page.tsx              — Expand data fetching for all tabs
components/events/admin/AdminEventDetailClient.tsx — Refactor to shadcn Tabs, import tab components
app/admin/events/[eventId]/participants/page.tsx  — Redirect to ?tab=participants (or keep as-is)
```

### No new routes — everything is tabs within the existing event detail page.
