"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { AdminOptionType, AdminVariant } from "@/types/catalog";

const selectCls =
  "h-9 w-full border border-ink/15 bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none";

type TierRow = { min_qty: string; price: string };
type Draft = {
  sku: string;
  price: string;
  stock: string;
  is_active: boolean;
  moq: string;
  tiers: TierRow[];
};
type VariantImage = { id: string; thumb: string };

const EMPTY_DRAFT: Draft = {
  sku: "",
  price: "",
  stock: "0",
  is_active: true,
  moq: "1",
  tiers: [],
};

/** Existing tier JSON -> editable rows. */
function rowsFromTiers(tiers: { min_qty: number; price: string }[]): TierRow[] {
  return (tiers ?? [])
    .map((t) => ({ min_qty: String(t.min_qty), price: String(t.price) }))
    .sort((a, b) => Number(a.min_qty) - Number(b.min_qty));
}

/** Editable rows -> clean tier payload for the API. */
function tiersPayload(rows: TierRow[]): { min_qty: number; price: string }[] {
  return rows
    .map((r) => ({ min_qty: Number(r.min_qty), price: r.price.trim() }))
    .filter((t) => Number.isFinite(t.min_qty) && t.min_qty > 1 && t.price);
}

function fmtNum(value: string): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : value;
}

/**
 * Structured price-break editor. The base Price covers the first range (from the
 * MOQ); each row sets a cheaper unit price "from N units up". A live preview
 * spells out the resulting ranges so there's no ambiguity.
 */
function TierEditor({
  basePrice,
  moq,
  rows,
  onChange,
}: {
  basePrice: string;
  moq: string;
  rows: TierRow[];
  onChange: (rows: TierRow[]) => void;
}) {
  const update = (i: number, patch: Partial<TierRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => onChange([...rows, { min_qty: "", price: "" }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  // Flag breaks that aren't a real saving (>= base, or >= a smaller-qty break).
  const baseNum = Number(basePrice) || Infinity;
  const invalid = new Set<number>();
  let prevValid = baseNum;
  for (const x of rows
    .map((r, i) => ({ i, q: Number(r.min_qty), p: Number(r.price) }))
    .filter((x) => x.q > 1 && x.p > 0)
    .sort((a, b) => a.q - b.q)) {
    if (!(x.p < prevValid)) invalid.add(x.i);
    else prevValid = x.p;
  }

  // Build the preview ranges: base tier (from MOQ) + each valid break, sorted.
  const start = Math.max(Number(moq) || 1, 1);
  const breaks = [
    { min: start, price: basePrice.trim() },
    ...tiersPayload(rows).map((t) => ({ min: t.min_qty, price: t.price })),
  ]
    .filter((b) => b.price)
    .sort((a, b) => a.min - b.min);

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/60">
        Volume pricing — cheaper unit price for bigger orders
      </label>
      <div className="flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="text-xs text-ink/45">
            No price breaks. The base price applies to every quantity.
          </p>
        )}
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-ink/55">From</span>
            <Input
              value={r.min_qty}
              onChange={(e) => update(i, { min_qty: e.target.value })}
              className="h-9 w-20"
              inputMode="numeric"
              placeholder="6"
            />
            <span className="text-ink/55">units →</span>
            <Input
              value={r.price}
              onChange={(e) => update(i, { price: e.target.value })}
              className={`h-9 w-28 ${invalid.has(i) ? "border-accent" : ""}`}
              inputMode="decimal"
              placeholder="9000"
            />
            <span className="text-ink/55">/ unit</span>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove price break"
              className="ml-1 flex h-7 w-7 items-center justify-center text-ink/40 transition hover:text-accent"
            >
              ✕
            </button>
          </div>
        ))}
        {invalid.size > 0 && (
          <p className="text-xs font-medium text-accent">
            Each price break must be lower than the base price and than smaller
            quantities — bigger orders should cost less per unit.
          </p>
        )}
        <button
          type="button"
          onClick={add}
          className="self-start text-xs font-semibold text-primary transition hover:text-accent"
        >
          + Add price break
        </button>
      </div>

      {breaks.length > 0 && (
        <div className="mt-3 border border-ink/10 bg-white p-3 text-xs">
          <span className="font-semibold text-ink/60">Customers pay</span>
          <ul className="mt-1.5 space-y-1">
            {breaks.map((b, i) => {
              const next = breaks[i + 1];
              const label = next
                ? `${b.min}–${next.min - 1} units`
                : `${b.min}+ units`;
              return (
                <li key={i} className="flex justify-between gap-4 text-ink/70">
                  <span>{label}</span>
                  <span className="font-medium text-ink">
                    {fmtNum(b.price)} / unit
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function VariantManager({
  productId,
  variants,
  optionTypes,
  stock,
  variantImages,
}: {
  productId: string;
  variants: AdminVariant[];
  optionTypes: AdminOptionType[];
  stock: Record<string, number>;
  variantImages: Record<string, VariantImage>;
}) {
  const router = useRouter();
  const hasOptions = optionTypes.length > 0;
  // A product without options can only hold one variant (unique empty options
  // key), so only offer "add" for variable products or an empty product.
  const canAdd = hasOptions || variants.length === 0;
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT);
  const [newOptions, setNewOptions] = useState<Record<number, string>>({});

  function startEdit(v: AdminVariant) {
    setError(null);
    setEditId(v.id);
    setDraft({
      sku: v.sku,
      price: v.price,
      stock: String(stock[v.id] ?? 0),
      is_active: v.is_active,
      moq: String(v.moq ?? 1),
      tiers: rowsFromTiers(v.price_tiers),
    });
  }

  async function setStock(variantId: string, qty: number) {
    await adminCall("/inventory/stock/", {
      method: "POST",
      body: JSON.stringify({ variant: variantId, quantity: qty }),
    });
  }

  async function saveEdit(v: AdminVariant) {
    setBusy(true);
    setError(null);
    try {
      await adminCall(`/catalog/variants/${v.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          sku: draft.sku.trim(),
          price: draft.price,
          is_active: draft.is_active,
          moq: Number(draft.moq) || 1,
          price_tiers: tiersPayload(draft.tiers),
        }),
      });
      if (Number(draft.stock) !== (stock[v.id] ?? 0)) {
        await setStock(v.id, Number(draft.stock));
      }
      setEditId(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(v: AdminVariant) {
    if (!window.confirm(`Delete variant ${v.sku}? This cannot be undone.`))
      return;
    setError(null);
    try {
      await adminCall(`/catalog/variants/${v.id}/`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  async function create() {
    setError(null);
    if (!newDraft.sku.trim() || !newDraft.price.trim())
      return setError("SKU and price are required.");
    if (hasOptions) {
      const missing = optionTypes.some((ot) => !newOptions[ot.id]);
      if (missing) return setError("Pick a value for every option.");
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        product: productId,
        sku: newDraft.sku.trim(),
        price: newDraft.price,
        is_active: newDraft.is_active,
        moq: Number(newDraft.moq) || 1,
        price_tiers: tiersPayload(newDraft.tiers),
      };
      if (hasOptions) {
        body.option_value_ids = optionTypes.map((ot) =>
          Number(newOptions[ot.id]),
        );
      }
      const variant = await adminCall<{ id: string }>("/catalog/variants/", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (Number(newDraft.stock) > 0) {
        await setStock(variant.id, Number(newDraft.stock));
      }
      setAdding(false);
      setNewDraft(EMPTY_DRAFT);
      setNewOptions({});
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create variant (duplicate?).",
      );
    } finally {
      setBusy(false);
    }
  }

  async function attachVariantImage(variantId: string, file: File) {
    setError(null);
    const { publicId } = await uploadToCloudinary(file);
    await adminCall(`/catalog/products/${productId}/images/`, {
      method: "POST",
      body: JSON.stringify({ public_id: publicId, variant: variantId }),
    });
    router.refresh();
  }

  async function removeVariantImage(imageId: string) {
    setError(null);
    try {
      await adminCall(`/catalog/images/${imageId}/`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove image.");
    }
  }

  return (
    <section className="admin-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink">
          Variants ({variants.length})
        </h2>
        {!adding && canAdd && (
          <Button type="button" variant="ghost" onClick={() => setAdding(true)}>
            + Add variant
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      {!canAdd && (
        <p className="mb-4 text-sm text-ink/55">
          This is a simple product (one variant). Add an option like{" "}
          <em>Size</em> or <em>Color</em> in the <strong>Options</strong> section
          above to create more variants.
        </p>
      )}

      {/* Create form */}
      {adding && (
        <div className="mb-5 border border-ink/10 bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            {optionTypes.map((ot) => (
              <div key={ot.id}>
                <label className="mb-1 block text-xs font-medium text-ink/60">
                  {ot.name}
                </label>
                <select
                  value={newOptions[ot.id] ?? ""}
                  onChange={(e) =>
                    setNewOptions((o) => ({ ...o, [ot.id]: e.target.value }))
                  }
                  className={selectCls}
                >
                  <option value="">—</option>
                  {ot.values.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/60">
                SKU
              </label>
              <Input
                value={newDraft.sku}
                onChange={(e) =>
                  setNewDraft((d) => ({ ...d, sku: e.target.value }))
                }
                className="w-32"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Price
              </label>
              <Input
                value={newDraft.price}
                onChange={(e) =>
                  setNewDraft((d) => ({ ...d, price: e.target.value }))
                }
                className="w-24"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Stock
              </label>
              <Input
                value={newDraft.stock}
                onChange={(e) =>
                  setNewDraft((d) => ({ ...d, stock: e.target.value }))
                }
                className="w-20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/60">
                MOQ
              </label>
              <Input
                value={newDraft.moq}
                onChange={(e) =>
                  setNewDraft((d) => ({ ...d, moq: e.target.value }))
                }
                className="w-20"
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="mb-3 max-w-md">
            <TierEditor
              basePrice={newDraft.price}
              moq={newDraft.moq}
              rows={newDraft.tiers}
              onChange={(tiers) => setNewDraft((d) => ({ ...d, tiers }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={create} disabled={busy}>
              {busy ? "Adding…" : "Create variant"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {variants.length === 0 ? (
        <p className="text-sm text-ink/55">No variants yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="py-2 pr-4 font-medium">Image</th>
                <th className="py-2 pr-4 font-medium">SKU</th>
                <th className="py-2 pr-4 font-medium">Price</th>
                <th className="py-2 pr-4 font-medium">Stock</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {variants.map((v) =>
                editId === v.id ? (
                  <Fragment key={v.id}>
                  <tr className="bg-surface">
                    <td className="py-2 pr-4">
                      <VariantImageCell
                        image={variantImages[v.id]}
                        onUpload={(f) => attachVariantImage(v.id, f)}
                        onRemove={() =>
                          removeVariantImage(variantImages[v.id].id)
                        }
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        value={draft.sku}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, sku: e.target.value }))
                        }
                        className="h-9 w-32"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        value={draft.price}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, price: e.target.value }))
                        }
                        className="h-9 w-24"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <Input
                        value={draft.stock}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, stock: e.target.value }))
                        }
                        className="h-9 w-20"
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <label className="inline-flex items-center gap-1.5 text-xs text-ink/70">
                        <input
                          type="checkbox"
                          checked={draft.is_active}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              is_active: e.target.checked,
                            }))
                          }
                        />
                        active
                      </label>
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => saveEdit(v)}
                          disabled={busy}
                        >
                          {busy ? "…" : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-surface">
                    <td colSpan={6} className="px-1 pb-3">
                      <div className="flex flex-wrap items-start gap-6 border-t border-ink/10 pt-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-ink/60">
                            MOQ (min order qty)
                          </label>
                          <Input
                            value={draft.moq}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, moq: e.target.value }))
                            }
                            className="h-9 w-24"
                            inputMode="numeric"
                          />
                        </div>
                        <div className="min-w-[20rem] flex-1">
                          <TierEditor
                            basePrice={draft.price}
                            moq={draft.moq}
                            rows={draft.tiers}
                            onChange={(tiers) =>
                              setDraft((d) => ({ ...d, tiers }))
                            }
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  </Fragment>
                ) : (
                  <tr key={v.id}>
                    <td className="py-2 pr-4">
                      <VariantImageCell
                        image={variantImages[v.id]}
                        onUpload={(f) => attachVariantImage(v.id, f)}
                        onRemove={() =>
                          removeVariantImage(variantImages[v.id].id)
                        }
                      />
                    </td>
                    <td className="py-2 pr-4 font-medium text-ink">{v.sku}</td>
                    <td className="py-2 pr-4 text-ink/70">
                      {v.price}
                      {Number(v.cost_price) > 0 && (
                        <span className="block text-[11px] text-ink/40">
                          cost {v.cost_price} · profit{" "}
                          {(Number(v.price) - Number(v.cost_price)).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-ink/70">
                      {stock[v.id] ?? 0}
                    </td>
                    <td className="py-2 pr-4">
                      {v.is_default && <Badge tone="info">default</Badge>}{" "}
                      {v.is_active ? (
                        <Badge tone="success">active</Badge>
                      ) : (
                        <Badge tone="danger">inactive</Badge>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(v)}
                          className="text-sm font-medium text-primary hover:text-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(v)}
                          className="text-sm font-medium text-ink/40 hover:text-accent"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Compact per-variant image: thumbnail + remove, or a small upload trigger. */
function VariantImageCell({
  image,
  onUpload,
  onRemove,
}: {
  image?: VariantImage;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputId = `vimg-${Math.random().toString(36).slice(2)}`;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
    }
  }

  if (image) {
    return (
      <div className="group relative h-12 w-12">
        <Image
          src={image.thumb}
          alt=""
          fill
          sizes="48px"
          className="border border-ink/10 object-cover"
        />
        <button
          type="button"
          aria-label="Remove image"
          onClick={onRemove}
          className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center bg-accent text-[10px] text-white group-hover:flex"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={inputId}
      className="flex h-12 w-12 cursor-pointer items-center justify-center border border-dashed border-ink/20 bg-surface text-[10px] text-ink/40 hover:border-primary hover:text-primary"
    >
      {busy ? "…" : "+ img"}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={onFile}
        disabled={busy}
        className="hidden"
      />
    </label>
  );
}
