"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";
import type {
  AdminOptionType,
  AdminProduct,
  AdminVariant,
  Brand,
  Category,
  ProductImage,
} from "@/types/catalog";

import { CloudinaryUpload } from "./cloudinary-upload";
import { VariantManager } from "./variant-manager";

const selectCls =
  "h-10 w-full border border-ink/15 bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-ink/60";

export function ProductDetailEditor({
  product,
  variants,
  images,
  categories,
  brands,
  optionTypes,
  stock,
}: {
  product: AdminProduct;
  variants: AdminVariant[];
  images: ProductImage[];
  categories: Category[];
  brands: Brand[];
  optionTypes: AdminOptionType[];
  stock: Record<string, number>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    category: product.category ? String(product.category) : "",
    brand: product.brand ? String(product.brand) : "",
    fulfillment_type: product.fulfillment_type,
    is_active: product.is_active,
  });

  const categoryName =
    categories.find((c) => c.id === product.category)?.name ?? "—";
  const brandName = brands.find((b) => b.id === product.brand)?.name ?? "—";

  // Product-level images (gallery) vs per-variant images.
  const productImages = images.filter((i) => !i.variant);
  const variantImages: Record<string, { id: string; thumb: string }> = {};
  for (const i of images) {
    if (i.variant) variantImages[i.variant] = { id: i.id, thumb: i.urls.thumb };
  }

  async function attachProductImage(publicId: string) {
    try {
      await adminCall(`/catalog/products/${product.id}/images/`, {
        method: "POST",
        body: JSON.stringify({
          public_id: publicId,
          is_primary: productImages.length === 0, // first image becomes featured
        }),
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add image.");
    }
  }

  async function makeFeatured(id: string) {
    try {
      await adminCall(`/catalog/images/${id}/make-primary/`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not set featured image.");
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await adminCall(`/catalog/products/${product.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category ? Number(form.category) : null,
          brand: form.brand ? Number(form.brand) : null,
          fulfillment_type: form.fulfillment_type,
          is_active: form.is_active,
        }),
      });
      setEditing(false);
      setStatus("Product updated.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteImage(id: string) {
    try {
      await adminCall(`/catalog/images/${id}/`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete image.");
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/catalog"
            className="text-sm text-ink/55 transition hover:text-primary"
          >
            ← Catalog
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink">
              {product.title}
            </h1>
            <Badge tone={product.is_active ? "success" : "danger"}>
              {product.is_active ? "active" : "inactive"}
            </Badge>
          </div>
          <p className="font-mono text-xs text-ink/45">/p/{product.short_id}</p>
        </div>
        {!editing ? (
          <Button type="button" onClick={() => setEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </div>

      {status && <Banner tone="success">{status}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {/* Details / edit */}
      <section className="admin-card p-6">
        {!editing ? (
          <dl className="grid grid-cols-[8rem_1fr] gap-y-3 text-sm">
            <dt className="text-ink/50">Category</dt>
            <dd className="text-ink">{categoryName}</dd>
            <dt className="text-ink/50">Brand</dt>
            <dd className="text-ink">{brandName}</dd>
            <dt className="text-ink/50">Fulfillment</dt>
            <dd className="capitalize text-ink">{product.fulfillment_type}</dd>
            <dt className="text-ink/50">Price from</dt>
            <dd className="text-ink">{product.price_from ?? "—"}</dd>
            <dt className="text-ink/50">Description</dt>
            <dd className="text-ink/80">
              {product.description || (
                <span className="text-ink/40">No description.</span>
              )}
            </dd>
          </dl>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Title</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                rows={3}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full border border-ink/15 bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={selectCls}
                >
                  <option value="">— none —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Brand</label>
                <select
                  value={form.brand}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, brand: e.target.value }))
                  }
                  className={selectCls}
                >
                  <option value="">— none —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Fulfillment</label>
                <select
                  value={form.fulfillment_type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fulfillment_type: e.target.value as
                        | "internal"
                        | "dropship",
                    }))
                  }
                  className={selectCls}
                >
                  <option value="internal">Internal stock</option>
                  <option value="dropship">Dropship supplier</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
                Active (visible in store)
              </label>
            </div>
          </div>
        )}
      </section>

      {/* Variants — create / edit / delete + one image each */}
      <VariantManager
        productId={product.id}
        variants={variants}
        optionTypes={optionTypes}
        stock={stock}
        variantImages={variantImages}
      />

      {/* Product images — a gallery; one is the featured image */}
      <section className="admin-card p-6">
        <h2 className="mb-1 font-display text-base font-bold text-ink">
          Product images
        </h2>
        <p className="mb-4 text-xs text-ink/50">
          Add as many as you like. The featured image is used on cards and as
          the product hero.
        </p>
        <div className="mb-5 flex flex-wrap gap-4">
          {productImages.length === 0 && (
            <span className="text-sm text-ink/40">No images yet.</span>
          )}
          {productImages.map((img) => (
            <div key={img.id} className="w-28">
              <div className="group relative aspect-square w-full overflow-hidden border border-ink/10 bg-surface">
                <Image
                  src={img.urls.thumb}
                  alt={img.alt_text}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="Delete image"
                  onClick={() => deleteImage(img.id)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center bg-accent text-xs text-white group-hover:flex"
                >
                  ✕
                </button>
                {img.is_primary && (
                  <span className="absolute bottom-1 left-1">
                    <Badge tone="info">featured</Badge>
                  </span>
                )}
              </div>
              {!img.is_primary && (
                <button
                  type="button"
                  onClick={() => makeFeatured(img.id)}
                  className="mt-1 text-xs font-medium text-primary hover:text-accent"
                >
                  Set featured
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="max-w-[10rem] border-t border-ink/10 pt-4">
          <p className="mb-2 text-xs font-medium text-ink/60">Add image</p>
          <CloudinaryUpload
            value=""
            onChange={(_url, publicId) => publicId && attachProductImage(publicId)}
          />
        </div>
      </section>
    </div>
  );
}
