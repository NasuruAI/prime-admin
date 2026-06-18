"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { adminCall, adminList } from "@/lib/admin-client";

type Supplier = {
  id: string;
  name: string;
  code: string;
  adapter: string;
  is_active: boolean;
};

export function SuppliersAdmin() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setSuppliers(await adminList<Supplier>("/suppliers/suppliers/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function sync(id: string) {
    setError(null);
    setStatus(null);
    try {
      const res = await adminCall<{ inventory: number; prices: number }>(
        `/suppliers/suppliers/${id}/sync/`,
        { method: "POST" },
      );
      setStatus(`Synced: ${res.inventory} stock, ${res.prices} prices.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {status && <Banner tone="success">{status}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {suppliers.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No suppliers configured.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Adapter</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {suppliers.map((s) => (
                <tr key={s.id} className="transition hover:bg-ink/[0.015]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{s.name}</div>
                    <div className="text-xs text-ink/50">{s.code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="info">{s.adapter}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={s.is_active ? "success" : "danger"}>
                      {s.is_active ? "active" : "inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => sync(s.id)}
                    >
                      Sync
                    </Button>
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
