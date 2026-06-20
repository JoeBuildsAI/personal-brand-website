# Joe Wilkinson

Personal website and digital headquarters — a premium, dark, systems-inspired platform for case studies, projects, services, products, and writing.

> I build operational systems that turn messy business processes into scalable infrastructure.

## Contains

- Case Studies
- Products
- Consulting Services
- Technical Content
- GitHub Portfolio
- Future Ventures

Built with modern web technologies and designed as a long-term personal brand platform.

## Tech Stack

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Geist** font (local, no network fetch at build)
- Static-first architecture — content lives in typed data files (no CMS, no database yet)

## Getting Started

**Prerequisites:** Node.js `18.18+` (developed on Node `24`).

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run build    # create a production build
npm run start    # serve the production build
npm run lint     # run ESLint (next/core-web-vitals)
npm run typecheck # run the TypeScript compiler with no emit
```

> **Windows / PowerShell note:** if `npm` is blocked by the execution policy
> (`npm.ps1 cannot be loaded ...`), invoke `npm.cmd <script>` instead, or run
> the commands from `cmd.exe`.

## Available Scripts

| Script | Description |
| --- | --- |
| `dev` | Start the local development server |
| `build` | Build the production bundle |
| `start` | Serve the production build |
| `lint` | Lint the codebase with ESLint |
| `typecheck` | Type-check with `tsc --noEmit` |

## Project Structure

```text
src/
  app/                # App Router pages + root layout + global styles
    case-studies/
      [slug]/         # Dynamic case study pages (executive + technical levels)
  components/
    cards/            # Reusable content cards
    graph/            # GraphUniverse (homepage) + ArchitectureMap (case studies)
    layout/           # Header, Footer, PageShell
    sections/         # ProjectExplorer, ProcessFlow, WritingExplorer, ...
    ui/               # Button, Card, Badge, Container, Reveal, icons
  data/               # Typed content (case studies, projects, products, ...)
  lib/                # site config + utilities
    graph/            # Unified node+edge schema — the universe self-generates here
docs/                 # content-management.md, future-admin-backend.md
```

### The graph universe (homepage)

The entire homepage is a full-screen, multi-level **graph universe** — the
site's crown jewel and primary navigation. Clicking a node animates a camera
(an SVG `viewBox` lerp) to zoom *through* the graph and reveal deeper layers:

```
L1 You  →  L2 Domains  →  L3 Systems  →  L4 Artifacts
```

It supports drag-to-pan, scroll-to-zoom, hover illumination, connection tracing,
breadcrumb navigation, full keyboard control (Tab / Enter / Escape), reduced
motion, and a mobile tap-to-explore mode.

**It is generated entirely from content** — there is no hand-placed graph data.
The unified node + edge schema lives in `src/lib/graph/` (`types.ts`,
`model.ts`, `layout.ts`); `buildGraphModel()` derives every node and connection
from the content files, and `src/components/graph/GraphUniverse.tsx` renders it.
A server-rendered, screen-reader/SEO text outline of the whole graph sits beneath
it so every node is a real, crawlable link. The same graph language also appears
per page: a project constellation, case-study architecture maps, a services
process flow, a products roadmap, and an About trajectory.

## Editing Content

All content lives in typed TypeScript files under `src/data/`:

- `caseStudies.ts` — case studies (detail pages are generated automatically from each `slug`)
- `projects.ts` — projects
- `services.ts` — services
- `products.ts` — products / future ventures
- `writing.ts` — articles / insights

The **homepage graph universe is auto-generated** from these files (via
`src/lib/graph/model.ts`) — edit the content and the universe regenerates; there
is no separate graph data to maintain. Edit the exported arrays to add or update entries. Most types support optional
`visible`, `featured`, and `sortOrder` fields so you can control what appears
without deleting data. Site-wide settings — name, contact email, social links
(GitHub / LinkedIn / Instagram), and navigation — live in `src/lib/site.ts`.

**Full guide:** see [`docs/content-management.md`](docs/content-management.md)
for step-by-step instructions on every content type, and
[`docs/future-admin-backend.md`](docs/future-admin-backend.md) for how a CMS or
admin backend could be added later. Keep all content **anonymized** — no client
or employer-identifying details.

## Design System

- A dark, luxurious palette: deep black/charcoal surfaces with three accent
  hues — **brand** (electric blue), **accent** (cyan), **soft violet**, and a
  rare **warm** highlight — defined in `tailwind.config.ts`
- Glass, gradient-depth, glow, and motion utilities in `src/app/globals.css`
- UI primitives in `src/components/ui/`; the graph engine in
  `src/components/graph/`

## Deployment

_Placeholder._ The project is a standard Next.js app and is ready to deploy to a
host such as Vercel. `npm run build` produces the production build.

## Status

Luxury redesign pass — an immersive interactive systems graph, a consistent
graph visual language across every page, and two-level case studies (executive
+ technical). No CMS, database, or authentication yet — content is file-based
(see `docs/`) and the contact form is front-end only (backend submission to be
connected later).
