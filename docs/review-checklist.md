# Review Checklist

A practical pre-launch / post-change checklist for the site. Work top to bottom.
The homepage is the **graph universe**; most checks revolve around it plus the
standard routed pages.

> Run `npm run dev` and open <http://localhost:3000>. For a production-accurate
> pass, run `npm run build` then `npm run start`.

---

## 1. Desktop review

Use a trackpad/mouse on a wide screen (≥1280px).

- [ ] Home loads and the graph **fades in** centered (identity **core** + 6 domains).
- [ ] Ambient field reads as infrastructure: **core glow**, faint concentric
      **rings**, blueprint grid/reticle, and slow **data traces** on edges.
- [ ] The intro shows the eyebrow **"Systems Operating Layer"** above the
      headline ("A living map of how I think.") at top-left at root.
- [ ] **Hover** a node: it brightens, its neighbors illuminate, and connected
      edges animate (tracing).
- [ ] **Click a domain** (e.g. *Case Studies*): the camera zooms in and reveals
      that domain's systems; ancestors stay visible for context.
- [ ] **Breadcrumb** (top-left, coordinate-style "Map / … / L*n*" with a live
      status dot) updates and each crumb is clickable.
- [ ] **Zoom out** and **Reset** buttons (top-right) appear once you've drilled in
      and behave correctly.
- [ ] **Background click** zooms out one level; **Escape** also zooms out.
- [ ] **Drag** empty space pans; **scroll** zooms toward the cursor (map-style).
- [ ] **Metadata panel** (bottom-left) updates to the hovered/focused node and
      shows kind, status, metric, summary, and child **"Explore"** chips, with a
      tone-colored accent line at the top.
- [ ] **"Open full page"** in the panel navigates to the real route (e.g. a case
      study detail page).
- [ ] **Keyboard:** `Tab` moves between revealed nodes, `Enter` enters a node,
      `Escape` zooms out, focus ring is visible.
- [ ] Header nav + **Contact** button work from the home screen.
- [ ] All routes load with no console errors: `/about`, `/case-studies`,
      a case-study detail, `/projects`, `/products`, `/services`, `/writing`,
      `/contact`.
- [ ] With OS **Reduce Motion** enabled, the core pulse, edge tracing, and data
      traces stop and the camera snaps instead of animating.

## 2. Mobile review

Use a real phone or device emulation (~375–414px wide).

- [ ] Home universe fits the viewport; nothing overflows horizontally.
- [ ] **Vertical page scroll still works** (the graph does not trap touch scroll);
      you can scroll to the footer.
- [ ] **Tap a node** to focus/zoom into it.
- [ ] The metadata panel renders as a **bottom sheet** and is readable.
- [ ] Child **"Enter" chips** in the panel let you drill without precise taps.
- [ ] Breadcrumb, Zoom out, and Reset are tappable (adequate hit targets).
- [ ] Header **mobile menu** opens/closes and links work.
- [ ] Labels are legible; nodes are not overlapping into an unreadable mess.
- [ ] Each routed page (`/about`, `/projects`, etc.) is usable and not clipped.

## 3. Graph interaction (deep checks)

- [ ] Levels drill correctly: **You → Domains → Systems → Artifacts**.
- [ ] At root, only domains are labeled; systems/artifacts are dim dots
      (no label clutter).
- [ ] After drilling, labels appear for the focus, its children, and its ancestors.
- [ ] No nodes are stuck at the origin / top-left (layout + projection correct).
- [ ] Faint **relation edges** connect related systems across domains (e.g. items
      sharing "Salesforce", "AI", "automation").
- [ ] **Data traces** flow only along parent→child edges (not relation edges) and
      intensify on hover; concentric rings + core glow stay centered on identity.
- [ ] Camera transitions are smooth (no jitter); zoom clamps (can't zoom to
      infinity or lose the graph off-screen).
- [ ] Resizing the window keeps the **current** focus framed (not snapped back to
      root) and keeps aspect correct.
- [ ] Deep links resolve: every node that should open a page does so; external
      nodes (project demo/GitHub) open in a new tab.

## 4. Content editing

All content lives in `src/data/*.ts`; the universe **auto-generates** from it.
See `docs/content-management.md` for the full guide.

- [ ] Editing a case study / project / product / article updates both its page
      **and** its node in the universe (deep link, tone, status, metric).
- [ ] `visible: false` removes the item from its page **and** the universe.
- [ ] `featured: true` emphasizes the node (brighter/larger).
- [ ] Adding a new case study auto-creates `/case-studies/<slug>` and a node.
- [ ] To add/rename a **domain** or change its color/order, edit the `domains`
      array in `src/lib/graph/model.ts`.
- [ ] To change which themes create relation edges, edit `SIGNALS` in
      `src/lib/graph/model.ts`.
- [ ] Content stays **anonymized** (no client/employer/matter names, no internal
      URLs or schemas).
- [ ] Before committing, all three pass:
      ```powershell
      npm run typecheck
      npm run lint
      npm run build
      ```

---

## 5. Known limitations

- **Desktop scroll is intentionally captured** over the hero (scroll = zoom,
  map-style). The global footer is reachable by dragging the scrollbar; the
  sticky header keeps nav + Contact always available.
- **Articles deep-link to `/writing`** — there is no per-article `[slug]` page yet.
- **No backend / CMS / auth** — content is file-based by design (Supabase
  intentionally deferred; the content layer is abstracted so a DB can slot in
  later without a rewrite).
- **Contact form** is front-end only (no submission backend wired up).
- **Graph is client-rendered**; SEO/no-JS/screen-reader access is provided by the
  server-rendered `sr-only` outline beneath the canvas (every node is a real,
  crawlable link). Verify the outline stays in sync if the model changes.
- **Relation edges are keyword-derived** from `SIGNALS`, so they may occasionally
  over- or under-connect; tune the signal list if needed.
- **Placeholders remain** in `src/lib/site.ts` (domain, email, social handles).
- **No analytics, sitemap, or OG/social images** configured yet.
- **No automated tests** yet (graph interactions are manually verified).

## 6. Next recommended build phases

Suggested order; each phase is independent enough to ship on its own.

1. **Content + identity polish** — replace placeholders in `src/lib/site.ts`
   (domain, email, socials), finalize copy, confirm anonymization.
2. **Article detail pages** — add `app/writing/[slug]/page.tsx` and point article
   nodes/links at real URLs (mirrors the case-study `[slug]` pattern).
3. **SEO + sharing** — `sitemap.ts`, `robots.ts`, per-route metadata, and dynamic
   OG images; verify the home `<h1>`/outline.
4. **Analytics + performance QA** — add privacy-friendly analytics; Lighthouse
   pass; lazy/defer non-critical work; confirm graph FPS on mid-range devices.
5. **Contact backend** — wire `ContactForm` to an email/service endpoint with
   spam protection and success/error states.
6. **Content backend (Supabase)** — introduce the DB + admin behind the existing
   content abstraction; keep the file-based fallback during migration.
7. **Automated tests** — Playwright smoke tests for routes + core graph
   interactions (drill in, zoom out, breadcrumb, deep link), and a unit test for
   `buildGraphModel()`.
