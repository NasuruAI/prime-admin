"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall, adminList } from "@/lib/admin-client";

type AdminCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
};

export function CurrenciesAdmin() {
  const [currencies, setCurrencies] = useState<AdminCurrency[]>([]);
  const [form, setForm] = useState({ code: "", name: "", symbol: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setCurrencies(await adminList<AdminCurrency>("/currency/currencies/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function add() {
    setError(null);
    setStatus(null);
    try {
      await adminCall("/currency/currencies/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ code: "", name: "", symbol: "" });
      await load();
      setStatus("Currency added.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add failed.");
    }
  }

  async function refreshRates() {
    setError(null);
    try {
      const res = await adminCall<{ ok?: boolean; source?: string }>(
        "/currency/currencies/refresh-rates/",
        { method: "POST" },
      );
      setStatus(`Rates refreshed (${res.source ?? "provider"}).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="admin-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Add currency</h2>
          <Button type="button" variant="ghost" onClick={refreshRates}>
            Refresh FX rates
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Code
            </label>
            <Input
              placeholder="USD"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              className="w-28"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Name
            </label>
            <Input
              placeholder="US Dollar"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Symbol
            </label>
            <Input
              placeholder="$"
              value={form.symbol}
              onChange={(e) =>
                setForm((f) => ({ ...f, symbol: e.target.value }))
              }
              className="w-20"
            />
          </div>
          <Button type="button" onClick={add}>
            Add currency
          </Button>
        </div>
      </div>

      {status && <Banner tone="success">{status}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {/* List */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {currencies.map((c) => (
              <tr key={c.id} className="transition hover:bg-ink/[0.015]">
                <td className="px-4 py-3 font-medium text-ink">{c.code}</td>
                <td className="px-4 py-3 text-ink/70">{c.name}</td>
                <td className="px-4 py-3 text-ink/70">{c.symbol}</td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={c.is_active ? "success" : "danger"}>
                    {c.is_active ? "active" : "inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink/50">
        FX markup and per-currency rounding are configured in{" "}
        <a href="/settings" className="text-primary underline">
          Settings
        </a>
        .
      </p>
    </div>
  );
}
