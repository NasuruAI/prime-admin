"use client";

import { useEffect } from "react";

/** Minimal accessible modal: backdrop + panel, closes on Esc / backdrop click. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md animate-[toast-in_180ms_ease-out] rounded-2xl border border-ink/10 bg-white p-6 shadow-card-hover"
      >
        {title && (
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-ink/60">{description}</p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
