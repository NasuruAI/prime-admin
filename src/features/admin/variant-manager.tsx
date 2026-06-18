"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { AdminOptionType, AdminVariant } from "@/types/catalog";

const selectCls =
  "h-9 w-full border border-ink/15 bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none";

type Draft = { sku: string; price: string; stock: string; is_active: boolean };
type VariantImage = { id: string; thumb: string };

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
  const [draft, setDraft] = useState<Draft>({
    sku: "",
    price: "",
    stock: "0",
    is_active: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>({
    sku: "",
    price: "",
    stock: "0",
    is_active: true,
  });
  const [newOptions, setNewOptions] = useState<Record<number, string>>({});

  function startEdit(v: AdminVariant) {
    setError(null);
    setEditId(v.id);
    setDraft({
      sku: v.sku,
      price: v.price,
      stock: String(stock[v.id] ?? 0),
      is_active: v.is_active,
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
      setNewDraft({ sku: "", price: "", stock: "0", is_active: true });
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
                  <tr key={v.id} className="bg-surface">
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
