import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center px-4 text-sm font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-white hover:bg-primary-600",
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
