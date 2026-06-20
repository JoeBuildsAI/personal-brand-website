import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: ElementType;
  interactive?: boolean;
  glow?: boolean;
};

export function Card({
  as: Comp = "div",
  interactive = false,
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Comp
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hairline bg-panel shadow-card",
        interactive &&
          "transition-all duration-300 ease-spring hover:-translate-y-1 hover:border-hairline-strong hover:shadow-card-hover",
        className,
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}
      {children}
    </Comp>
  );
}
