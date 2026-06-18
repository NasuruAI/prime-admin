"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCall } from "@/lib/admin-client";

type Config = {
  provider: string;
  webhook_url: string;
  paystack_public_key: string;
  paystack_secret_set: boolean;
  flutterwave_public_key: string;
  flutterwave_secret_set: boolean;
  flutterwave_hash_set: boolean;
  last_webhook_at: string | null;
  last_webhook_event: string;
};

const selectCls =
  "h-10 w-full border border-ink/15 bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-ink/60";

export function PaymentsEditor() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [provider, setProvider] = useState("mock");
  const [psPub, setPsPub] = useState("");
  const [psSecret, setPsSecret] = useState("");
  const [flwPub, setFlwPub] = useState("");
  const [flwSecret, setFlwSecret] = useState("");
  const [flwHash, setFlwHash] = useState("");

  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);

  function load(data: Config) {
    setCfg(data);
    setProvider(data.provider);
    setPsPub(data.paystack_public_key);
    setFlwPub(data.flutterwave_public_key);
    setPsSecret("");
    setFlwSecret("");
    setFlwHash("");
  }

  useEffect(() => {
    adminCall<Config>("/payments/config/")
      .then(load)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  async function save() {
    setBusy(true);
    setError(null);
    setStatus(null);
    setTest(null);
    try {
      const body: Record<string, string> = {
        provider,
        paystack_public_key: psPub,
        flutterwave_public_key: flwPub,
      };
      // Only send secrets the admin actually typed (blank = keep existing).
      if (psSecret) body.paystack_secret_key = psSecret;
      if (flwSecret) body.flutterwave_secret_key = flwSecret;
      if (flwHash) body.flutterwave_secret_hash = flwHash;
      const updated = await adminCall<Config>("/payments/config/", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      load(updated);
      setStatus("Payment settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function testConnection() {
    setBusy(true);
    setTest(null);
    setError(null);
    try {
      const res = await adminCall<{ ok: boolean; message: string }>(
        "/payments/test/",
        { method: "POST" },
      );
      setTest(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed.");
    } finally {
      setBusy(false);
    }
  }

  function copyWebhook() {
    if (!cfg) return;
    navigator.clipboard?.writeText(cfg.webhook_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!cfg && !error) return <p className="text-sm text-ink/55">Loading…</p>;

  const secretPlaceholder = (set: boolean) =>
    set ? "•••••••• (set — leave blank to keep)" : "Paste your secret key";

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {status && <Banner tone="success">{status}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      {/* Provider */}
      <section className="admin-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-ink">
          Active provider
        </h2>
        <div className="max-w-xs">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className={selectCls}
          >
            <option value="mock">Mock (testing — no real charges)</option>
            <option value="paystack">Paystack</option>
            <option value="flutterwave">Flutterwave</option>
          </select>
        </div>
      </section>

      {/* Webhook URL */}
      <section className="admin-card p-6">
        <h2 className="mb-1 font-display text-base font-bold text-ink">
          Webhook URL
        </h2>
        <p className="mb-3 text-xs text-ink/50">
          Copy this and paste it into your provider dashboard&apos;s webhook
          settings (Paystack: Settings → API Keys &amp; Webhooks · Flutterwave:
          Settings → Webhooks). Your server must be reachable at this URL.
        </p>
        <div className="flex items-stretch gap-2">
          <code className="flex flex-1 items-center overflow-x-auto border border-ink/15 bg-surface px-3 py-2 text-xs text-ink">
            {cfg?.webhook_url}
          </code>
          <Button type="button" variant="ghost" onClick={copyWebhook}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-ink/50">Last webhook received:</span>
          {cfg?.last_webhook_at ? (
            <Badge tone="success">
              {new Date(cfg.last_webhook_at).toLocaleString()}
              {cfg.last_webhook_event ? ` · ${cfg.last_webhook_event}` : ""}
            </Badge>
          ) : (
            <Badge tone="warning">none yet</Badge>
          )}
        </div>
      </section>

      {/* Paystack keys */}
      <section className="admin-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
          Paystack keys
          {cfg?.paystack_secret_set && <Badge tone="success">secret set</Badge>}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Public key</label>
            <Input value={psPub} onChange={(e) => setPsPub(e.target.value)} placeholder="pk_..." />
          </div>
          <div>
            <label className={labelCls}>Secret key</label>
            <Input
              type="password"
              value={psSecret}
              onChange={(e) => setPsSecret(e.target.value)}
              placeholder={secretPlaceholder(cfg?.paystack_secret_set ?? false)}
            />
          </div>
        </div>
      </section>

      {/* Flutterwave keys */}
      <section className="admin-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
          Flutterwave keys
          {cfg?.flutterwave_secret_set && <Badge tone="success">secret set</Badge>}
          {cfg?.flutterwave_hash_set && <Badge tone="info">hash set</Badge>}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Public key</label>
            <Input value={flwPub} onChange={(e) => setFlwPub(e.target.value)} placeholder="FLWPUBK-..." />
          </div>
          <div>
            <label className={labelCls}>Secret key</label>
            <Input
              type="password"
              value={flwSecret}
              onChange={(e) => setFlwSecret(e.target.value)}
              placeholder={secretPlaceholder(cfg?.flutterwave_secret_set ?? false)}
            />
          </div>
          <div>
            <label className={labelCls}>
              Webhook secret hash (must match the dashboard)
            </label>
            <Input
              type="password"
              value={flwHash}
              onChange={(e) => setFlwHash(e.target.value)}
              placeholder={secretPlaceholder(cfg?.flutterwave_hash_set ?? false)}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </Button>
        <Button type="button" variant="ghost" onClick={testConnection} disabled={busy}>
          Test connection
        </Button>
        {test && (
          <span className={test.ok ? "text-sm text-green-700" : "text-sm text-accent"}>
            {test.ok ? "✓ " : "✗ "}
            {test.message}
          </span>
        )}
      </div>
    </div>
  );
}
