import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "muted";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "border-hairline-strong bg-white/[0.04] text-ink-muted",
  brand: "border-brand-500/30 bg-brand-500/10 text-brand-200",
  accent: "border-accent/30 bg-accent/10 text-accent-soft",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  muted: "border-hairline bg-transparent text-ink-subtle",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  dot?: boolean;
};

export function Badge({ tone = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium uppercase tracking-wider",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Tag({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-hairline bg-white/[0.03] px-2 py-1 font-mono text-[0.7rem] text-ink-muted",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
