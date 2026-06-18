"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { adminList } from "@/lib/admin-client";

type Inquiry = {
  id: string;
  channel: "telegram" | "whatsapp" | "call";
  context: "product" | "cart" | "checkout";
  customer_name: string;
  customer_phone: string;
  note: string;
  summary: string;
  delivered_to_ops: boolean;
  created_at: string;
};

const CHANNEL_TONE: Record<Inquiry["channel"], "info" | "success" | "warning"> = {
  telegram: "info",
  whatsapp: "success",
  call: "warning",
};

export function InquiriesAdmin() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminList<Inquiry>("/order-inquiries/")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;
  if (error) return <Banner tone="error">{error}</Banner>;

  if (items.length === 0) {
    return (
      <div className="admin-card p-10 text-center text-sm text-ink/55">
        No chat orders yet. When shoppers tap “Order on Telegram/WhatsApp/Call”,
        their requests appear here.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((q) => (
        <div key={q.id} className="admin-card p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone={CHANNEL_TONE[q.channel]}>{q.channel}</Badge>
            <span className="text-xs uppercase tracking-wide text-ink/45">
              {q.context}
            </span>
            {q.delivered_to_ops && (
              <span className="text-xs text-green-700">· sent to Telegram</span>
            )}
            <span className="ml-auto text-xs text-ink/45">
              {new Date(q.created_at).toLocaleString()}
            </span>
          </div>
          {(q.customer_name || q.customer_phone) && (
            <p className="mb-1 text-sm font-medium text-ink">
              {q.customer_name}
              {q.customer_phone && (
                <a
                  href={`tel:${q.customer_phone}`}
                  className="ml-2 font-normal text-primary hover:text-accent"
                >
                  {q.customer_phone}
                </a>
              )}
            </p>
          )}
          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-ink/70">
            {q.summary}
          </pre>
        </div>
      ))}
    </div>
  );
}
