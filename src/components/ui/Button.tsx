import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const baseStyles =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_12px_34px_-12px_rgba(104,120,242,0.75)] hover:-translate-y-0.5 hover:bg-brand-400",
  secondary:
    "border border-hairline-strong bg-white/[0.05] text-ink hover:border-white/20 hover:bg-white/[0.09]",
  outline:
    "border border-hairline-strong text-ink hover:border-white/25 hover:bg-white/[0.04]",
  ghost: "text-ink-muted hover:bg-white/[0.05] hover:text-ink",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

  if (typeof props.href === "string") {
    const { href, ...anchorProps } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    const isExternal = /^https?:\/\//.test(href ?? "");

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...anchorProps}
        />
      );
    }

    return <Link href={href ?? "#"} className={classes} {...anchorProps} />;
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />
  );
}
