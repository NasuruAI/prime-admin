"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/features/auth/logout-button";

type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/catalog", label: "Catalog", icon: "box" },
  { href: "/orders", label: "Orders", icon: "bag" },
  { href: "/payments", label: "Payments", icon: "card" },
  { href: "/currencies", label: "Currencies", icon: "coin" },
  { href: "/coupons", label: "Coupons", icon: "tag" },
  { href: "/suppliers", label: "Suppliers", icon: "truck" },
  { href: "/users", label: "Users", icon: "users" },
  { href: "/storefront", label: "Storefront", icon: "layout" },
  { href: "/settings", label: "Settings", icon: "gear" },
  { href: "/audit", label: "Audit log", icon: "list" },
];

export function AdminShell({
  email,
  storeName,
  children,
}: {
  email: string;
  storeName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const initials = brandInitials(storeName);

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-blush">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <span className="flex h-8 w-8 items-center justify-center bg-accent font-display text-sm font-bold text-white">
          {initials}
        </span>
        <div className="leading-tight">
          <div className="font-display text-base font-bold">{storeName}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-blush/50">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const on = active(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={on ? "page" : undefined}
              className={`mb-0.5 flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition ${
                on
                  ? "border-accent bg-white/10 font-medium text-white"
                  : "border-transparent text-blush/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="shrink-0 text-current opacity-90">
                {ICONS[item.icon]}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-blush/60">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="mb-3 inline-flex items-center gap-1.5 text-blush/70 transition hover:text-white"
        >
          {ICONS.external} View store
        </a>
        <div className="truncate" title={email}>
          {email}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Fixed sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-ink/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink/10 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center text-ink transition hover:bg-ink/5 lg:hidden"
          >
            {ICONS.menu}
          </button>
          <div className="font-display text-lg font-bold text-ink lg:hidden">
            {storeName}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-ink/55 sm:block">{email}</span>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

const ICONS = {
  grid: svg(
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>,
  ),
  box: svg(
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>,
  ),
  bag: svg(
    <>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </>,
  ),
  coin: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h3.2a1.8 1.8 0 0 1 0 3.6H9.5h3.5a1.8 1.8 0 0 1 0 3.6H9.5" />
    </>,
  ),
  card: svg(
    <>
      <rect x="2.5" y="5" width="19" height="14" />
      <path d="M2.5 9.5h19M6 15h4" />
    </>,
  ),
  tag: svg(
    <>
      <path d="M3 12V4h8l10 10-8 8L3 12Z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>,
  ),
  truck: svg(
    <>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>,
  ),
  users: svg(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5M21 20a5 5 0 0 0-4-4.9" />
    </>,
  ),
  gear: svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>,
  ),
  list: svg(
    <>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </>,
  ),
  layout: svg(
    <>
      <rect x="3" y="3" width="18" height="18" />
      <path d="M3 9h18M9 21V9" />
    </>,
  ),
  external: svg(
    <>
      <path d="M14 4h6v6M20 4l-9 9M19 13v6H5V5h6" />
    </>,
    14,
  ),
  menu: svg(
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>,
    22,
  ),
};

/** Up to two letters for the brand badge, derived from the store name. */
function brandInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ST";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function svg(children: React.ReactNode, size = 18) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
