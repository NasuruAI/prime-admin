"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { adminList } from "@/lib/admin-client";

type Entry = {
  id: string;
  created_at: string;
  actor_label: string;
  action: string;
  target_type: string;
  target_id: string;
};

export function AuditLog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminList<Entry>("/audit/")
      .then(setEntries)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load"),
      );
  }, []);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (entries.length === 0)
    return (
      <div className="admin-card p-10 text-center text-sm text-ink/55">
        No audit entries yet.
      </div>
    );

  return (
    <div className="admin-card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
          <tr>
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Actor</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {entries.map((e) => (
            <tr key={e.id} className="transition hover:bg-ink/[0.015]">
              <td className="whitespace-nowrap px-4 py-3 text-ink/55">
                {new Date(e.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-ink/80">
                {e.actor_label || "system"}
              </td>
              <td className="px-4 py-3">
                <Badge tone="info">{e.action}</Badge>
              </td>
              <td className="px-4 py-3 text-ink/70">
                {e.target_type}
                {e.target_id ? ` #${e.target_id}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
