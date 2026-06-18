"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";
import type { AdminOptionType } from "@/types/catalog";

/**
 * Manage a product's option types (e.g. Size, Color) and their values during
 * edit. Adding an option turns a simple product into a variable one, which
 * unlocks manual variant creation in the VariantManager below.
 */
export function OptionsManager({
  productId,
  optionTypes,
}: {
  productId: string;
  optionTypes: AdminOptionType[];
}) {
  const router = useRouter();
  const [newType, setNewType] = useState("");
  const [valueDrafts, setValueDrafts] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fail(e: unknown, fallback: string) {
    setError(e instanceof Error ? e.message : fallback);
  }

  async function addType() {
    if (!newType.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await adminCall("/catalog/option-types/", {
        method: "POST",
        body: JSON.stringify({
          product: productId,
          name: newType.trim(),
          position: optionTypes.length,
        }),
      });
      setNewType("");
      router.refresh();
    } catch (e) {
      fail(e, "Could not add option.");
    } finally {
      setBusy(false);
    }
  }

  async function addValue(typeId: number) {
    const v = (valueDrafts[typeId] ?? "").trim();
    if (!v) return;
    setBusy(true);
    setError(null);
    try {
      const ot = optionTypes.find((o) => o.id === typeId);
      await adminCall("/catalog/option-values/", {
        method: "POST",
        body: JSON.stringify({
          option_type: typeId,
          value: v,
          position: ot ? ot.values.length : 0,
        }),
      });
      setValueDrafts((d) => ({ ...d, [typeId]: "" }));
      router.refresh();
    } catch (e) {
      fail(e, "Could not add value.");
    } finally {
      setBusy(false);
    }
  }

  async function delType(id: number) {
    if (
      !window.confirm(
        "Delete this option and all its values? Variants using it may be affected.",
      )
    )
      return;
    setError(null);
    try {
      await adminCall(`/catalog/option-types/${id}/`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      fail(e, "Could not delete option.");
    }
  }

  async function delValue(id: number) {
    setError(null);
    try {
      await adminCall(`/catalog/option-values/${id}/`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      fail(e, "Could not delete value.");
    }
  }

  return (
    <section className="admin-card p-6">
      <h2 className="mb-1 font-display text-base font-bold text-ink">
        Options ({optionTypes.length})
      </h2>
      <p className="mb-4 text-xs text-ink/50">
        Add options like <em>Size</em> or <em>Color</em> and their values. Each
        combination can then become a variant below.
      </p>

      {error && (
        <div className="mb-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {optionTypes.map((ot) => (
          <div key={ot.id} className="border border-ink/10 bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{ot.name}</span>
              <button
                type="button"
                onClick={() => delType(ot.id)}
                className="text-xs font-medium text-ink/40 hover:text-accent"
              >
                Remove option
              </button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {ot.values.length === 0 && (
                <span className="text-xs text-ink/40">No values yet.</span>
              )}
              {ot.values.map((val) => (
                <span
                  key={val.id}
                  className="group inline-flex items-center gap-1.5 border border-ink/15 bg-white px-2.5 py-1 text-xs text-ink"
                >
                  {val.value}
                  <button
                    type="button"
                    aria-label={`Remove ${val.value}`}
                    onClick={() => delValue(val.id)}
                    className="text-ink/30 hover:text-accent"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={valueDrafts[ot.id] ?? ""}
                onChange={(e) =>
                  setValueDrafts((d) => ({ ...d, [ot.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && addValue(ot.id)}
                placeholder="Add a value (e.g. Small)"
                className="h-9 max-w-[14rem]"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => addValue(ot.id)}
                disabled={busy}
              >
                Add value
              </Button>
            </div>
          </div>
        ))}

        {/* Add a new option type */}
        <div className="flex gap-2 border-t border-ink/10 pt-4">
          <Input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addType()}
            placeholder="New option name (e.g. Size)"
            className="max-w-[16rem]"
          />
          <Button type="button" onClick={addType} disabled={busy}>
            {busy ? "…" : "+ Add option"}
          </Button>
        </div>
      </div>
    </section>
  );
}
