# Public UI Pages — Design Spec

**Date:** 2026-05-19
**Scope:** 4 new public routes + 1 landing page component + navbar update
**Depends on:** Database schema redesign (complete — all query layers and server actions in place)

---

## Overview

Add public-facing pages for Blog, Gallery, and Contact, plus an announcements banner on the landing page. Update the navbar to include all new routes.

**Routes:**
| Route | Type | Purpose |
|---|---|---|
| `/blog` | Public | Blog listing — featured hero + card grid |
| `/blog/[slug]` | Public | Single article page |
| `/gallery` | Public | Album cover grid |
| `/gallery/[albumId]` | Public | Album detail — masonry photos + lightbox |
| `/contact` | Public | Contact form + club info |

**Component (no route):**
| Component | Location | Purpose |
|---|---|---|
| `AnnouncementBanner` | Landing page, above Hero | Dismissible notification bar for active announcements |

---

## 1. Navbar Update

**Current:** Home | Events | Resources | Magazine | About

**New:** Home | Events | Blog | Resources | Magazine | Gallery | About | Contact

Add `Blog`, `Gallery`, `Contact` as direct links in the main navigation. No dropdowns — keep it flat. Mobile hamburger menu includes all items.

---

## 2. Blog — `/blog`

### Listing Page (`app/blog/page.tsx`)

**Data fetching:** Server component calls `getPublishedBlogPosts()` and `getFeaturedBlogPosts()`.

**Layout — Featured Hero + Grid:**
- **Featured section:** Top area. The first featured post (or newest if none featured) renders as a large hero card spanning 2/3 width with cover image, title, excerpt, author, date, estimated read time. Beside it, 2 smaller stacked cards showing the next posts.
- **Grid below:** Remaining posts in a responsive 3-column grid (3 cols desktop, 2 tablet, 1 mobile). Each card: cover image, category tag (first tag), title, date, read time estimate.
- **Tag filter pills:** Row of tag buttons at top. Client-side filtering via React state — all posts fetched server-side, filtered in the client component. No server round-trip on filter change.
- **Empty state:** "No blog posts yet" centered message with a subtle icon.

**Read time estimate:** `Math.ceil(wordCount / 200)` minutes, calculated from the TipTap JSON content by extracting text nodes.

### Article Page (`app/blog/[slug]/page.tsx`)

**Data fetching:** Server component calls `getBlogPostBySlug(slug)`. Calls `incrementBlogPostViewCount(postId)` on load (fire-and-forget, don't block render).

**Layout — Centered article:**
- Max-width ~720px, centered.
- **Header:** Full-width cover image (if present), title (h1), author name, published date, read time, tag badges.
- **Body:** TipTap JSON content rendered via the existing `MinimalTiptapEditor` component in read-only/view mode. This reuses the TipTap setup already in the project.
- **Footer:** "← Back to Blog" link. View count display.
- **404:** If slug not found, call `notFound()` from next/navigation.

---

## 3. Gallery — `/gallery`

### Album Listing (`app/gallery/page.tsx`)

**Data fetching:** Server component calls `getPublishedAlbums()`.

**Layout — 2-column album grid:**
- Responsive grid: 2 cols desktop, 1 col mobile.
- **Each album card:** Cover image as CSS background with a gradient overlay (transparent → dark) at the bottom. Album title and photo count (from `images.length`) overlaid in white text. Framer Motion hover: slight scale + shadow lift.
- **Event badge:** Albums linked to an event show a small badge/tag on the card with the event title.
- **Empty state:** "No galleries yet" centered message.

### Album Detail (`app/gallery/[albumId]/page.tsx`)

**Data fetching:** Server component calls `getAlbumById(albumId)`.

**Layout:**
- **Header:** Album title, description (if present), link to associated event (if linked), photo count.
- **Photo grid:** CSS `columns` masonry layout (3 cols desktop, 2 tablet, 1 mobile). Each image rendered as a clickable thumbnail with optional caption below.
- **Lightbox viewer:** Client component using shadcn `Dialog` as a full-screen overlay. Clicking a photo opens it full-size with:
  - Prev/Next navigation (arrow buttons + keyboard arrows)
  - Caption display
  - Close button (X + Escape key)
  - Image counter ("3 of 24")
- **Back link:** "← Back to Gallery" at top.
- **404:** If album not found, call `notFound()`.

---

## 4. Contact — `/contact`

### Contact Page (`app/contact/page.tsx`)

**Layout — Two-column, stacks on mobile:**

**Left column (wider — ~60%):** Contact form.
- React Hook Form + Zod validation using `contactSubmissionSchema` (name, email, subject, message).
- Submit calls `submitContactFormAction()` (no auth required — public form).
- **Success state:** Form replaced by green checkmark icon + "Message sent successfully" text + "Send another" link.
- **Error state:** Sonner toast with error message.
- **Spam prevention:** Submit button disabled for 30 seconds after successful submission (client-side `setTimeout`).

**Right column (~40%):** Club information card.
- School name: Adamjee Cantonment Public School
- Club name: Club of Mathematics (ACPSCM)
- Address: ACPS Campus (text)
- Email: club email address
- Social media links: icons linking to Facebook, etc.
- Google Maps embed: `<iframe>` showing the school location (or a static placeholder image if no Maps API key).

---

## 5. Announcements Banner

### Component: `AnnouncementBanner` (on landing page)

**Data fetching:** Server component calls `getActiveAnnouncements()` — returns announcements where `is_active = true` AND (`expires_at IS NULL` OR `expires_at > now()`), ordered by `is_pinned DESC, created_at DESC`. Takes the first result only.

**Renders above the Hero section** in `app/page.tsx`.

**Layout:** Full-width bar, slim (single line of text).
- **Background by priority:**
  - `urgent`: red/amber accent (`#dc2626` with white text)
  - `normal`: forest green (`#2d6b4f` with white text)
  - `low`: muted beige (`#f0ebe3` with dark text)
- **Content:** Announcement title. Megaphone icon for urgent priority.
- **Dismiss button:** X icon on the right side.

**Dismissal behavior:** Client component wrapping the server-fetched data.
- On dismiss, stores the announcement ID in `sessionStorage`.
- On mount, checks `sessionStorage` — if this announcement was dismissed, renders nothing.
- No announcements active: component renders `null` (no empty space).

---

## 6. Shared Patterns

All new pages follow existing codebase conventions:

- **Server components** for data fetching (no `"use client"` on page files)
- **Client components** for interactivity (forms, filters, lightbox, dismiss)
- **Suspense boundaries** with loading spinners for async data
- **JSON serialization** at server→client boundary (`JSON.parse(JSON.stringify(data))`) for Prisma date objects
- **Framer Motion** for page entrance animations and hover effects
- **shadcn/ui components:** Card, Badge, Button, Dialog (lightbox), Input, Textarea, Form
- **Lucide icons** for UI elements
- **Sonner** for toast notifications (contact form errors/success)
- **Responsive:** Mobile-first with `md:` and `lg:` breakpoints
- **Theme:** Warm beige background, forest green primary, consistent with existing pages

---

## 7. File Structure

### New files to create:
```
app/blog/
  page.tsx                    — Blog listing (server component)
app/blog/[slug]/
  page.tsx                    — Blog article (server component)
components/blog/
  BlogClient.tsx              — Client component: tag filters + card grid
  BlogPostCard.tsx            — Individual post card
  FeaturedPost.tsx            — Large featured hero card
  BlogArticle.tsx             — Article body renderer (TipTap read-only)

app/gallery/
  page.tsx                    — Gallery album listing (server component)
app/gallery/[albumId]/
  page.tsx                    — Album detail (server component)
components/gallery/
  GalleryClient.tsx           — Client wrapper for album grid with motion
  AlbumCard.tsx               — Album cover card with overlay
  PhotoGrid.tsx               — Masonry photo grid
  Lightbox.tsx                — Full-screen image viewer dialog

app/contact/
  page.tsx                    — Contact page (server component)
components/contact/
  ContactForm.tsx             — Form with React Hook Form + Zod
  ClubInfo.tsx                — Club info sidebar card

components/announcements/
  AnnouncementBanner.tsx      — Dismissible banner (client component)
  AnnouncementServer.tsx      — Server wrapper that fetches data
```

### Files to modify:
```
components/shared/Navbar.tsx  — Add Blog, Gallery, Contact nav links
components/home/Footer.tsx    — Add Blog, Gallery, Contact footer links
app/page.tsx                  — Add AnnouncementBanner above Hero
```
