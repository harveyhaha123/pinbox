import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className,
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-transform duration-150 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "active:enabled:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        variant === "primary" && "bg-ink text-paper hover:bg-ink/90",
        variant === "secondary" && "border border-line bg-paper-2 text-ink hover:bg-paper",
        variant === "ghost" && "text-muted hover:bg-paper-2 hover:text-ink",
        variant === "danger" && "border border-line text-terracotta hover:bg-terracotta/10",
        className,
      )}
      {...props}
    />
  );
}
