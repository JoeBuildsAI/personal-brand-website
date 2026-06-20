# Content Management Guide

All content on this site lives in **typed data files** under `src/data/` and a
single site-config file at `src/lib/site.ts`. There is **no CMS and no database** —
you edit a file, save, and the site updates. This keeps the site fast, versioned
in Git, and impossible to break from a web form.

Every data file has a comment block at the top showing the safe editing pattern
for that content type. This guide is the full reference.

> **Golden rules**
> 1. Keep everything **anonymized** — never add a client/employer name, matter
>    detail, or proprietary configuration. Describe context generically
>    (e.g. "a legal operations team").
> 2. Don't delete — **hide**. Most types support `visible: false`.
> 3. Run `npm run typecheck` and `npm run lint` before committing (see bottom).

---

## Where each thing lives

| Content | File |
| --- | --- |
| Case studies | `src/data/caseStudies.ts` |
| Projects (constellation) | `src/data/projects.ts` |
| Services | `src/data/services.ts` |
| Products (roadmap) | `src/data/products.ts` |
| Writing / articles | `src/data/writing.ts` |
| Operating model (Services process graph) | `src/data/operatingModel.ts` |
| Career journey (About) | `src/data/journey.ts` |
| Homepage graph universe | **auto-generated** from the files above (see below) |
| Name, email, social links, nav | `src/lib/site.ts` |

The common optional fields used to control the UI without deleting data:

- `visible?: boolean` — set to `false` to hide an item everywhere. Defaults to visible.
- `featured?: boolean` — emphasize / select first (used by home, projects, products, graph).
- `sortOrder?: number` — lower numbers appear first.

---

## Case studies

File: `src/data/caseStudies.ts`. Each study is read on two levels — an
**Executive Summary** (decision-makers) and a **Technical Walkthrough** (engineers).

### Add a case study
Copy an existing object in the `caseStudies` array and update every field:

```ts
{
  slug: "unique-url-slug",            // becomes /case-studies/unique-url-slug
  title: "Readable Title",
  eyebrow: "Category label",
  summary: "One-sentence overview.",

  // Executive summary
  problem: "What was broken, in plain language.",
  businessImpact: "The decision-maker outcome — time/cost/clarity.",
  outcome: "What changed once it shipped.",
  metrics: [{ label: "Manual reporting time", value: "-85%" }],

  // Technical walkthrough
  approach: "How it was designed and built.",
  constraints: ["Real-world constraint", "Another constraint"],
  architecture: ["Step 1", "Step 2", "Step 3"],
  architectureMap: [
    { stage: "Sources", label: "Source systems", nodes: ["A", "B"] },
    { stage: "Logic",   label: "Processing",     nodes: ["Transform"] },
    { stage: "Review",  label: "Human checkpoint", nodes: ["Validation"] },
    { stage: "Output",  label: "Reporting",      nodes: ["Dashboards"] },
  ],
  tradeoffs: ["A deliberate tradeoff"],
  governance: ["A governance rule"],
  failureModes: ["A failure mode this design prevents"],
  lessons: ["A lesson learned"],

  // Meta
  tools: ["Salesforce", "TypeScript"],
  status: "In Production",            // Live | In Production | Ongoing | Prototype | Archived
  featured: true,                      // shows in home "Selected Work"
  confidentialityNote: "Anonymized. No client-identifying details.",
}
```

- `architectureMap` drives the **mini architecture diagram** (Sources → Logic →
  Review → Output) shown on the index and detail pages. Always keep four stages
  in that order; each `nodes` array can hold 1–3 short labels.

### Edit a case study
Find it by `slug` and change any field. Saving updates the index, the detail
page, and the home graph (if it's linked there).

### Delete / hide a case study
- **Hide:** add `visible: false` to the object. It disappears from the case
  studies page **and** the homepage graph universe automatically.
- **Feature it:** set `featured: true` (emphasised in the universe).
- **Delete permanently:** remove the whole object. The universe updates itself.

---

## Projects

File: `src/data/projects.ts`. Projects render as an interactive **constellation**
grouped by `category`.

```ts
{
  title: "Project Name",
  slug: "unique-slug",
  category: "Automation & AI",  // "Platforms & Products" | "Automation & AI" | "Platform Architecture"
  summary: "One line.",
  description: "Longer overview shown in the detail panel.",
  type: "AI Workflow",
  status: "In Development",      // Live | In Development | Prototype | Maintained | Planned
  stack: ["TypeScript", "LLM APIs"],
  githubUrl: "https://github.com/you/repo",
  demoUrl: "https://example.com",   // or a related /case-studies/... URL
  highlights: ["Highlight one", "Highlight two"],
  architecture: ["Architecture note one", "note two"],
  featured: true,               // selected first when the page loads
}
```

- `category` decides which cluster the node orbits. New categories require adding
  the value to `ProjectCategory` and `projectCategories`, plus a cluster anchor
  in `src/components/sections/ProjectExplorer.tsx` (`clusterAnchors`).
- Hide with `visible: false`; order with `sortOrder`.

---

## Services

File: `src/data/services.ts`. Shown as the "Areas of Expertise" grid.

```ts
{
  slug: "unique-slug",
  title: "Service Name",
  summary: "What it is.",
  whatItIncludes: ["Deliverable", "Deliverable"],
  bestFor: ["Who it's for"],
  outcomes: ["What they get"],
  pricingNote: "Scoped by project",
}
```

The five-stage **process graph** (Discover → Architect → Build → Measure → Scale)
is driven separately by `src/data/operatingModel.ts`.

---

## Products

File: `src/data/products.ts`. Shown on the **roadmap**, placed by `stage`.

```ts
{
  name: "Product Name",
  slug: "unique-slug",
  summary: "One line.",
  stage: "Prototype",   // Concept | Prototype | Building | Private Beta | Planned
  audience: "Who it's for.",
  problemSolved: "The problem.",
  features: ["Feature", "Feature"],
  futureVision: "Where it's going.",
  featured: true,
}
```

`stage` maps to a roadmap phase (Idea / Prototype / Validation / Production) via
`phaseByStage` in `src/app/products/page.tsx`. Change the `stage` and the product
moves along the roadmap automatically. Hide with `visible: false`.

---

## Writing

File: `src/data/writing.ts`. The first article in the array is the **featured**
article; the rest fill the filterable topic clusters.

```ts
{
  title: "Article Title",
  slug: "unique-slug",
  excerpt: "Short summary.",
  category: "Systems Thinking",  // also the topic cluster + thumbnail tone
  status: "Coming Soon",          // Coming Soon | Draft | Published
  readTime: "6 min read",
  date: null,                     // or "2026-01-31"
}
```

To add a new topic cluster colour, add the category to the `categoryThemes` and
`categoryDot` maps in `src/components/sections/WritingExplorer.tsx`.

---

## Social, email, and identity links

File: `src/lib/site.ts`.

```ts
export const siteConfig = {
  name: "Joe Wilkinson",
  email: "hello@joewilkinson.dev",
  social: {
    github: "https://github.com/joewilkinson",
    linkedin: "https://www.linkedin.com/in/joewilkinson",
    instagram: "https://www.instagram.com/joewilkinson",
  },
};
```

- Update GitHub / LinkedIn / Instagram / email here — the footer, contact page,
  and header all read from this one place.
- **To hide a social link** (e.g. Instagram isn't live yet): set it to an empty
  string `""`. It disappears from the footer and contact page automatically.

---

## Homepage featured items

The homepage is the graph universe (see below), so "featured" now controls
emphasis **inside the universe** rather than separate stacked home sections:

- **`featured: true`** on a case study, project, or product brightens and
  enlarges its node.
- The center identity uses your **name + tagline** from `src/lib/site.ts`.

---

## The homepage graph universe (auto-generated)

The homepage is a full-screen interactive **graph universe**, and it is
**generated entirely from the content files above** — there is no hand-placed
graph data to maintain. Add or edit a case study, project, product, article,
service, or journey stage, and the universe regenerates automatically.

**Engine + model** live in `src/lib/graph/`:
- `types.ts` — the node / edge schema.
- `model.ts` — `buildGraphModel()` derives every node + connection from content.
- `layout.ts` — deterministic radial positions (no editing needed).
- `src/components/graph/GraphUniverse.tsx` — the zoomable renderer.

### How content maps to the universe
- **L1 · You** — the center (name + tagline from `src/lib/site.ts`).
- **L2 · Domains** — About, Case Studies, Services, Projects, Products, Writing,
  defined in the `domains` array in `model.ts`.
- **L3 · Systems** — generated: each case study, service, product, project
  category, writing topic, and journey milestone becomes a system node.
- **L4 · Artifacts** — generated: each project and article becomes an artifact
  node under its category / topic.

Each node automatically gets its **deep link** (a case study links to
`/case-studies/<slug>`, etc.), its **tone/colour**, **status**, and a **metric**
where one exists. `visible: false` removes a node; `featured: true` emphasises it.

### Cross-domain connections (the "neural pathways")
Faint relation edges are derived automatically from shared themes (Salesforce,
AI, automation, reporting, legal, data). You never draw these — they appear when
two systems in different domains share a signal in their text.

### To change the universe itself
- **Add / remove content** → edit the content files above (most common).
- **Add or rename a domain, or change its colour/order** → edit the `domains`
  array in `src/lib/graph/model.ts`.
- **Change which themes create relation edges** → edit the `SIGNALS` list in
  `model.ts`.
- **Adjust spacing / zoom feel** → the constants at the top of `layout.ts`.

---

## Keeping content anonymized

- No client, employer, firm, or matter names.
- No proprietary configuration, schemas, or internal URLs.
- Use generic descriptors: "a plaintiff-side law firm", "a legal operations team".
- Metrics should be illustrative and rounded, never tied to identifiable data.

---

## Before you commit

Run these from the project root (PowerShell):

```powershell
npm run typecheck   # catches type errors in data files
npm run lint        # catches code/style issues
npm run build       # full production build (optional but recommended)
```

If all three pass, commit and push. The site is static-first, so a passing build
means it will deploy cleanly.
