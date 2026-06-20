import * as React from "react";

// On-brand categorical palette (burgundy/crimson family + ink + gold).
export const PALETTE = [
  "#6E0D25",
  "#C9184A",
  "#1A1A2E",
  "#E8638A",
  "#C9963F",
  "#8A1130",
  "#560A1D",
  "#A8123D",
];

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card p-6">
      <div className="mb-5">
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink/50">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty() {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-ink/40">
      No data yet.
    </div>
  );
}

/** Vertical bars — good for a time series. */
export function BarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number; hint?: string }[];
  formatValue?: (n: number) => string;
}) {
  if (data.every((d) => d.value === 0)) return <Empty />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      {/* Bars: each column is full-height (definite) so the bar's % height
          resolves correctly — `items-end` alone would collapse them. */}
      <div className="flex h-44 items-end gap-1">
        {data.map((d, i) => (
          <div
            key={i}
            className="group flex h-full flex-1 flex-col justify-end"
            title={d.hint ?? `${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
          >
            <div
              className="w-full bg-primary/80 transition group-hover:bg-accent"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value > 0 ? "3px" : "0",
              }}
            />
          </div>
        ))}
      </div>
      {/* Labels aligned under each bar via matching flex-1 + gap. */}
      <div className="mt-1.5 flex gap-1">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[9px] leading-none text-ink/40"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Horizontal bars — good for ranked labels (e.g. top products). */
export function HBarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[];
  formatValue?: (n: number) => string;
}) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-ink/70">{d.label}</span>
            <span className="shrink-0 font-medium text-ink/50">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div className="h-2.5 w-full bg-ink/5">
            <div
              className="h-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: PALETTE[i % PALETTE.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Donut with a legend — good for proportions. */
export function DonutChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <Empty />;
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#1a1a2e0d" strokeWidth="15" />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const seg = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="15"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="flex min-w-[8rem] flex-1 flex-col gap-2 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0"
              style={{ background: PALETTE[i % PALETTE.length] }}
              aria-hidden
            />
            <span className="truncate text-ink/70">{d.label}</span>
            <span className="ml-auto font-medium text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
