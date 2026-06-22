"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cloudinaryUrl } from "@/lib/env";

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

const SECTION_LABELS: Record<string, string> = {
  identity: "Store identity",
  currency: "Currency & pricing",
  tax: "Tax",
  features: "Features",
  content: "Content",
  ordering: "Chat to order",
};

const ACRONYMS: Record<string, string> = {
  url: "URL",
  id: "ID",
  fx: "FX",
  sku: "SKU",
  api: "API",
};

/** Turn `order_chat.telegram_url` into a friendly "Telegram URL" label. */
function friendlyLabel(key: string): string {
  const leaf = key.split(".").pop() ?? key;
  return leaf
    .split("_")
    .map((w) => ACRONYMS[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function sectionLabel(section: string): string {
  return (
    SECTION_LABELS[section] ??
    section.charAt(0).toUpperCase() + section.slice(1)
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors ${
        checked ? "bg-primary" : "bg-ink/20"
      }`}
    >
      <span
        className={`absolute h-5 w-5 bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Image upload for asset settings (e.g. the store logo) — stores a public_id. */
function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (publicId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(cloudinaryUrl(value));

  useEffect(() => {
    setPreview(cloudinaryUrl(value));
  }, [value]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      setPreview(url);
      onChange(publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-ink/10 bg-surface">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="text-[10px] text-ink/40">No image</span>
        )}
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <label
          className={`inline-flex h-9 cursor-pointer items-center border border-ink/15 bg-white px-4 text-sm font-medium transition ${
            busy
              ? "text-ink/40"
              : "text-ink hover:border-primary hover:text-primary"
          }`}
        >
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={onFile}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setPreview("");
            }}
            className="text-xs text-ink/50 transition hover:text-accent"
          >
            Remove
          </button>
        )}
        {error && <span className="text-xs text-accent">{error}</span>}
      </div>
    </div>
  );
}

export function SettingsEditor() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  // Raw text buffer for JSON fields so typing invalid intermediate JSON never
  // reverts or crashes; we only commit to `draft` when it parses.
  const [jsonText, setJsonText] = useState<Record<string, string>>({});
  const [jsonInvalid, setJsonInvalid] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const isDirty = (s: Setting) =>
    JSON.stringify(draft[s.key]) !== JSON.stringify(s.value);
  const dirtyCount = settings.filter(isDirty).length;

  async function save() {
    setStatus(null);
    setError(null);
    const changed: Record<string, unknown> = {};
    for (const s of settings) if (isDirty(s)) changed[s.key] = draft[s.key];
    if (Object.keys(changed).length === 0) {
      setStatus("No changes to save.");
      return;
    }
    setSaving(true);
    try {
      await adminCall("/storeconfig/settings/", {
        method: "PATCH",
        body: JSON.stringify({ values: changed }),
      });
      await load();
      setStatus(`Saved ${Object.keys(changed).length} change(s).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setDraft(Object.fromEntries(settings.map((s) => [s.key, s.value])));
    setJsonText(
      Object.fromEntries(
        settings
          .filter((s) => s.type === "json")
          .map((s) => [s.key, JSON.stringify(s.value)]),
      ),
    );
    setJsonInvalid({});
    setStatus(null);
  }

  const sections = [...new Set(settings.map((s) => s.section))];

  function field(s: Setting) {
    // Asset settings (logo / image public_ids) get an upload widget.
    if (s.key.endsWith("_public_id") || s.key.includes("logo")) {
      return (
        <ImageField
          value={String(draft[s.key] ?? "")}
          onChange={(pid) => setDraft((d) => ({ ...d, [s.key]: pid }))}
        />
      );
    }
    // Brand colours get a swatch + hex field.
    if (s.key.endsWith("_color")) {
      const value = String(draft[s.key] ?? "#000000");
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [s.key]: e.target.value }))
            }
            aria-label={`${s.key} colour picker`}
            className="h-10 w-12 cursor-pointer rounded-md border border-ink/15 bg-white p-1"
          />
          <Input
            value={value}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [s.key]: e.target.value }))
            }
            className="w-32 font-mono"
            placeholder="#6E0D25"
          />
        </div>
      );
    }
    if (s.type === "boolean") {
      return (
        <Toggle
          checked={Boolean(draft[s.key])}
          onChange={(v) => setDraft((d) => ({ ...d, [s.key]: v }))}
        />
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
    const numeric = s.type === "integer" || s.type === "decimal";
    return (
      <Input
        inputMode={numeric ? "decimal" : undefined}
        value={String(draft[s.key] ?? "")}
        onChange={(e) => setDraft((d) => ({ ...d, [s.key]: e.target.value }))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      {sections.map((section, i) => (
        <section key={section} className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-base font-bold text-ink">
                {sectionLabel(section)}
              </h2>
            </div>
          </div>
          <div className="divide-y divide-ink/[0.07]">
            {settings
              .filter((s) => s.section === section)
              .map((s) => {
                const dirty = isDirty(s);
                return (
                  <div
                    key={s.key}
                    className={`grid grid-cols-1 items-center gap-3 px-6 py-4 transition-colors sm:grid-cols-[1fr_minmax(0,1.6fr)] ${
                      dirty ? "bg-primary/[0.025]" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          {friendlyLabel(s.key)}
                        </span>
                        {dirty && (
                          <span
                            className="h-1.5 w-1.5 bg-accent"
                            title="Unsaved change"
                          />
                        )}
                      </div>
                      {s.description && (
                        <div className="mt-0.5 text-xs text-ink/50">
                          {s.description}
                        </div>
                      )}
                      <div className="mt-1 font-mono text-[10px] text-ink/30">
                        {s.key}
                      </div>
                    </div>
                    <div>{field(s)}</div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-ink/10 bg-white/90 px-4 py-3 backdrop-blur lg:left-64 lg:px-8">
        <div className="flex items-center gap-4">
          <Button type="button" onClick={save} disabled={saving || dirtyCount === 0}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {dirtyCount > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="text-sm text-ink/55 transition hover:text-ink"
            >
              Discard
            </button>
          ) : null}
          <span className="ml-auto text-sm">
            {error ? (
              <span className="text-accent">{error}</span>
            ) : status ? (
              <span className="text-green-700">{status}</span>
            ) : dirtyCount > 0 ? (
              <span className="text-ink/55">
                {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="text-ink/40">All changes saved</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
