"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall, adminList } from "@/lib/admin-client";

type AdapterInfo = {
  key: string;
  label: string;
  description: string;
  fields: string[];
};

type Supplier = {
  id: number;
  name: string;
  code: string;
  adapter: string;
  is_active: boolean;
  markup_percent: string;
  product_count: number;
  updated_at: string;
};

// One illustrative cost so the profit example is easy to grasp.
const EXAMPLE_COST = 10;

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const selectCls =
  "h-10 w-full border border-ink/15 bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none";

export function SuppliersAdmin() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Add-supplier form
  const [adapters, setAdapters] = useState<AdapterInfo[]>([]);
  const [name, setName] = useState("");
  const [adapter, setAdapter] = useState("mock");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [newMarkup, setNewMarkup] = useState("50");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const selected = adapters.find((a) => a.key === adapter);
  const needs = (f: string) => selected?.fields.includes(f) ?? false;

  async function load() {
    setSuppliers(await adminList<Supplier>("/suppliers/suppliers/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
    adminList<AdapterInfo>("/suppliers/suppliers/adapters/")
      .then(setAdapters)
      .catch(() => {});
  }, []);

  async function addSupplier() {
    if (!name.trim()) return setAddError("Give the supplier a name.");
    if (needs("api_base_url") && !apiUrl.trim())
      return setAddError("This connection type needs an API / feed URL.");
    setAdding(true);
    setAddError(null);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        adapter,
        markup_percent: newMarkup || "50",
        is_active: true,
      };
      if (needs("api_base_url")) body.api_base_url = apiUrl.trim();
      if (needs("api_key") && apiKey.trim()) body.api_key = apiKey.trim();
      await adminCall("/suppliers/suppliers/", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setName("");
      setApiUrl("");
      setApiKey("");
      setNewMarkup("50");
      await load();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Could not add supplier.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Plain-language explainer */}
      <div className="border-l-2 border-primary bg-primary/5 p-4 text-sm text-ink/70">
        <strong className="text-ink">How dropshipping works here:</strong> you
        sell a supplier&apos;s products, and when a customer pays, the supplier
        ships straight to them. You set a <strong>markup</strong> — the profit
        you add on top of the supplier&apos;s cost. Click{" "}
        <strong>Update from supplier</strong> to pull the latest costs and stock;
        your selling prices update automatically with your markup.
      </div>

      {/* Add a supplier */}
      <div className="admin-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-ink">
          Add a supplier
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[12rem] flex-1">
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Supplier name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Dropshipping"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Connection type
            </label>
            <select
              value={adapter}
              onChange={(e) => setAdapter(e.target.value)}
              className={selectCls}
            >
              {adapters.length === 0 && (
                <option value="mock">Test (mock)</option>
              )}
              {adapters.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Markup %
            </label>
            <Input
              value={newMarkup}
              onChange={(e) => setNewMarkup(e.target.value)}
              className="w-24"
              inputMode="decimal"
            />
          </div>
          <Button type="button" onClick={addSupplier} disabled={adding}>
            {adding ? "Adding…" : "Add supplier"}
          </Button>
        </div>

        {selected?.description && (
          <p className="mt-3 text-xs text-ink/55">{selected.description}</p>
        )}

        {/* Connection details — only shown for connection types that need them. */}
        {(needs("api_base_url") || needs("api_key")) && (
          <div className="mt-3 grid gap-3 border-t border-ink/10 pt-3 sm:grid-cols-2">
            {needs("api_base_url") && (
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">
                  {adapter === "csv" ? "CSV feed URL" : "API base URL"}
                </label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder={
                    adapter === "csv"
                      ? "https://supplier.com/feed.csv"
                      : "https://api.supplier.com"
                  }
                />
              </div>
            )}
            {needs("api_key") && (
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">
                  API key{" "}
                  <span className="font-normal text-ink/40">(optional)</span>
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste the supplier's API key"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        )}

        {addError && (
          <p className="mt-2 text-sm text-accent">{addError}</p>
        )}
      </div>

      {error && <Banner tone="error">{error}</Banner>}

      {suppliers.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No suppliers yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {suppliers.map((s) => (
            <SupplierCard key={s.id} supplier={s} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function SupplierCard({
  supplier,
  onChanged,
}: {
  supplier: Supplier;
  onChanged: () => Promise<void>;
}) {
  const [markup, setMarkup] = useState(supplier.markup_percent);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pct = Number(markup) || 0;
  const sell = EXAMPLE_COST * (1 + pct / 100);
  const profit = sell - EXAMPLE_COST;
  const dirty = markup !== supplier.markup_percent;

  async function saveMarkup() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await adminCall(`/suppliers/suppliers/${supplier.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ markup_percent: markup }),
      });
      setStatus("Markup saved — selling prices updated.");
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save markup.");
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await adminCall<{ inventory: number; prices: number }>(
        `/suppliers/suppliers/${supplier.id}/sync/`,
        { method: "POST" },
      );
      setStatus(
        `Updated ${res.prices} price${res.prices === 1 ? "" : "s"} and ${res.inventory} stock item${res.inventory === 1 ? "" : "s"}.`,
      );
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ink">
              {supplier.name}
            </h2>
            <Badge tone={supplier.is_active ? "success" : "danger"}>
              {supplier.is_active ? "active" : "paused"}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-ink/50">
            {supplier.product_count} product
            {supplier.product_count === 1 ? "" : "s"} · ships via{" "}
            {supplier.adapter}
          </p>
        </div>
      </div>

      {/* Markup + live profit example */}
      <div className="border border-ink/10 bg-surface p-4">
        <label className="mb-1 block text-xs font-medium text-ink/60">
          Your profit markup
        </label>
        <div className="flex items-center gap-2">
          <Input
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            className="w-24"
            inputMode="decimal"
          />
          <span className="text-sm text-ink/70">% on top of cost</span>
        </div>
        <p className="mt-3 text-sm text-ink/70">
          Example: you buy at{" "}
          <span className="font-medium text-ink">{money(EXAMPLE_COST)}</span> →
          you sell at{" "}
          <span className="font-medium text-ink">{money(sell)}</span> →{" "}
          <span className="font-medium text-green-700">
            profit {money(profit)}
          </span>
        </p>
        {dirty && (
          <Button
            type="button"
            onClick={saveMarkup}
            disabled={busy}
            className="mt-3"
          >
            {busy ? "Saving…" : "Save markup"}
          </Button>
        )}
      </div>

      {status && <Banner tone="success">{status}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={sync} disabled={busy}>
          ↻ Update from supplier
        </Button>
        <span className="text-xs text-ink/45">
          Pulls latest costs &amp; stock
        </span>
      </div>
    </div>
  );
}
