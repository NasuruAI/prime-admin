"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  error: 6000,
};

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = ++counter;
      setToasts((cur) => [...cur, { id, type, message }]);
      window.setTimeout(() => dismiss(id), DURATION[type]);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    show,
    success: (m) => show("success", m),
    error: (m) => show("error", m),
    info: (m) => show("info", m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-0 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:right-4 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ACCENT: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-accent",
  info: "bg-primary",
};

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className="pointer-events-auto flex items-stretch border border-ink/10 bg-white shadow-card animate-[toast-in_180ms_ease-out]"
    >
      <span className={`w-1 shrink-0 ${ACCENT[toast.type]}`} aria-hidden />
      <div className="flex flex-1 items-start gap-3 p-3.5">
        <span className="mt-0.5 shrink-0 text-ink/80" aria-hidden>
          {toast.type === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : toast.type === "error" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v5M12 16.5h.01"
                stroke="#C9184A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="9" stroke="#C9184A" strokeWidth="1.6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 11v5M12 8h.01"
                stroke="#6E0D25"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="9" stroke="#6E0D25" strokeWidth="1.6" />
            </svg>
          )}
        </span>
        <p className="flex-1 text-sm text-ink">{toast.message}</p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="-mr-1 -mt-1 shrink-0 p-1 text-ink/30 transition hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
