/**
 * Central site configuration.
 *
 * Update placeholder URLs and the contact email here when real handles
 * and domains are ready. Everything in the UI reads from this file.
 */
export const siteConfig = {
  name: "Joe Wilkinson",
  initials: "JW",
  role: "Systems Architect & Legal Technology Operator",
  tagline:
    "I build operational systems that turn messy business processes into scalable infrastructure.",
  description:
    "Joe Wilkinson designs and builds automation, legal technology, AI-assisted workflows, reporting systems, and operational infrastructure for modern teams.",
  // Placeholder — replace with the production domain when live.
  url: "https://joewilkinson.dev",
  // Placeholder — replace with a real inbox before launch.
  email: "hello@joewilkinson.dev",
  // Social handles. Replace the placeholder URLs with real profiles before
  // launch. Set a value to an empty string to hide that link everywhere.
  social: {
    github: "https://github.com/joewilkinson",
    linkedin: "https://www.linkedin.com/in/joewilkinson",
    instagram: "https://www.instagram.com/joewilkinson",
  },
} as const;

export type NavLink = {
  label: string;
  href: string;
};

/** Primary navigation shown in the header and footer. */
export const navLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Writing", href: "/writing" },
  { label: "Contact", href: "/contact" },
];

/** Positioning labels used in the hero / trust strip. */
export const positioning: string[] = [
  "Systems Architect",
  "Legal Technology Architect",
  "Automation Strategist",
  "AI Builder",
  "Business Operations Technologist",
  "Future Product Founder",
];
