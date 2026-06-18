import Link from "next/link";

import {
  BarChart,
  ChartCard,
  DonutChart,
  HBarChart,
} from "@/components/ui/charts";
import { adminFetch } from "@/lib/admin";
import { getSession } from "@/lib/session";
import type { Analytics } from "@/types/analytics";

export const metadata = { title: "Dashboard" };

function money(currency: string, amount: string | number) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminDashboard() {
  const [user, data] = await Promise.all([
    getSession(),
    adminFetch<Analytics>("/admin/analytics/"),
  ]);
  const firstName = (user?.full_name || user?.email || "").split(/[\s@]/)[0];
  const k = data.kpis;

  const cards = [
    { label: "Revenue", value: money(k.currency, k.revenue), sub: `${k.paid_orders} paid orders`, icon: "coin" },
    { label: "Orders", value: String(k.orders), sub: `${k.paid_orders} paid`, icon: "bag" },
    { label: "Avg order value", value: money(k.currency, k.avg_order_value), sub: "per paid order", icon: "chart" },
    { label: "Products", value: String(k.products), sub: "active", icon: "box" },
    { label: "Customers", value: String(k.customers), sub: "registered", icon: "users" },
    {
      label: "Low stock",
      value: String(k.low_stock),
      sub: "variants ≤ 5",
      icon: "alert",
      alert: k.low_stock > 0,
    },
  ];

  const trend = data.revenue_by_day.map((d) => {
    const [, m, day] = d.date.split("-");
    return {
      label: `${m}/${day}`,
      value: Number(d.revenue),
      hint: `${d.date}: ${money(k.currency, d.revenue)} · ${d.orders} orders`,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-ink/50">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="admin-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink/50">
                {c.label}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center ${
                  c.alert
                    ? "bg-accent/10 text-accent"
                    : "bg-primary/5 text-primary"
                }`}
              >
                {ICONS[c.icon]}
              </span>
            </div>
            <div className="mt-3 font-display text-2xl font-bold text-ink">
              {c.value}
            </div>
            <div className="mt-0.5 text-xs text-ink/45">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue"
            subtitle={`Last 14 days · ${k.currency}`}
          >
            <BarChart
              data={trend}
              formatValue={(n) => money(k.currency, n)}
            />
          </ChartCard>
        </div>
        <ChartCard title="Orders by status">
          <DonutChart
            data={data.orders_by_status.map((s) => ({
              label: s.label,
              value: s.count,
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Top products" subtitle="By units sold">
            <HBarChart
              data={data.top_products.map((p) => ({
                label: p.title,
                value: p.quantity,
              }))}
              formatValue={(n) => `${n} sold`}
            />
          </ChartCard>
        </div>
        <ChartCard title="Fulfilment" subtitle="Units by route">
          <DonutChart
            data={data.fulfillment_split.map((f) => ({
              label: f.type,
              value: f.quantity,
            }))}
          />
        </ChartCard>
      </div>

      {/* Quick links */}
      <nav className="flex flex-wrap gap-2">
        {[
          ["/catalog", "Catalog"],
          ["/orders", "Orders"],
          ["/currencies", "Currencies"],
          ["/coupons", "Coupons"],
          ["/users", "Users"],
          ["/settings", "Settings"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="border border-ink/15 bg-white px-4 py-2 text-sm text-ink transition hover:border-primary hover:text-primary"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function icon(children: React.ReactNode) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  coin: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h3.2a1.8 1.8 0 0 1 0 3.6H9.5h3.5a1.8 1.8 0 0 1 0 3.6H9.5" />
    </>,
  ),
  bag: icon(
    <>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </>,
  ),
  chart: icon(
    <>
      <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />
    </>,
  ),
  box: icon(
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
    </>,
  ),
  users: icon(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5" />
    </>,
  ),
  alert: icon(
    <>
      <path d="M12 9v4M12 17h.01M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </>,
  ),
};
