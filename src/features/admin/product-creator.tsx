"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall, adminList } from "@/lib/admin-client";

import { CloudinaryUpload } from "./cloudinary-upload";

type Ref = { id: number; name: string };
type OptionDraft = { name: string; values: string };

const selectCls =
  "h-10 w-full border border-ink/15 bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-ink/60";

type SupplierRef = { id: number; name: string };

export function ProductCreator() {
  const [categories, setCategories] = useState<Ref[]>([]);
  const [brands, setBrands] = useState<Ref[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRef[]>([]);

  // Product fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [brandId, setBrandId] = useState("");
  const [fulfillment, setFulfillment] = useState("internal");
  const [supplierId, setSupplierId] = useState("");
  const [discountOn, setDiscountOn] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");

  // Featured image (uploaded to Cloudinary; we submit its public_id).
  const [featuredUrl, setFeaturedUrl] = useState("");
  const [featuredPublicId, setFeaturedPublicId] = useState("");

  // Type
  const [kind, setKind] = useState<"simple" | "variable">("simple");

  // Simple
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");

  // Variable
  const [options, setOptions] = useState<OptionDraft[]>([
    { name: "Size", values: "S, M, L" },
  ]);
  const [defaultPrice, setDefaultPrice] = useState("");
  const [skuPrefix, setSkuPrefix] = useState("");
  const [stockPerVariant, setStockPerVariant] = useState("0");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; count: number } | null>(null);

  useEffect(() => {
    adminList<Ref>("/catalog/categories/").then(setCategories).catch(() => {});
    adminList<Ref>("/catalog/brands/").then(setBrands).catch(() => {});
    adminList<SupplierRef>("/suppliers/suppliers/").then(setSuppliers).catch(() => {});
  }, []);

  function setOption(i: number, patch: Partial<OptionDraft>) {
    setOptions((cur) => cur.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }

  async function create() {
    if (busy) return; // guard against double-submit
    setError(null);
    setDone(null);

    if (!title.trim()) return setError("Title is required.");
    if (kind === "simple" && (!sku.trim() || !price.trim()))
      return setError("SKU and price are required for a simple product.");
    const cleanOptions = options
      .map((o) => ({
        name: o.name.trim(),
        values: o.values
          .split(/[\n,]/)
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((o) => o.name && o.values.length > 0);
    if (kind === "variable") {
      if (cleanOptions.length === 0)
        return setError("Add at least one option with values.");
      if (!defaultPrice.trim())
        return setError("A default price is required to generate variants.");
    }

    setBusy(true);
    try {
      // ONE atomic request — the backend creates the product, image, options,
      // variants and stock in a single transaction. A failure rolls everything
      // back, so it's impossible to end up with orphan / duplicate products.
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category: categoryId ? Number(categoryId) : null,
        new_category: newCategory.trim(),
        brand: brandId ? Number(brandId) : null,
        fulfillment_type: fulfillment,
        supplier: fulfillment === "dropship" && supplierId ? supplierId : null,
        is_active: true,
        discount_percent: discountOn ? discountPercent || "0" : "0",
        image_public_id: featuredPublicId,
        kind,
      };
      if (kind === "simple") {
        payload.sku = sku.trim();
        payload.price = price;
        payload.stock = Number(stock) || 0;
      } else {
        payload.options = cleanOptions;
        payload.default_price = defaultPrice;
        payload.sku_prefix = skuPrefix.trim();
        payload.stock_per_variant = Number(stockPerVariant) || 0;
      }

      const product = await adminCall<{ id: string; variant_count: number }>(
        "/catalog/products/create-full/",
        { method: "POST", body: JSON.stringify(payload) },
      );

      setDone({ id: product.id, count: product.variant_count });
      // Reset for a quick "add another".
      setTitle("");
      setDescription("");
      setSku("");
      setPrice("");
      setStock("0");
      setDefaultPrice("");
      setSkuPrefix("");
      setNewCategory("");
      setFeaturedUrl("");
      setFeaturedPublicId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {done && (
        <Banner tone="success">
          Product created with {done.count} variant
          {done.count === 1 ? "" : "s"}.{" "}
          <Link href={`/catalog/${done.id}`} className="underline">
            View product
          </Link>{" "}
          ·{" "}
          <Link href="/catalog" className="underline">
            Back to catalog
          </Link>
        </Banner>
      )}
      {error && <Banner tone="error">{error}</Banner>}

      {/* Details */}
      <section className="admin-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-ink">
          Product details
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Classic Tee"
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A comfy cotton t-shirt."
              className="w-full border border-ink/15 bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={selectCls}
                disabled={!!newCategory.trim()}
              >
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="…or create a new category"
                className="mt-2"
              />
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
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
                value={fulfillment}
                onChange={(e) => setFulfillment(e.target.value)}
                className={selectCls}
              >
                <option value="internal">Internal stock (you ship)</option>
                <option value="dropship">Dropship (supplier ships)</option>
              </select>
              {fulfillment === "dropship" && (
                <div className="mt-2">
                  <label className={labelCls}>Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">— choose a supplier —</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {suppliers.length === 0 && (
                    <p className="mt-1 text-xs text-ink/45">
                      No suppliers yet — add one on the Suppliers page first.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Featured image</label>
              <div className="max-w-[10rem]">
                <CloudinaryUpload
                  value={featuredUrl}
                  onChange={(url, publicId) => {
                    setFeaturedUrl(url);
                    setFeaturedPublicId(publicId ?? "");
                  }}
                />
              </div>
            </div>
          </div>

          {/* Discount */}
          <div className="border-t border-ink/10 pt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={discountOn}
                onChange={(e) => setDiscountOn(e.target.checked)}
              />
              Put this product on discount
            </label>
            {discountOn && (
              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-24"
                  inputMode="decimal"
                  placeholder="10"
                />
                <span className="text-sm text-ink/70">
                  % off — shoppers see the original price struck through and pay
                  the discounted price.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Type */}
      <section className="admin-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-ink">
          Pricing &amp; variations
        </h2>
        <div className="mb-5 flex gap-2">
          {(["simple", "variable"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`h-9 px-4 text-sm font-medium transition ${
                kind === k
                  ? "bg-primary text-white"
                  : "border border-ink/15 bg-white text-ink hover:border-primary"
              }`}
            >
              {k === "simple" ? "Simple product" : "With options"}
            </button>
          ))}
        </div>

        {kind === "simple" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>SKU</label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="TEE-001" />
            </div>
            <div>
              <label className={labelCls}>Price</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="19.99" />
            </div>
            <div>
              <label className={labelCls}>Starting stock</label>
              <Input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink/55">
              Define options (e.g. Size, Color). Every combination becomes a
              variant.
            </p>
            {options.map((o, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                <div>
                  <label className={labelCls}>Option name</label>
                  <Input
                    value={o.name}
                    onChange={(e) => setOption(i, { name: e.target.value })}
                    placeholder="Size"
                  />
                </div>
                <div>
                  <label className={labelCls}>Values (comma-separated)</label>
                  <Input
                    value={o.values}
                    onChange={(e) => setOption(i, { values: e.target.value })}
                    placeholder="S, M, L"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setOptions((cur) => cur.filter((_, idx) => idx !== i))
                    }
                    disabled={options.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setOptions((cur) => [...cur, { name: "", values: "" }])
                }
              >
                + Add option
              </Button>
            </div>
            <div className="grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Default price</label>
                <Input
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  placeholder="19.99"
                />
              </div>
              <div>
                <label className={labelCls}>SKU prefix</label>
                <Input
                  value={skuPrefix}
                  onChange={(e) => setSkuPrefix(e.target.value)}
                  placeholder="TEE"
                />
              </div>
              <div>
                <label className={labelCls}>Stock per variant</label>
                <Input
                  value={stockPerVariant}
                  onChange={(e) => setStockPerVariant(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={create} disabled={busy}>
          {busy ? "Creating…" : "Create product"}
        </Button>
        <Link
          href="/catalog"
          className="text-sm text-ink/55 transition hover:text-primary"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
