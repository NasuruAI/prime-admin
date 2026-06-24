"use client";

import { useEffect, useState } from "react";

import { Badge, statusTone } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { adminCall, adminList } from "@/lib/admin-client";

type AdminOrder = {
  number: string;
  status: string;
  currency: string;
  total_charged: string;
  contact_email: string;
  paid_by_label: string;
};

const STATUSES = [
  "pending",
  "paid",
  "routing",
  "partially_fulfilled",
  "fulfilled",
  "completed",
  "cancelled",
  "refunded",
];

const selectCls =
  "h-9 border border-ink/15 bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none";

export function OrdersAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setOrders(await adminList<AdminOrder>("/orders/"));
  }
  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function transition(number: string, status: string) {
    setError(null);
    try {
      await adminCall(`/orders/${number}/transition/`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transition failed.");
    }
  }

  async function refund(number: string) {
    setError(null);
    try {
      await adminCall(`/orders/${number}/refund/`, { method: "POST" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refund failed.");
    }
  }

  async function markShipped(number: string) {
    // Optional tracking; Cancel aborts, blank ships with no tracking.
    const tracking = window.prompt(
      "Mark this order shipped?\nThis emails the customer that their order has shipped.\n\nTracking number (optional):",
      "",
    );
    if (tracking === null) return;
    setError(null);
    try {
      await adminCall(`/orders/${number}/mark-shipped/`, {
        method: "POST",
        body: JSON.stringify({ tracking_number: tracking.trim() }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark shipped.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Banner tone="error">{error}</Banner>}

      {orders.length === 0 ? (
        <div className="admin-card p-10 text-center text-sm text-ink/55">
          No orders yet.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {orders.map((o) => (
                <tr key={o.number} className="transition hover:bg-ink/[0.015]">
                  <td className="px-4 py-3 font-medium text-ink">{o.number}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(o.status)}>
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {o.currency} {o.total_charged}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{o.contact_email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {(o.status === "routing" ||
                        o.status === "partially_fulfilled") && (
                        <Button
                          type="button"
                          onClick={() => markShipped(o.number)}
                        >
                          Mark shipped
                        </Button>
                      )}
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          e.target.value && transition(o.number, e.target.value)
                        }
                        className={selectCls}
                      >
                        <option value="">Set status…</option>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => refund(o.number)}
                      >
                        Refund
                      </Button>
                    </div>
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
