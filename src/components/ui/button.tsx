import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "lg" && "h-10 px-5 text-sm",
        variant === "primary" && "bg-primary text-white hover:bg-primary-600",
        variant === "secondary" && "bg-ink text-white hover:bg-ink-800",
        variant === "subtle" && "bg-primary/10 text-primary hover:bg-primary/15",
        variant === "ghost" &&
          "border border-ink/15 bg-white text-ink hover:border-primary hover:text-primary",
        variant === "danger" && "bg-accent text-white hover:bg-accent-hover",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
