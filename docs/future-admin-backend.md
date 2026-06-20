# Future Admin Backend — Architecture Note

This is a **forward-looking design note**, not an implementation. There is
intentionally **no database, no authentication, and no CMS** today. This document
explains how an admin backend *could* be added later, and why it should not be
rushed now.

---

## Where we are today

- Content lives in typed files under `src/data/` (see `content-management.md`).
- The site is **static-first** (Next.js App Router, mostly static + SSG routes).
- Editing = change a file → commit → deploy. Git is the audit trail.
- This is fast, secure (no attack surface), free to host, and version-controlled.

The content layer is deliberately structured so a backend can be layered on later
**without rewriting the UI**: every page reads through typed accessors
(`getVisibleProjects()`, `getCaseStudy()`, `getVisibleProducts()`, etc.). Swapping
the data source means changing those accessors, not the components.

---

## When a backend becomes worth it

Add one only when at least one of these is true:

- Content changes frequently and editing files becomes a chore.
- A non-technical editor needs to publish without touching code.
- You need drafts, scheduling, or non-developer image uploads.
- Multiple people edit and you need roles + an audit trail beyond Git.

Until then, the file-based system is the right tool.

---

## Options (in rough order of effort)

| Option | What it is | Good fit when | Tradeoffs |
| --- | --- | --- | --- |
| **Keep files + Git** | Today's setup | Solo, infrequent edits | Requires Git/editor comfort |
| **Sanity** | Hosted headless CMS | Want a polished editor fast | External service, learning curve |
| **Payload** | Self-hostable CMS (TS-native) | Want to own data + admin UI | You host + maintain it |
| **Supabase** | Postgres + auth + storage | Want a DB and APIs, not just content | More moving parts |
| **Custom admin** | Bespoke `/admin` routes | Very specific workflow | Most build + security work |

**Recommended path if/when needed:** start with **Sanity** (fastest editor, image
pipeline, draft/publish built in) *or* **Payload** if owning the data end-to-end
matters more than setup speed. Reach for **Supabase** only if the site grows
relational, app-like features (accounts, dashboards) beyond content.

---

## What a backend would need to get right

### Authentication (required before any editing)
- No write path may be public. Gate all editing behind auth (OAuth / email magic
  link via the chosen platform, or a provider like Clerk/Auth.js for custom).
- Public site stays read-only and statically rendered.

### Image / asset upload
- Use the platform's asset pipeline (Sanity assets, Supabase Storage, or an
  external store like Cloudinary/S3) with automatic resizing + CDN delivery.
- Never commit large binaries into the repo; store URLs/refs in content.

### Draft / publish model
- Content gets a `status` (draft → published) and optional `publishAt`.
- The public site renders **published** only; a preview mode renders drafts for
  authenticated editors. (The existing `visible`/`status` fields anticipate this.)

### Audit trail
- Record who changed what and when. Git already does this for files; a DB/CMS
  needs explicit revision history (Sanity/Payload provide this; Supabase needs a
  history table or triggers).

### Migration strategy
- Keep the typed interfaces (`CaseStudy`, `Project`, `Product`, `Article`,
  `GraphNode`) as the contract. Write a one-time importer from the current data
  files into the chosen store, then point the accessors at the new source.
- Consider Incremental Static Regeneration or on-publish rebuilds so the site
  stays static-fast even with a backend.

---

## Why this should not be rushed

- **Security:** any write path + auth is real attack surface. Done poorly it's a
  liability; the current static site has none.
- **Cost & maintenance:** a database/CMS is something to host, patch, back up,
  and monitor — ongoing overhead for content that changes rarely.
- **Speed:** static files are the fastest possible delivery; a premature backend
  usually makes the site slower, not better.
- **Lock-in:** choosing a platform too early risks migrating twice. The typed
  content layer lets us defer the decision with zero downside.

**Decision:** revisit this when editing friction is real. Until then, the
file-based content layer in `content-management.md` is the system.
