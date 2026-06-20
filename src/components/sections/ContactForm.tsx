"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const interests = [
  "Systems Architecture",
  "Legal Technology",
  "Automation & Reporting",
  "Salesforce / Litify",
  "AI Workflows",
  "Product Prototyping",
  "Something else",
];

const fieldClass =
  "w-full rounded-xl border border-hairline bg-canvas-raised/60 px-4 py-3 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const labelClass =
  "mb-2 block text-2xs font-medium uppercase tracking-[0.16em] text-ink-subtle";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-panel p-10 text-center shadow-card">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-accent/30 bg-accent/10 text-2xl text-accent">
          <Check />
        </span>
        <h3 className="text-xl font-semibold text-ink">Message captured</h3>
        <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
          This is a front-end preview, so nothing was actually sent. Backend
          submission will be connected later. For now, please email me directly.
        </p>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="interest" className={labelClass}>
          Area of interest
        </label>
        <select
          id="interest"
          name="interest"
          defaultValue={interests[0]}
          className={fieldClass}
        >
          {interests.map((interest) => (
            <option key={interest} value={interest} className="bg-panel text-ink">
              {interest}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="What are you trying to build or fix?"
          className={cn(fieldClass, "resize-none")}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-ink-subtle">
          This form is a UI preview. Backend submission will be connected later.
        </p>
        <Button type="submit" size="lg" className="shrink-0">
          Send message
          <ArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </form>
  );
}
