"use client";

import { useEffect, useState } from "react";

import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";

type Setting = {
  key: string;
  section: string;
  type: "string" | "text" | "integer" | "decimal" | "boolean" | "json";
  description: string;
  default: unknown;
  value: unknown;
};

// Managed in their own dedicated editors, so hidden from the generic list.
const HIDDEN_PREFIXES = ["hero.", "payments."];

export function SettingsEditor() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  // Raw text buffer for JSON fields so typing invalid intermediate JSON never
  // reverts or crashes; we only commit to `draft` when it parses.
  const [jsonText, setJsonText] = useState<Record<string, string>>({});
  const [jsonInvalid, setJsonInvalid] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await adminCall<{ settings: Setting[] }>(
      "/storeconfig/settings/",
    );
    const visible = data.settings.filter(
      (s) => !HIDDEN_PREFIXES.some((p) => s.key.startsWith(p)),
    );
    setSettings(visible);
    setDraft(Object.fromEntries(visible.map((s) => [s.key, s.value])));
    setJsonText(
      Object.fromEntries(
        visible
          .filter((s) => s.type === "json")
          .map((s) => [s.key, JSON.stringify(s.value)]),
      ),
    );
    setJsonInvalid({});
  }

  useEffect(() => {
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load"),
    );
  }, []);

  async function save() {
    setStatus(null);
    setError(null);
    const changed: Record<string, unknown> = {};
    for (const s of settings) {
      if (JSON.stringify(draft[s.key]) !== JSON.stringify(s.value)) {
        changed[s.key] = draft[s.key];
      }
    }
    if (Object.keys(changed).length === 0) {
      setStatus("No changes to save.");
      return;
    }
    try {
      await adminCall("/storeconfig/settings/", {
        method: "PATCH",
        body: JSON.stringify({ values: changed }),
      });
      await load();
      setStatus(`Saved ${Object.keys(changed).length} setting(s).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
  }

  const sections = [...new Set(settings.map((s) => s.section))];

  function field(s: Setting) {
    if (s.type === "boolean") {
      return (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={Boolean(draft[s.key])}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [s.key]: e.target.checked }))
            }
          />
          {Boolean(draft[s.key]) ? "Enabled" : "Disabled"}
        </label>
      );
    }
    if (s.type === "json") {
      return (
        <div>
          <Input
            value={jsonText[s.key] ?? JSON.stringify(draft[s.key] ?? "")}
            onChange={(e) => {
              const text = e.target.value;
              setJsonText((t) => ({ ...t, [s.key]: text }));
              // Parse eagerly here (inside the handler), not lazily inside a
              // setState updater — otherwise the throw escapes any try/catch.
              try {
                const parsed = JSON.parse(text);
                setDraft((d) => ({ ...d, [s.key]: parsed }));
                setJsonInvalid((v) => ({ ...v, [s.key]: false }));
              } catch {
                setJsonInvalid((v) => ({ ...v, [s.key]: true }));
              }
            }}
          />
          {jsonInvalid[s.key] && (
            <p className="mt-1 text-xs text-accent">
              Invalid JSON — won&apos;t be saved until valid.
            </p>
          )}
        </div>
      );
    }
    return (
      <Input
        value={String(draft[s.key] ?? "")}
        onChange={(e) => setDraft((d) => ({ ...d, [s.key]: e.target.value }))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {sections.map((section) => (
        <section key={section} className="admin-card p-6">
          <h2 className="mb-4 font-display text-base font-bold capitalize text-ink">
            {section}
          </h2>
          <div className="flex flex-col divide-y divide-ink/10">
            {settings
              .filter((s) => s.section === section)
              .map((s) => (
                <div
                  key={s.key}
                  className="grid grid-cols-1 items-center gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_minmax(0,2fr)]"
                >
                  <div>
                    <div className="font-mono text-sm font-medium text-ink">
                      {s.key}
                    </div>
                    {s.description && (
                      <div className="mt-0.5 text-xs text-ink/50">
                        {s.description}
                      </div>
                    )}
                  </div>
                  <div>{field(s)}</div>
                </div>
              ))}
          </div>
        </section>
      ))}

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-ink/10 bg-white/90 px-4 py-3 backdrop-blur lg:left-64 lg:px-8">
        <div className="flex items-center gap-4">
          <Button type="button" onClick={save}>
            Save changes
          </Button>
          {status && <span className="text-sm text-green-700">{status}</span>}
          {error && <span className="text-sm text-accent">{error}</span>}
        </div>
      </div>
    </div>
  );
}
