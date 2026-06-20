import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  as?: ElementType;
  size?: "default" | "narrow";
};

export function Container({
  as: Comp = "div",
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full container-px",
        size === "narrow" ? "max-w-prose" : "max-w-container",
        className,
      )}
      {...props}
    />
  );
}
