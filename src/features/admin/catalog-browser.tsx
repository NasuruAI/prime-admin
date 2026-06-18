"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { AdminProduct } from "@/types/catalog";

type View = "grid" | "list";
const STORAGE_KEY = "admin_catalog_view";

export function CatalogBrowser({ products }: { products: AdminProduct[] }) {
  const [view, setView] = useState<View>("grid");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as View | null;
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);

  function choose(v: View) {
    setView(v);
    window.localStorage.setItem(STORAGE_KEY, v);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="inline-flex border border-ink/15 bg-white">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-label={`${v} view`}
              aria-pressed={view === v}
              onClick={() => choose(v)}
              className={`inline-flex h-9 w-10 items-center justify-center transition ${
                view === v
                  ? "bg-primary text-white"
                  : "text-ink/60 hover:bg-ink/5"
              }`}
            >
              {v === "grid" ? <GridIcon /> : <ListIcon />}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No products yet. Create your first one.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/catalog/${p.id}`}
              className="group flex flex-col border border-ink/10 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
            >
              <div className="relative aspect-square overflow-hidden bg-surface">
                {p.primary_image ? (
                  <Image
                    src={p.primary_image}
                    alt={p.title}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-ink/30">
                    No image
                  </span>
                )}
                {!p.is_active && (
                  <span className="absolute left-2 top-2">
                    <Badge tone="danger">inactive</Badge>
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <span className="truncate text-sm font-medium text-ink group-hover:text-primary">
                  {p.title}
                </span>
                <span className="text-xs text-ink/50">
                  {p.variant_count} variant{p.variant_count === 1 ? "" : "s"}
                  {p.price_from ? ` · from ${p.price_from}` : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer transition hover:bg-ink/[0.015]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/catalog/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden border border-ink/10 bg-surface">
                        {p.primary_image ? (
                          <Image
                            src={p.primary_image}
                            alt={p.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">
                          {p.title}
                        </span>
                        <span className="font-mono text-xs text-ink/45">
                          /p/{p.short_id}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.variant_count}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {p.price_from ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone={p.is_active ? "success" : "danger"}>
                      {p.is_active ? "active" : "inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
