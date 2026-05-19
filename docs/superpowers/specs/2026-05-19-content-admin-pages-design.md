# Content Admin Pages — Design Spec

**Date:** 2026-05-19
**Scope:** Admin CRUD interfaces for blog, announcements, gallery, contact submissions, and magazines
**Depends on:** Database schema redesign (complete), public UI pages (complete)

---

## Overview

Add admin pages for managing content across the 5 new/updated domain areas. All follow the existing admin pattern (sidebar layout, server component data fetch, client component with table + dialogs) except the blog editor which gets dedicated create/edit pages for the TipTap rich text editor.

---

## 1. Admin Routes

### New routes:
| Route | Purpose |
|---|---|
| `/admin/blog` | Blog post listing table |
| `/admin/blog/new` | Create blog post (full-page TipTap editor) |
| `/admin/blog/[id]/edit` | Edit blog post (full-page TipTap editor) |
| `/admin/announcements` | Announcements CRUD (table + dialog) |
| `/admin/gallery` | Gallery albums CRUD (table + dialog with image management) |
| `/admin/contact` | Contact submissions (read-only table + status actions) |

### Existing route to fix:
| Route | Fix |
|---|---|
| `/admin/magazines` | Wire up to new query layer + actions (currently non-functional) |

### Sidebar update:
Add to `components/admin/AdminSidebar.tsx` menu items:
- New "Content" group containing: Blog, Announcements, Gallery
- Contact Submissions under existing management
- Magazines already exists

---

## 2. Blog Admin

### `/admin/blog` — Listing Page

**Data:** Server component calls `getAllBlogPosts()`.

**Table columns:** Title, Tags (badges), Status (Published/Draft badge), Views, Published Date, Actions.

**Actions per row:**
- Edit — link to `/admin/blog/[id]/edit`
- Toggle Publish — calls `updateBlogPostAction(id, { is_published: !current })`
- Delete — confirmation dialog, calls `deleteBlogPostAction(id)`

**Header:** "Blog Posts" title + "New Post" button linking to `/admin/blog/new`.

**Empty state:** "No blog posts yet" with "Create your first post" CTA.

### `/admin/blog/new` — Create Post

**Full-page client component** (not a dialog — the TipTap editor needs room).

**Form fields:**
- Title — `Input`, required
- Slug — `Input`, auto-generated from title on change (`title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`), editable
- Excerpt — `Textarea`, optional, max 300 chars
- Cover Image URL — `Input`, optional
- Tags — comma-separated `Input` (split on submit)
- Featured — `Checkbox`
- Content — `MinimalTiptapEditor` with full toolbar, large height

**Submit buttons:**
- "Save as Draft" — `is_published: false`
- "Publish" — `is_published: true`
- "Cancel" — returns to `/admin/blog`

**On save:** Calls `createBlogPostAction()`, redirects to `/admin/blog` on success, shows Sonner toast on error.

### `/admin/blog/[id]/edit` — Edit Post

**Same form as create**, pre-populated with existing post data.

**Data:** Server component calls `getBlogPostById(id)`. 404 if not found.

**Submit buttons adapt:**
- If draft: "Save Draft" + "Publish"
- If published: "Save" + "Unpublish"

**On save:** Calls `updateBlogPostAction()`, redirects to `/admin/blog`.

---

## 3. Announcements Admin

### `/admin/announcements` — Table + Dialog

**Data:** Server component calls `getAllAnnouncements()`.

**Table columns:** Title, Priority (badge: red=urgent, green=normal, muted=low), Pinned (pin icon), Active (toggle), Expires At, Created.

**Create/Edit dialog fields:**
- Title — `Input`, required
- Body — `Textarea`, required
- Priority — `Select`: low, normal, urgent
- Pinned — `Checkbox`
- Expires At — date `Input` (type="datetime-local"), optional

**Actions per row:**
- Edit — opens dialog pre-populated
- Toggle Active — calls `updateAnnouncementAction(id, { is_active: !current })`
- Delete — confirmation dialog, calls `deleteAnnouncementAction(id)`

---

## 4. Gallery Admin

### `/admin/gallery` — Table + Dialog with Image Management

**Data:** Server component calls `getAllAlbums()`.

**Table columns:** Title, Cover (small thumbnail), Photos (count), Published (toggle), Event Link, Created.

**Create dialog fields:**
- Title — `Input`, required
- Description — `Textarea`, optional
- Cover Image URL — `Input`, optional
- Event — `Select` populated from `getPublishedEvents()`, optional
- Published — `Checkbox`
- Display Order — number `Input`

**Edit dialog fields:** Same as create, plus an **Image Management** section below:
- Grid of existing image thumbnails (small, ~80px), each with a delete (X) button
- "Add Image" sub-form at the bottom: Image URL (`Input`) + Caption (`Input`) + "Add" button
- No drag-drop — display_order managed via number inputs on each image

**Actions per row:**
- Edit — opens dialog with image management
- Toggle Published — calls `updateAlbumAction(id, { is_published: !current })`
- Delete — confirmation dialog (cascades images), calls `deleteAlbumAction(id)`

---

## 5. Contact Submissions Admin

### `/admin/contact` — Read-only Table + Status Actions

**Data:** Server component calls `getAllContactSubmissions()`.

**Table columns:** Name, Email, Subject, Status (badge: new=blue, read=yellow, replied=green, archived=muted), Submitted At.

**No create/edit** — submissions come from the public `/contact` form.

**View dialog:** Click row or "View" button opens a dialog showing:
- Name, Email, Subject (header)
- Full message body
- Submitted date
- Current status badge
- Action buttons: "Mark Read", "Mark Replied", "Archive"

**Status actions:**
- Mark Read — `updateContactStatusAction(id, "read")`
- Mark Replied — `markContactAsRepliedAction(id)`
- Archive — `updateContactStatusAction(id, "archived")`
- Delete — confirmation dialog, `deleteContactSubmissionAction(id)`

---

## 6. Magazines Admin (Fix Existing)

### `/admin/magazines` — Replace Non-functional Page

**Data:** Server component calls `getAllMagazines()`.

**Table columns:** Title, Volume/Issue (formatted as "Vol. N, Issue N"), Published (toggle), Language, Downloads, Created.

**Create/Edit dialog fields:**
- Title — `Input`, required
- Summary — `Textarea`, optional
- Volume — number `Input`
- Issue — number `Input`
- PDF URL — `Input`, optional
- Cover Image URL — `Input`, optional
- Published Date — date `Input`
- Language — `Select` (English default)
- DOI — `Input`, optional
- Access Level — `Select`: public, restricted, members_only
- Chief Patron — `Input`, optional
- Tags — comma-separated `Input`

**Actions per row:**
- Edit — opens dialog pre-populated
- Toggle Published — calls `toggleMagazinePublishedAction(id, !current)`
- Delete — confirmation dialog (soft delete via archive), calls `deleteMagazineAction(id)`

---

## 7. Shared Patterns

All admin pages follow existing conventions:

- **Layout:** `AdminLayout` wrapper with `SidebarProvider` + `SidebarInset`
- **Header:** `SidebarTrigger` + `Breadcrumb` navigation
- **Auth:** Server component checks `getCurrentUser()` + `isAdminOrExecutive()` — redirects if unauthorized
- **Tables:** Custom table markup with `text-sm` styling (matching existing events/resources admin)
- **Dialogs:** shadcn `Dialog` with `DialogContent`, `DialogHeader`, `DialogTitle`
- **Forms:** React Hook Form + Zod validation + glass morphism input styling
- **Toasts:** Sonner for success/error feedback
- **Revalidation:** All mutations call `revalidatePath()` on the admin route
- **Confirmation:** Delete actions use an `AlertDialog` with "Are you sure?" prompt

---

## 8. File Structure

### New files:
```
app/admin/blog/
  page.tsx                              — Blog listing (server)
app/admin/blog/new/
  page.tsx                              — Create post (server wrapper)
app/admin/blog/[id]/edit/
  page.tsx                              — Edit post (server wrapper)
components/admin/blog/
  AdminBlogClient.tsx                   — Listing table + actions
  BlogEditor.tsx                        — Create/edit form with TipTap

app/admin/announcements/
  page.tsx                              — Announcements listing (server)
components/admin/announcements/
  AdminAnnouncementsClient.tsx          — Table + create/edit dialog

app/admin/gallery/
  page.tsx                              — Gallery listing (server)
components/admin/gallery/
  AdminGalleryClient.tsx                — Table + create/edit dialog with image management

app/admin/contact/
  page.tsx                              — Contact submissions (server)
components/admin/contact/
  AdminContactClient.tsx                — Read-only table + view dialog + status actions
```

### Modified files:
```
components/admin/AdminSidebar.tsx       — Add Blog, Announcements, Gallery, Contact nav items
app/admin/magazines/page.tsx            — Replace with functional implementation
components/admin/magazines/
  AdminMagazinesClient.tsx              — New client component for magazines CRUD
```
