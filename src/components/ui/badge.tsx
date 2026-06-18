import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-ink/70",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-accent/10 text-accent",
  info: "bg-primary/10 text-primary",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Map an order/fulfilment status to a badge tone. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "completed":
    case "fulfilled":
    case "paid":
      return "success";
    case "pending":
    case "routing":
    case "partially_fulfilled":
      return "warning";
    case "cancelled":
    case "refunded":
      return "danger";
    default:
      return "neutral";
  }
}
