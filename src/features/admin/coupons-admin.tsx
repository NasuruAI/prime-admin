"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall, adminList } from "@/lib/admin-client";

type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  value: string;
  is_active: boolean;
  used_count: number;
};

const selectCls =
  "h-10 border border-ink/15 bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none";

export function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    value: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setCoupons(await adminList<Coupon>("/promotions/coupons/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function add() {
    setError(null);
    try {
      await adminCall("/promotions/coupons/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ code: "", discount_type: "percentage", value: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add failed.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Create */}
      <div className="admin-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">New coupon</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Code
            </label>
            <Input
              placeholder="SAVE10"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              className="w-40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Type
            </label>
            <select
              value={form.discount_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, discount_type: e.target.value }))
              }
              className={selectCls}
            >
              <option value="percentage">percentage</option>
              <option value="fixed">fixed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Value
            </label>
            <Input
              placeholder="10"
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: e.target.value }))
              }
              className="w-28"
            />
          </div>
          <Button type="button" onClick={add}>
            Add coupon
          </Button>
        </div>
      </div>

      {error && <Banner tone="error">{error}</Banner>}

      {/* List */}
      {coupons.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No coupons yet.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {coupons.map((c) => (
                <tr key={c.id} className="transition hover:bg-ink/[0.015]">
                  <td className="px-4 py-3 font-medium text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-ink/70">{c.discount_type}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {c.discount_type === "percentage"
                      ? `${c.value}%`
                      : c.value}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{c.used_count}×</td>
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
      )}
    </div>
  );
}
